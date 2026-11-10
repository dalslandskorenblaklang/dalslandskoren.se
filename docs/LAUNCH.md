# Launch status — 10 November 2026

Publication is in progress; a successful live deployment has not yet been verified.

Completed:

- Source pushed to `git@github.com:dalslandskorenblaklang/dalslandskoren.se.git`, branch `main`, using the user's existing SSH access.
- GitHub repository: https://github.com/dalslandskorenblaklang/dalslandskoren.se
- Cloudflare account selected from the user's signed-in browser: `cvi`, account ID `3c27342e2aebba74d1a0e503d92c324b`.
- D1 database `dalslandskoren-content` created: `7b05dbee-f286-4304-99c3-49629c0b05f9`.
- Strato confirmed that the domain's nameservers were saved as `eugene.ns.cloudflare.com` and `sarah.ns.cloudflare.com`.
- The Cloudflare scan copied nine existing DNS records, including the Strato MX and mail-related records. The original website parking records remain until replaced by Worker domain bindings.
- No DNSSEC DS record was published when checked through Cloudflare's DNS-over-HTTPS resolver. No DNSSEC setting was disabled.
- Local types, 11 tests, frontend build and Worker bundle dry run passed.

Remaining:

- Authorize the scoped Wrangler login on the signed-in Cloudflare account, or use an already authorized equivalent deployment connection.
- Apply the remote D1 migration.
- Configure and deploy the Worker and its three custom domains; verify DNS, HTTPS and the live response.
- Connect automatic code deployments to `main`.
- Configure editor sign-in. The Access Free onboarding currently requests a payment method and acceptance of terms, including potential excess-usage billing. The user must complete that step personally if they want Access activated. No payment details were entered and no subscription was activated by the agent.

Admin remains closed unless a valid Cloudflare Access application and email allowlist are configured. The Gmail account address must stay absent from public contact information.
