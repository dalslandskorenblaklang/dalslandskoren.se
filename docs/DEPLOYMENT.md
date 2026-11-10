# Hosting and domain setup

This is the one-time setup for the website owner/web maintainer. The PR team only needs the [editing guide](REDAKTOR.md) afterwards.

This page documents setup and future redeployment. For completed steps and remaining launch work, see [launch status](LAUNCH.md). Use the configured Cloudflare account and the existing `dalslandskorenblaklang/dalslandskoren.se` repository. Do not send passwords, login codes or API secrets in chat.

## 1. Create the choir's accounts

Use **dalslandskorenblaklang@gmail.com** for the initial GitHub and Cloudflare account emails. Complete their verification and recovery setup in your own browser.

- [GitHub signup](https://github.com/signup)
- [Cloudflare signup](https://dash.cloudflare.com/sign-up)

Create a **private** GitHub repository named `dalslandskoren.se`, without an initial README. Repository privacy does not prevent the hosted website from being public. Use the choir's account/repository; do not accidentally push to a personal connected account.

From this folder, after signing the GitHub CLI into the choir's account:

```sh
gh auth login
gh auth status
git init -b main
git add .
git commit -m "Prepare independent choir website and editor"
```

Git needs an author identity for the commit. If it asks, set the repository-local `user.name` to the choir/maintainer name and `user.email` to the choir account email or that account's GitHub-provided noreply address. Then retry the commit. `.gitignore` excludes local secrets, database state and dependencies.

Copy the actual remote URL from the new repository's GitHub page. Replace the example below with it:

```sh
git remote add origin https://github.com/YOUR-CHOIR-USERNAME/dalslandskoren.se.git
git push -u origin main
```

GitHub's HTTPS remote requires CLI/browser authentication or a suitable credential, not the account password.

## 2. Add the existing domain to Cloudflare

Keep Strato as the registrar. A transfer is unnecessary.

1. In Cloudflare, add `dalslandskoren.se` as an existing domain. Select the available plan that suits the choir; this implementation needs no paid-only feature.
2. Review imported DNS records. Save a copy of Strato's current records and preserve any needed mail/verification records. Automatic scans can miss records.
3. If DNSSEC is active at Strato, follow Cloudflare's migration instructions to remove the old DS/DNSSEC configuration before changing nameservers.
4. Cloudflare assigns **two specific nameservers**. Copy those exact values; they cannot be determined before the zone is created.
5. In Strato's domain DNS/nameserver settings, choose your own/external nameservers and replace the existing nameservers with Cloudflare's assigned pair. This changes DNS hosting, not registration.
6. Wait for Cloudflare to mark the zone **Active**. Re-enable DNSSEC using Cloudflare's instructions and the new DS information if desired.

Do not create guessed A records or point the domain to GitHub Pages. The Worker custom domains in `wrangler.jsonc` will create the website bindings after the zone is active. If Strato parking A/AAAA/CNAME records already occupy `@`, `www` or `admin`, remove/replace those conflicting website records when configuring Worker custom domains. Keep unrelated records, especially MX/TXT records needed for email.

References: [Cloudflare nameserver migration](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/) and [Strato DNS settings](https://www.strato.se/faq/domaen/vilka-dns-poster-finns-tillgaengliga-hos-strato-och-hur-kan-jag-hantera-dem/).

## 3. Create the content database

In a terminal in this folder:

```sh
npx wrangler login
npx wrangler whoami
npx wrangler d1 create dalslandskoren-content
```

Check that Wrangler shows the **choir's** Cloudflare account. Copy the returned database UUID into `d1_databases[0].database_id` in `wrangler.jsonc`, replacing the all-zero placeholder. Keep the binding named `DB` and the database name unchanged.

The site starts from `src/content/site-content.json`. The first editor publication creates the live content record. No Supabase/Lovable subscription or credential is needed.

## 4. Configure editor sign-in before launch

Cloudflare Zero Trust / Access provides email-code login, so Google Workspace is not required.

1. Create the choir's Zero Trust team and note its domain, such as `your-choir.cloudflareaccess.com`.
2. Enable **One-time PIN** as an authentication method.
3. Create a **self-hosted Access application** for the whole hostname `admin.dalslandskoren.se`, including all paths. Leave the path restriction empty. Use a bounded session duration such as 8 hours.
4. Add an **Allow** policy containing the exact email `dalslandskorenblaklang@gmail.com`. Add each PR editor's own email separately when ready. Do not use an “Everyone” or bypass policy.
5. Copy the application's **Application Audience (AUD) tag**.
6. Update `vars` in `wrangler.jsonc`:

| Setting | Value |
| --- | --- |
| `ACCESS_TEAM_DOMAIN` | Your team hostname, without `https://` or a trailing slash |
| `ACCESS_AUD` | The admin application's AUD tag |
| `EDITOR_EMAILS` | Comma-separated list of the allowed editor email addresses |

The app verifies the Access token's signature, issuer, audience and expiry, then checks `EDITOR_EMAILS`. Both the Access policy **and** this allowlist must contain an editor. Missing configuration leaves editing closed. Static files on the admin hostname pass through the same checks.

Never put `LOCAL_EDITOR=true` in Cloudflare production settings. It is for the ignored local `.dev.vars` file only. The public website and public content GET API do not require login; their browser code has no editing credential.

Reference: [email PIN login](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/) and [signed token validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

## 5. First deployment

If Access onboarding is deferred, use `npm run deploy:public` instead. This requires both `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` to remain empty. The public website works, while the admin host and editor login stay closed. This does not bypass authentication or expose a local editor flag. When Access is ready, configure both values and use the normal `npm run deploy` command.

After completing the configuration:

```sh
npm ci
npm run deploy
```

This checks configuration, runs validation, applies remote D1 migrations and deploys the Worker with these custom domains:

| Hostname | Result |
| --- | --- |
| `dalslandskoren.se` | Public website |
| `www.dalslandskoren.se` | Redirect to the public website |
| `admin.dalslandskoren.se` | Access-protected editor |

Cloudflare provisions DNS/certificates for Worker custom domains. Wait for them to become active. `workers.dev` and version preview URLs are disabled in this configuration. The admin page and admin APIs also reject requests without a valid token independently of the front-door policy.

Verify in a private browser window:

1. Public website loads over HTTPS, including the new forget-me-not illustration beside “Om oss”.
2. The `www` hostname redirects to the main domain.
3. The admin hostname asks for an email code; an unlisted address cannot enter.
4. An allowed editor can change text, preview it, publish it and see it on a fresh public page load.
5. History contains the published version. Load an earlier version as a draft to verify recovery without publishing it.
6. Account-only Gmail does not appear in public contact information.

The supplied hero is still a labelled concept illustration. Replace it with an approved choir photo when one is available, and review the draft presentation and real contact/event details.

## 6. Connect GitHub for subsequent code deployments

In the deployed Worker's **Settings → Build**, connect the private choir repository and choose `main` as the production branch. Restrict the GitHub installation to the intended repository.

Use these commands:

| Build setting | Value |
| --- | --- |
| Build command | `npm run deploy:check && npm run verify` |
| Deploy command | `npm run db:remote && npx wrangler deploy` |
| Root directory | Repository root |
| Node version | 22 or newer supported LTS |

Use Cloudflare's managed build credential with the permissions needed for this Worker and D1 migrations. Keep this in Cloudflare, not in GitHub source or a `VITE_` environment variable. If an explicitly scoped token is required by the account setup, grant only the Worker/D1/zone access needed for the commands.

For the initial setup, disable automatic builds on other branches. This repository has one production D1 binding; preview deployments must not share it for editable staging. Create separate bindings and Access configuration before adding a staging environment.

Commit and push the real D1/Access configuration after the first deployment. Cloudflare can then deploy future pushes. GitHub Actions runs a separate verification workflow without production credentials. PR-team content publications remain in D1 and are unaffected by code deployments.

Reference: [Workers Git integration](https://developers.cloudflare.com/workers/ci-cd/builds/) and [build/deploy configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## Optional API key

Normal editors do not need a key. If a trusted server-side tool needs to update content, set an optional secret:

```sh
npx wrangler secret put SITE_CONTENT_API_KEY
```

Enter a long random secret at Wrangler's hidden prompt. Never put it in browser code, `wrangler.jsonc`, Git or chat. See [API details](ARCHITECTURE.md). Rotate it by replacing the secret; regular editor email logins are unaffected.

## When Google Workspace is ready

Add `admin@dalslandskoren.se` to the Cloudflare Access policy and `EDITOR_EMAILS`, deploy the configuration and verify its login before removing the temporary account email. Update the GitHub and Cloudflare owner account emails/recovery settings in their own dashboards. Existing repositories, content, domain registration and hosting can remain in place.

Workspace email is separate from website hosting. Add Google's supplied MX/SPF/DKIM/verification records in **Cloudflare DNS** once Cloudflare is authoritative; changing the website does not create a mailbox.
