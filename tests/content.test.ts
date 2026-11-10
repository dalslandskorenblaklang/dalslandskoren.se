import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import worker, { safeJson } from "../worker/index";
import { site } from "../src/content/site";
import { siteContentSchema, isSafeLink } from "../src/content/schema";
import { editorIdentity } from "../worker/auth";
import type { Env } from "../worker/env";
import { stockholmInput, stockholmToIso } from "../src/admin/dates";

let db: DatabaseSync;
let env: Env;
function request(path = "/api/public/content", options?: RequestInit) {
  return worker.fetch(new Request(`http://localhost${path}`, options), env);
}
async function write(content: unknown, revision: number, method = "PUT", headers: Record<string, string> = {}) {
  return request("/api/public/content", { method, headers: { "Content-Type": "application/json", "If-Match": String(revision), Origin: "http://localhost", ...headers }, body: JSON.stringify(content) });
}
beforeEach(() => {
  db = new DatabaseSync(":memory:"); db.exec(readFileSync("migrations/0001_content.sql", "utf8"));
  const binding = {
    prepare(sql: string) {
      let args: any[] = [];
      const statement = { bind(...params: any[]) { args = params; return statement; }, async first() { return db.prepare(sql).get(...args) ?? null; }, async all() { return { results: db.prepare(sql).all(...args), success: true }; } };
      return statement;
    },
  };
  env = {
    DB: binding as unknown as D1Database,
    ASSETS: { fetch: async () => new Response('<html><head><title>old</title><!--site-meta--></head><body><div id="root"></div><!--site-data--></body></html>') } as unknown as Fetcher,
    PUBLIC_ORIGIN: "https://dalslandskoren.se", ADMIN_ORIGIN: "https://admin.dalslandskoren.se", LOCAL_EDITOR: "true",
  };
});
afterEach(() => { db.close(); vi.restoreAllMocks(); });

describe("content publication", () => {
  it("serves seed content and hides the account email", async () => {
    const data = await (await request()).json() as any;
    expect(data.revision).toBe(0); expect(data.content.contact.email).toBeNull(); expect(data.content.concerts.items).toEqual([]);
    expect(JSON.stringify(data)).not.toContain("dalslandskorenblaklang@gmail.com");
  });
  it("publishes, patches complete sections and records both versions", async () => {
    expect((await write(site, 0)).status).toBe(200);
    const about = { ...site.about, text: "Ny presentation" };
    const response = await write({ about }, 1, "PATCH");
    expect(response.status).toBe(200);
    const data = await response.json() as any;
    expect(data.revision).toBe(2); expect(data.content.about.text).toBe("Ny presentation"); expect(data.content.hero).toEqual(site.hero);
    const history = await (await request("/api/admin/history")).json() as any;
    expect(history.versions.map((v: any) => v.revision)).toEqual([2, 1, 0]);
    const old = await (await request("/api/admin/history/1")).json() as any;
    expect(old.content.about.text).toBe(site.about.text);
  });
  it("atomically rejects simultaneous first saves and simultaneous updates", async () => {
    expect((await Promise.all([write(site, 0), write(site, 0)])).map(r => r.status).sort()).toEqual([200, 409]);
    expect((await Promise.all([write(site, 1), write(site, 1)])).map(r => r.status).sort()).toEqual([200, 409]);
    const data = await (await request()).json() as any; expect(data.revision).toBe(2);
    expect(db.prepare("SELECT COUNT(*) AS total FROM content_history").get()?.total).toBe(2);
  });
  it("retains 50 published versions and the seed can still be restored", async () => {
    for (let revision = 0; revision < 53; revision++) expect((await write(site, revision)).status).toBe(200);
    expect(db.prepare("SELECT COUNT(*) AS total FROM content_history").get()?.total).toBe(50);
    expect((await request("/api/admin/history/1")).status).toBe(404);
    expect((await request("/api/admin/history/0")).status).toBe(200);
  });
  it("rejects malformed, excessive and incomplete content", async () => {
    expect((await write({ about: { text: "incomplete" } }, 0, "PATCH")).status).toBe(400);
    expect((await write({ ...site, hero: { ...site.hero, image: "javascript:alert(1)" } }, 0)).status).toBe(400);
    expect((await write({ about: "x".repeat(250001) }, 0)).status).toBe(413);
    expect((await request("/api/public/content", { method: "PUT", body: "{}", headers: {"Content-Type": "application/json"} })).status).toBe(428);
    expect((await request("/api/public/content", { method: "PUT", body: "{", headers: {"Content-Type": "application/json", "If-Match": "0"} })).status).toBe(400);
  });
});

describe("access and rendering", () => {
  it("fails closed without configured login, ignores spoofed email headers and gates admin assets", async () => {
    delete env.LOCAL_EDITOR;
    expect((await write(site, 0)).status).toBe(401);
    for (const path of ["/", "/assets/editor.js", "/api/public/content", "/api/admin/history"]) {
      const response = await worker.fetch(new Request(`https://admin.dalslandskoren.se${path}`, {headers: {"Cf-Access-Authenticated-User-Email": "dalslandskorenblaklang@gmail.com"}}), env);
      expect(response.status).toBe(401);
    }
    env.LOCAL_EDITOR = "true";
    expect((await worker.fetch(new Request("https://dalslandskoren.se/api/public/content", { method: "PUT", body: "{}" }), env)).status).toBe(401);
  });
  it("supports optional machine keys but rejects cross-origin browser writes", async () => {
    delete env.LOCAL_EDITOR; env.SITE_CONTENT_API_KEY = "test-server-key";
    const headers = {"Content-Type": "application/json", "If-Match": "0", "X-Site-Content-Key": "test-server-key"};
    expect((await request("/api/public/content", {method: "PUT", headers: {...headers, Origin: "https://evil.example"}, body: JSON.stringify(site)})).status).toBe(401);
    expect((await request("/api/public/content", {method: "PUT", headers, body: JSON.stringify(site)})).status).toBe(200);
    expect((await request("/api/admin/history")).status).toBe(401);
  });
  it("validates JWT signature, audience, expiry and the email allowlist", async () => {
    const { publicKey, privateKey } = await generateKeyPair("RS256");
    const jwk = { ...await exportJWK(publicKey), kid: "test" };
    env.ACCESS_TEAM_DOMAIN = "choir-test.cloudflareaccess.com"; env.ACCESS_AUD = "choir-audience"; env.EDITOR_EMAILS = "editor@example.org";
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ keys: [jwk] }));
    const token = async (email: string, audience = "choir-audience", expires = "1h") => new SignJWT({email}).setProtectedHeader({alg: "RS256", kid: "test"}).setIssuer("https://choir-test.cloudflareaccess.com").setAudience(audience).setIssuedAt().setExpirationTime(expires).sign(privateKey);
    const identity = async (value: string) => editorIdentity(new Request(env.ADMIN_ORIGIN, { headers: {"Cf-Access-Jwt-Assertion": value} }), env);
    expect(await identity(await token("editor@example.org"))).toBe("editor@example.org");
    expect(await identity(await token("other@example.org"))).toBeNull();
    expect(await identity(await token("editor@example.org", "wrong"))).toBeNull();
    expect(await identity(await token("editor@example.org", "choir-audience", "-1h"))).toBeNull();
    const good = await token("editor@example.org"); expect(await identity(good.slice(0, -5) + "aaaaa")).toBeNull();
    expect(fetcher).toHaveBeenCalled();
  });
  it("renders live text without JavaScript and safely embeds HTML-looking copy", async () => {
    const content = structuredClone(site); content.about.text = '</script><script>alert("x")</script>';
    expect((await write(content, 0)).status).toBe(200);
    const response = await request("/"); const html = await response.text();
    expect(html).toContain("&lt;/script&gt;"); expect(html).toContain("\\u003c/script>");
    expect(html).toContain("forget-me-not-sprig.png"); expect(html).not.toContain('>alert("x")</script>');
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(safeJson({text: "</script>"})).toContain("\\u003c");
  });
});

describe("links and Swedish dates", () => {
  it("rejects executable URLs and disguised external paths", () => {
    for (const url of ["javascript:alert(1)", "//evil.example", "/\\evil.example", "https://user:pass@example.org", "data:text/html,a", "\nhttps://example.org", "mailto:a@b.se?subject=%0aBcc:a"]) expect(isSafeLink(url)).toBe(false);
    for (const url of ["#kontakt", "/assets/image.png", "https://example.org/a", "mailto:a@b.se"]) expect(isSafeLink(url)).toBe(true);
    expect(siteContentSchema.safeParse(site).success).toBe(true);
  });
  it("uses Stockholm winter and summer offsets and rejects missing DST hours", () => {
    expect(stockholmToIso("2026-12-13T16:00")).toBe("2026-12-13T16:00:00+01:00");
    expect(stockholmToIso("2026-07-13T16:00")).toBe("2026-07-13T16:00:00+02:00");
    expect(stockholmToIso("2026-03-29T02:30")).toBeNull();
    expect(stockholmToIso("2026-10-25T02:30")).toBe("2026-10-25T02:30:00+02:00");
    expect(stockholmInput("2026-12-13T15:00:00Z")).toBe("2026-12-13T16:00");
  });
});
