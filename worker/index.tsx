import { renderToString } from "react-dom/server.browser";
import { ChoirPage } from "../src/ChoirPage";
import { SiteContext } from "../src/content/context";
import { site } from "../src/content/site";
import { siteContentSchema, contentPatchSchema } from "../src/content/schema";
import { readContent, saveContent } from "./content";
import { editorIdentity, writeIdentity, isLocalEditor, isLoopback } from "./auth";
import type { Env } from "./env";

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export const safeJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

async function limitedBody(request: Request, max = 250000) {
  if (Number(request.headers.get("Content-Length")) > max) throw new Error("too-large");
  const reader = request.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel(); throw new Error("too-large"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(bytes);
}

async function contentApi(request: Request, env: Env) {
  if (request.method === "GET" || request.method === "HEAD") return json(await readContent(env));
  if (!["PUT", "PATCH"].includes(request.method)) return json({ error: "Metoden stöds inte." }, 405);
  const editor = await writeIdentity(request, env);
  if (!editor) return json({ error: "Du behöver logga in som redaktör." }, 401);
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("Content-Type") ?? "")) return json({ error: "Använd application/json." }, 415);
  const revisionHeader = request.headers.get("If-Match") ?? "";
  if (!/^\d+$/.test(revisionHeader) || !Number.isSafeInteger(Number(revisionHeader))) return json({ error: "Läs den senaste versionen före publicering (If-Match)." }, 428);
  const revision = Number(revisionHeader);
  let input: unknown;
  try { input = JSON.parse(await limitedBody(request)); }
  catch (error) { return json({ error: error instanceof Error && error.message === "too-large" ? "Innehållet är för stort." : "Innehållet kunde inte läsas." }, error instanceof Error && error.message === "too-large" ? 413 : 400); }
  const parsed = request.method === "PATCH" ? contentPatchSchema.safeParse(input) : siteContentSchema.safeParse(input);
  if (!parsed.success) return json({ error: "Kontrollera fälten.", issues: parsed.error.issues }, 400);
  const current = await readContent(env);
  if (current.revision !== revision) return json({ error: "En annan redaktör har publicerat. Spara en kopia och läs in den senaste versionen." }, 409);
  const full = siteContentSchema.safeParse(request.method === "PATCH" ? { ...current.content, ...parsed.data } : parsed.data);
  if (!full.success) return json({ error: "Kontrollera fälten.", issues: full.error.issues }, 400);
  const result = await saveContent(env, full.data, revision, editor);
  return result ? json(result) : json({ error: "En annan redaktör har publicerat. Läs in den senaste versionen." }, 409);
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const isAdminHost = url.origin === env.ADMIN_ORIGIN;
  const isLocal = isLoopback(url);
  const adminPage = isAdminHost || (isLocal && url.pathname.startsWith("/admin"));
  if (url.hostname === `www.${new URL(env.PUBLIC_ORIGIN).hostname}`) return Response.redirect(`${env.PUBLIC_ORIGIN}${url.pathname}${url.search}`, 301);

  // Validate signed Access tokens even if an alternate route bypasses the Access front door.
  if (isAdminHost && !await editorIdentity(request, env)) {
    return new Response("Redaktörsinloggning krävs. Cloudflare Access måste vara konfigurerat för admin.dalslandskoren.se.", { status: 401, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  }
  if (url.pathname === "/api/public/content") return contentApi(request, env);
  if (url.pathname.startsWith("/api/admin/")) {
    const editor = await editorIdentity(request, env);
    if (!editor) return json({ error: "Inloggning krävs." }, 401);
    if (request.method !== "GET") return json({ error: "Metoden stöds inte." }, 405);
    if (url.pathname === "/api/admin/session") return json({ email: editor, local: isLocalEditor(url, env) });
    if (url.pathname === "/api/admin/history") {
      const result = await env.DB.prepare("SELECT revision, updated_at AS updatedAt, updated_by AS updatedBy FROM content_history ORDER BY revision DESC").all();
      return json({ versions: [...result.results, { revision: 0, updatedAt: null, updatedBy: "Startinnehåll" }] });
    }
    const match = /^\/api\/admin\/history\/(\d+)$/.exec(url.pathname);
    if (match) {
      if (match[1] === "0") return json({ content: site });
      const row = await env.DB.prepare("SELECT content FROM content_history WHERE revision = ?").bind(Number(match[1])).first<{content: string}>();
      return row ? json({ content: siteContentSchema.parse(JSON.parse(row.content)) }) : json({ error: "Versionen finns inte kvar." }, 404);
    }
    return json({ error: "Sidan finns inte." }, 404);
  }
  if (!["GET", "HEAD"].includes(request.method)) return json({ error: "Metoden stöds inte." }, 405);
  if (url.pathname === "/index.html") return Response.redirect(`${url.origin}/`, 301);
  if (!isLocal && !isAdminHost && url.pathname === "/admin") return Response.redirect(env.ADMIN_ORIGIN, 302);

  if (url.pathname === "/" || (adminPage && ["/admin", "/admin/"].includes(url.pathname))) {
    if (adminPage && !await editorIdentity(request, env)) return new Response("Lokal redigering är avstängd. Se .dev.vars.example.", { status: 401 });
    const shell = await env.ASSETS.fetch(new Request(new URL("/index.html", url), { method: "GET" }));
    if (!shell.ok) return new Response("Webbplatsens filer saknas.", { status: 503 });
    let html = await shell.text();
    if (adminPage) {
      html = html.replace("<!--site-data-->", '<script id="site-data" type="application/json">{"admin":true}</script>')
        .replace("<!--site-meta-->", '<meta name="robots" content="noindex,nofollow" />')
        .replace(/<title>.*?<\/title>/, "<title>Redaktör · Dalslandskören</title>");
    } else {
      const record = await readContent(env);
      const c = record.content;
      const title = `${c.brand.name} ${c.hero.secondaryTitle} – kör`;
      const description = `${c.brand.name} – ${c.hero.subtitle} Konserter, öppet rep och uppsjungning.`;
      html = html.replace('<div id="root"></div>', () => `<div id="root">${renderToString(<SiteContext.Provider value={c}><ChoirPage /></SiteContext.Provider>)}</div>`)
        .replace("<!--site-data-->", () => `<script id="site-data" type="application/json">${safeJson(record)}</script>`)
        .replace(/<title>.*?<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
        .replace("<!--site-meta-->", () => `<meta name="description" content="${escapeHtml(description)}" />
          <link rel="canonical" href="${escapeHtml(env.PUBLIC_ORIGIN)}/" />
          <meta property="og:title" content="${escapeHtml(title)}" /><meta property="og:description" content="${escapeHtml(description)}" />
          <meta property="og:type" content="website" /><meta property="og:url" content="${escapeHtml(env.PUBLIC_ORIGIN)}/" />
          <meta property="og:locale" content="sv_SE" /><meta property="og:image" content="${escapeHtml(new URL(c.hero.image, env.PUBLIC_ORIGIN).href)}" />
          <meta name="twitter:card" content="summary_large_image" />`);
    }
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
  }
  const asset = await env.ASSETS.fetch(request);
  if (asset.status === 404) return new Response("Sidan finns inte.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return asset;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    let response: Response;
    try { response = await route(request, env); }
    catch (error) { console.error("Request failed", error instanceof Error ? error.message : "unknown"); response = json({ error: "Webbplatsen kunde inte nå innehållet. Försök igen senare." }, 503); }
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'");
    if (new URL(request.url).protocol === "https:") headers.set("Strict-Transport-Security", "max-age=31536000");
    if (new URL(request.url).origin === env.ADMIN_ORIGIN || new URL(request.url).pathname.startsWith("/admin")) headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(request.method === "HEAD" ? null : response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
