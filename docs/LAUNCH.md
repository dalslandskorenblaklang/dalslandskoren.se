# Launch status — 10 November 2026

The website is deployed and works over HTTPS at:

**https://dalslandskoren.cvi-c27.workers.dev**

The custom domains `dalslandskoren.se`, `www.dalslandskoren.se` and `admin.dalslandskoren.se` are attached to the production Worker. Public DNS still returns Strato's old nameservers and parking page at the last check. Cloudflare is waiting for the Strato/registry nameserver change to propagate. Do not treat the apex domain as verified live until a fresh public load shows the choir website and the `www` redirect works.

## Deployed resources

- GitHub: https://github.com/dalslandskorenblaklang/dalslandskoren.se — branch `main`.
- Source was pushed using the user's existing GitHub SSH access. GitHub Actions checks passed for the source commits before launch.
- Cloudflare account selected and authorized by the user: `cvi`, account ID `3c27342e2aebba74d1a0e503d92c324b`.
- Worker: `dalslandskoren`; deployment version `17b17185-fdf5-410c-999e-0e36b183b888`.
- D1 database: `dalslandskoren-content`, UUID `7b05dbee-f286-4304-99c3-49629c0b05f9`.
- Remote migration `0001_content.sql` applied successfully.
- Strato confirmed the saved nameservers `eugene.ns.cloudflare.com` and `sarah.ns.cloudflare.com`.
- The old imported parking A/AAAA records for the apex and CNAME for `www` were backed up and replaced by Worker-managed domain bindings. All six mail-related records were retained.
- Full pre-change Cloudflare DNS export: `dalslandskoren.se-before-launch.zone`. The original Strato parking records are also documented in `DNS-BEFORE-MIGRATION.md`.
- No DNSSEC DS record was published when checked before the migration. No DNSSEC setting was disabled.

## Admin is deliberately locked

The user chose to publish the website with admin locked until further notice. Both `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` are empty. Production contains no `LOCAL_EDITOR` setting and no editing API key.

The Access Free activation was not completed: Cloudflare requested a payment method and acceptance of terms, including potential excess-usage billing. No payment details were entered and no subscription was activated by the agent.

The Gmail account address remains absent from public contact information. The admin/session endpoint on the deployed service returns “Inloggning krävs.”

## Verification

- TypeScript, 11 content/authentication/concurrency tests, frontend production build and Worker dry run passed.
- The deployed website and its public content API were opened successfully in the in-app browser over HTTPS. Content revision is 0, from the supplied launch content.
- Browser console contained no warnings/errors when checked. The rendered page has no horizontal overflow at the available browser viewport, and contact information does not reveal the account email.
- Command-line requests from this executor to the `workers.dev` address received Cloudflare's 1010 browser restriction; the interactive browser loaded the same website and public API successfully.
- Public apex, `www`, and canonical-domain HTTPS/redirect checks remain pending DNS activation. At the last check, those requests still reached Strato's parking page; `admin` was not yet resolvable through public DNS.

## Future updates

GitHub holds the source and runs verification on pushes. **Automatic deployment from GitHub is not connected yet.** Cloudflare Settings → Builds still offers a Git provider connection. Configure that separately if desired; it may require authorizing Cloudflare's GitHub installation for this repository.

Until then, publish code changes from the authorized maintainer terminal:

```sh
npm run deploy:public
```

This command verifies that Access settings remain unset, runs checks, applies any new D1 migrations and publishes the Worker. It keeps admin closed. `workers_dev` is enabled to provide a working public address during the domain transition; version preview URLs remain disabled.

Once DNS is active, verify the apex site, `www` redirect, valid HTTPS and a locked admin response. The temporary production `workers.dev` address can then be disabled in `wrangler.jsonc` and redeployed if desired.

When editor sign-in is wanted, complete Access onboarding personally, configure the application and email allowlist, set both Access variables and use the normal `npm run deploy`. Refer to `DEPLOYMENT.md` and `REDAKTOR.md`.
