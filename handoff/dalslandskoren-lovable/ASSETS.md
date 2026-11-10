# Asset guide

Copy `public/assets/` into the site's public folder. A file at `public/assets/brand/dbk-circle-transparent.png` is then referenced as `/assets/brand/dbk-circle-transparent.png`. These paths are local project files, not remote URLs.

| Location under `public/assets/` | Role |
| --- | --- |
| `brand/dbk-circle-transparent.png` | Required logo, copied unchanged from the owner's exact selected file; 768 × 768 transparent PNG. |
| `images/hero-choir.webp` | Wide concept choir hero, 2400 × 750. Protect faces when cropping; mobile can use a separate text area if helpful. |
| `images/concert-forgetmenots.webp` | Optional wide floral concert background, 2000 × 500. Keep text readable. |
| `images/forget-me-not-photo.webp` | Optional flower photograph, 1400 × 742. |
| `icons/` | The Forget-me-not kit's consistent line-icon SVG family: calendar, choir, microphone, envelope, Instagram, arrow, music note, location, ticket, book, flower. |
| `illustrations/` | Five optional floral SVGs: bloom, sprig, bouquet, divider, line-art corner. |
| `patterns/` | Five optional SVG patterns, including soft waves and tiny blooms. Use sparingly. |
| `backgrounds/` | Seven optional SVG waves, card surfaces, overlay, and simple rules from the website asset pack. CSS can replace simple effects. |

Use real HTML buttons and links with CSS styling. There are deliberately no button bitmaps, alternate logos, competing icon sets, or redundant raster copies in this folder. SVG icons may be adapted to inherit the chosen text color; preserve a consistent stroke style.

## Optional references

- `reference/visuals/harmony-in-blue.png`: matching full-page mockup found alongside the source packs. It demonstrates tone and content hierarchy; its sample event and contact information are unverified.
- `reference/visuals/forget-me-not-overview.png`: kit overview showing the floral vocabulary and reusable modules. Its concept logo is not the selected logo.
- `reference/design-tokens.css`: original kit palette and primitives, for inspiration only. Choose one shared token system in the actual app.
- `reference/asset-manifest.json`: exact source locations, dimensions, byte sizes, and checksums. Read only when locating or auditing an asset.

Source pack 1 describes the choir hero as AI-generated concept imagery. Use it for the draft and replace it with an actual choir photograph before launch. No verified event schedule, contact information, or university affiliation was supplied. Those facts cannot be inferred from mockups or design examples.
