import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
const errors = [];
if (!config.d1_databases?.[0]?.database_id || config.d1_databases[0].database_id === "00000000-0000-0000-0000-000000000000") errors.push("Create the Cloudflare D1 database and copy its database_id into wrangler.jsonc.");
if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(config.vars.ACCESS_TEAM_DOMAIN ?? "")) errors.push("Set ACCESS_TEAM_DOMAIN to the Cloudflare Access team domain (without https://).");
if (!config.vars.ACCESS_AUD) errors.push("Set ACCESS_AUD to the admin application's audience tag.");
if (!config.vars.EDITOR_EMAILS) errors.push("Add at least one editor email to EDITOR_EMAILS.");
if (config.vars.LOCAL_EDITOR) errors.push("Remove LOCAL_EDITOR from production vars. It belongs only in .dev.vars.");
if (errors.length) {
  console.error("Deployment setup is incomplete:\n\n" + errors.map(error => `- ${error}`).join("\n") + "\n\nFollow docs/DEPLOYMENT.md. Local preview and verification still work.");
  process.exit(1);
}
console.log("Deployment configuration is complete. Confirm Access policies in Cloudflare before launch.");
