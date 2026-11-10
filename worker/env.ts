export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  PUBLIC_ORIGIN: string;
  ADMIN_ORIGIN: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  EDITOR_EMAILS?: string;
  SITE_CONTENT_API_KEY?: string;
  LOCAL_EDITOR?: string;
}
