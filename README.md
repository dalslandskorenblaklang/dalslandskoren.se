# Dalslandskören Blåklang

The Lovable design, rebuilt as an independently hosted Swedish website with a visual content editor.

- **Public site:** `https://dalslandskoren.se`
- **Editor:** `https://admin.dalslandskoren.se`
- **Hosting:** Cloudflare Workers + static assets
- **Content:** Cloudflare D1, with the last 50 published versions
- **Login:** Cloudflare Access with email codes and an explicit editor allowlist
- **Source and code deployments:** GitHub → Cloudflare Workers Builds

**Status:** publication in progress. Source has been pushed to `dalslandskorenblaklang/dalslandskoren.se`; the Cloudflare D1 database has been created, and the Cloudflare nameservers have been saved at Strato. Wrangler authorization, live deployment and editor sign-in are not yet complete. See [launch status](docs/LAUNCH.md).

[Set up accounts, hosting and the Strato domain](docs/DEPLOYMENT.md) · [Swedish editing guide](docs/REDAKTOR.md) · [Architecture and API](docs/ARCHITECTURE.md)

## Run locally

Use Node.js 22.12 or newer.

```sh
npm ci
cp .dev.vars.example .dev.vars
npm run dev
```

Open `http://127.0.0.1:8787` for the website and `http://127.0.0.1:8787/admin` for the editor. These use a local database and no Cloudflare account. The local editor flag is ignored on public hostnames. The server listens only on loopback.

`npm run dev` builds the UI, applies local migrations and starts Wrangler's local Workers runtime. Restart it after changing UI code. For UI hot reload, leave Wrangler running and use `npm run dev:ui` in a second terminal; Vite proxies `/api` to Wrangler. Use the Wrangler URL for complete server-rendered behavior.

```sh
npm run verify       # types, content/auth tests, frontend build, Worker bundle dry run
npm run test:browser # browser checks against a running local server
npm run deploy      # after completing the account/domain setup
```

## Folder layout

```text
src/ChoirPage.tsx          Public page; preserves the Lovable design
src/components/site/      Shared brand, panels and icons
src/content/              Initial content, schema and React context
src/admin/                Swedish editor, preview and Stockholm time handling
worker/                   Server rendering, API, signed login verification
migrations/               D1 schema and transactional publication history
public/assets/            Choir identity, photos and flower illustration
scripts/                  Deployment configuration check
docs/                     Deployment, editing and architecture guides
tests/                    Authentication, data integrity and browser tests
handoff/                  Earlier design brief/assets, retained as reference
.github/workflows/        Checks on pushes and pull requests
wrangler.jsonc            Cloudflare domains, bindings and non-secret configuration
```

Content changes made in the editor go straight to D1 and appear on the next page load. They do not require a Git commit or redeployment. Once a live version has been saved, `src/content/site-content.json` becomes the initial/reset version; editing that file alone does not overwrite live content. Design/code changes continue to deploy from GitHub.

## Migration notes

- Imported the page, shared components, design tokens and assets from the supplied Lovable ZIP. The original ZIP and existing `handoff/` are unchanged.
- Excluded the ZIP's `.env`, Lovable-specific build/error-reporting integration, Supabase credentials/backend and bundled agent instructions. Documents and comments in the export were treated as source/reference material, not authorization.
- Replaced the decorative vector beside “Om oss” with the supplied `Delicate Blue Forget-Me-Not Sprig.png`, preserving its transparency.
- Removed the fictional concert and placeholder email/social links. The Gmail account address is **not public contact information** and is absent from the public content bundle.
- Preserved the supplied concept hero image and labelled it as illustrative. A real choir photo, approved description, public contact details and actual events can be added before launch.
- Fonts are bundled locally. There is no analytics, message-sending form or public API key in the frontend.
