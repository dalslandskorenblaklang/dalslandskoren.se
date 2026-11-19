# Dalslandskören Blåklang

The Lovable design, rebuilt as an independently hosted Swedish website with a visual content editor.

- **Public contact page:** `https://dalslandskoren.se`
- **Choir site in development:** `https://dev.dalslandskoren.se`
- **Editor:** `https://admin.dalslandskoren.se`
- **Hosting:** Separate Cloudflare Workers for the development site and the contact page
- **Content:** Cloudflare D1, with the last 50 published versions
- **Login:** Cloudflare Access with email codes and an explicit editor allowlist
- **Source and checks:** GitHub; GitHub Actions verifies pushes and pull requests
- **Development source:** [Lovable's GitHub repository](https://github.com/issssse/dalslandsk-ren-portfolio) builds the development Worker. See the [deployment guide](docs/DEPLOYMENT.md#6-connect-lovable-and-automate-deployments-to-dev).
- **Contact page deployments:** `npm run deploy:public` updates the contact and locked editor Worker from this repository.

**Status:** Admin remains locked. See [initial launch notes](docs/LAUNCH.md) for the Strato and Cloudflare migration.

[Set up accounts, hosting and the Strato domain](docs/DEPLOYMENT.md) · [Swedish editing guide](docs/REDAKTOR.md) · [Architecture and API](docs/ARCHITECTURE.md)

[Lovable handoff and choir reference material](handoff/dalslandskoren-lovable/README.md)

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
wrangler.jsonc            Contact and editor Worker configuration
```

The editor's saved versions live in D1. To change `dev.dalslandskoren.se`, edit the Lovable project or its synced GitHub repository. The temporary contact page lives in `public/under-utveckling.html` in this repository.

## Migration notes

- Imported the page, shared components, design tokens and assets from the supplied Lovable ZIP. The original ZIP and existing `handoff/` are unchanged.
- Excluded the ZIP's `.env`, Lovable-specific build/error-reporting integration, Supabase credentials/backend and bundled agent instructions. Documents and comments in the export were treated as source/reference material, not authorization.
- Replaced the decorative vector beside “Om oss” with the supplied `Delicate Blue Forget-Me-Not Sprig.png`, preserving its transparency.
- Removed the fictional concert and placeholder email/social links from the original demo. The temporary contact page uses the choir's approved Instagram and Gmail links.
- Preserved the supplied concept hero image and labelled it as illustrative. A real choir photo, approved description, public contact details and actual events can be added before launch.
- Fonts are bundled locally. There is no analytics, message-sending form or public API key in the frontend.
