# DNS reference before Worker publication

Observed in Cloudflare's imported DNS review on 10 November 2026. The full export is in `dalslandskoren.se-before-launch.zone`. This table is a reference summary. Existing mail records should be retained.

| Type | Host | Value |
| --- | --- | --- |
| A | `dalslandskoren.se` | `217.160.0.154` |
| AAAA | `dalslandskoren.se` | `2001:8d8:100f:f000::200` |
| CNAME | `www` | `dalslandskoren.se` |
| CNAME | `autoconfig` | `autoconfigure.strato.de` |
| MX | `dalslandskoren.se` | `smtp.rzone.de`, priority 5 |
| MX | `*.dalslandskoren.se` | `smtp.rzone.de`, priority 5 |
| SRV | `_autodiscover._tcp` | `autoconfigure.strato.de`, priority 0, weight 100, port 443 |
| TXT | `_dmarc` | `v=DMARC1;p=reject;` |
| TXT | `_domainkey` | `o=~; t=y; r=dkim@rzone.de` |

Original nameservers: `shades13.rzone.de`, `docks04.rzone.de`.

Assigned Cloudflare nameservers saved at Strato: `eugene.ns.cloudflare.com`, `sarah.ns.cloudflare.com`.

No DNSSEC DS record was present in the public response checked before the change. No DNSSEC option was changed.
