import { site, type SiteContent } from "../src/content/site";
import { siteContentSchema } from "../src/content/schema";
import type { Env } from "./env";

export interface ContentRecord { content: SiteContent; revision: number; updatedAt: string | null }
interface Row { content: string; revision: number; updated_at: string }
export async function readContent(env: Env): Promise<ContentRecord> {
  const row = await env.DB.prepare("SELECT content, revision, updated_at FROM site_content WHERE id = 'main'").first<Row>();
  return row ? { content: siteContentSchema.parse(JSON.parse(row.content)), revision: row.revision, updatedAt: row.updated_at }
    : { content: site, revision: 0, updatedAt: null };
}

export async function saveContent(env: Env, content: SiteContent, revision: number, editor: string): Promise<ContentRecord | null> {
  const updatedAt = new Date().toISOString();
  // Conditional writes are atomic. History is recorded in the same transaction by DB triggers.
  const query = revision === 0
    ? env.DB.prepare(`INSERT INTO site_content (id, content, revision, updated_at, updated_by)
        VALUES ('main', ?, 1, ?, ?) ON CONFLICT(id) DO NOTHING RETURNING revision`)
        .bind(JSON.stringify(content), updatedAt, editor)
    : env.DB.prepare(`UPDATE site_content SET content = ?, revision = revision + 1,
        updated_at = ?, updated_by = ? WHERE id = 'main' AND revision = ? RETURNING revision`)
        .bind(JSON.stringify(content), updatedAt, editor, revision);
  const result = await query.first<{revision: number}>();
  return result ? { content, revision: result.revision, updatedAt } : null;
}
