import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Env } from "./env";
import { matchesApiKey } from "../src/content/schema";

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
export const isLoopback = (url: URL) => ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
export const isLocalEditor = (url: URL, env: Env) => isLoopback(url) && env.LOCAL_EDITOR === "true";

export async function editorIdentity(request: Request, env: Env): Promise<string | null> {
  const url = new URL(request.url);
  if (isLocalEditor(url, env)) return "local-development";
  if (url.origin !== env.ADMIN_ORIGIN || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN)) return null;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;
  try {
    const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`;
    let keys = keySets.get(issuer);
    if (!keys) { keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)); keySets.set(issuer, keys); }
    const { payload } = await jwtVerify(token, keys, { issuer, audience: env.ACCESS_AUD, algorithms: ["RS256"] });
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    const allowed = (env.EDITOR_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    return email && allowed.includes(email) ? email : null;
  } catch { return null; }
}

export async function writeIdentity(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  const url = new URL(request.url);
  if (origin && origin !== url.origin) return null;
  if (origin) return editorIdentity(request, env);
  const editor = await editorIdentity(request, env);
  if (editor) return editor;
  return await matchesApiKey(request.headers.get("X-Site-Content-Key"), env.SITE_CONTENT_API_KEY) ? "api-key" : null;
}
