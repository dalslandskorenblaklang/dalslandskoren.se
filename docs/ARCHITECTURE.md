# Architecture and content API

## Request flow

The public website, admin application and API run in one Cloudflare Worker. Its static-assets binding serves the Vite output; the Worker executes first on every request so the admin hostname cannot bypass authentication through an asset URL.

Public HTML is rendered with React on the server using current D1 content and hydrated with the same safely escaped JSON. Visitors and search engines receive the actual page text without waiting for JavaScript. HTML and content APIs use `Cache-Control: no-store`, so new loads see publications. Already open public tabs update on reload.

The editor is a separate lazy-loaded frontend module. It uses a same-origin API and the Cloudflare Access session. Signed JWTs are verified with `jose`, against the team certificate set, issuer, application audience, expiry and the configured email allowlist. An asserted email header alone is never accepted. Cross-origin browser writes are rejected. No admin API allows anonymous editing or unrestricted CORS.

All three hostnames are configured as Worker custom domains. `www` redirects to the apex. Public `/admin` redirects to the protected admin hostname. Locally, `/admin` works only with `LOCAL_EDITOR=true` and a loopback request URL. Local dev listens on `127.0.0.1`; `wrangler.jsonc` explicitly overrides the dev upstream host so Worker custom-domain routing does not hide the loopback hostname.

## Content storage and versioning

`src/content/site-content.json` supplies revision 0 until the first publication. From then on D1 `site_content` holds the current record. A code deployment does not overwrite it.

A first save uses `INSERT ... ON CONFLICT DO NOTHING`. Later saves use `UPDATE ... WHERE revision = ?`. These are atomic compare-and-swap operations: even simultaneous requests cannot overwrite a newer revision. Database triggers record the published content and editor in `content_history` in the same transaction. The last 50 publications are retained. An initial-content entry is also available as version 0.

Loading history in the editor only changes its local draft. Publication still uses the current live revision, creating a new history entry. Downloaded JSON copies can be imported as drafts. D1's separate database backup/recovery facilities can be enabled/used by the account owner as needed; this application does not push content back to GitHub.

Only public website content belongs in the content document. Do not put passwords or keys in text fields, editorial notes or image URLs. The JSON is delivered to visitors. Editor emails/timestamps in version history are restricted to admin APIs.

## API

### `GET /api/public/content`

Public read; no credential needed:

```json
{
  "content": { "...": "full site content" },
  "revision": 3,
  "updatedAt": "2026-11-10T12:00:00.000Z"
}
```

### `PUT /api/public/content`

Replace the full document. `PATCH` replaces the supplied **complete top-level sections**. It does not deep-merge fields or append array items. Both methods validate against `src/content/schema.ts`.

Required headers:

```text
Content-Type: application/json
If-Match: 3
```

Use the integer revision from the latest GET. The visual editor sends its signed Access session through the protected admin origin. Trusted non-browser tools can instead call the public site's endpoint with the optional `X-Site-Content-Key` header, matched against the Worker secret `SITE_CONTENT_API_KEY`. No key is configured by default. Browser requests with an Origin header must use same-origin editor authentication; the key is never a browser credential.

Example PATCH body:

```json
{
  "about": {
    "id": "om-oss",
    "title": "Om oss",
    "text": "En uppdaterad presentation av kören."
  }
}
```

| Response | Meaning |
| --- | --- |
| 200 | Saved; returns the full record with its new revision |
| 400 | Invalid JSON, incomplete section or invalid content |
| 401 | Missing/invalid editor session or key, or rejected Origin |
| 409 | Revision conflict; read again and reconcile the draft |
| 413 | Body exceeds 250,000 bytes, including streamed bodies |
| 415 | Content type is not JSON |
| 428 | Missing/invalid numeric `If-Match` |
| 503 | Storage/runtime temporarily unavailable |

`GET /api/admin/session`, `GET /api/admin/history`, and `GET /api/admin/history/:revision` require editor authentication. A machine API key grants content writes only, never history/session access. Unknown admin endpoints return 404. Methods other than the supported methods return 405.

## Local development and tests

`npm run dev` builds the frontend, applies local D1 migrations, and starts the actual Workers runtime. `.dev.vars` contains only local settings; copy its tracked example first. The placeholder database UUID is sufficient for local simulation and dry-run bundling, but intentionally fails `npm run deploy:check`.

`npm run verify` runs TypeScript, unit/integration tests backed by in-memory SQLite using the real migration and triggers, a Vite production build and Wrangler's deployment dry run. Tests cover optimistic concurrency, history retention, schema/URL validation, payload size, credential checks, JWT verification, safe HTML bootstrapping and Stockholm DST conversion.

For browser checks, install Chromium with `npx playwright install chromium`, start `npm run dev`, then run `npm run test:browser` in another terminal. The browser test confirms it is talking to local editor mode before writing data, checks desktop/mobile overflow and image loading, exercises previews and publication, and restores the initial local content afterwards. Screenshots are placed in ignored `test-results/`.

## Boundaries

- Image uploads are not included; editors can change image URLs, and maintainers add hosted files through the repository.
- There is no email-sending service, booking engine, analytics or public visitor login.
- Runtime content has one document and one site-wide editor role. All allowed editors can publish the whole page.
- An editor draft lives in its current browser tab until published or downloaded.
- Cloudflare Access, certificate issuance, live account permissions and domain propagation must be verified after account setup. Local tests cannot verify those external services.
