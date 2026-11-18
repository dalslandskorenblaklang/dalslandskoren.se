# Dalslandskören · Lovable handoff

A curated merge of both supplied packs, with a shorter brief and one selected logo.

## Material för fortsatt arbete i Lovable

Använd [webbplatsens aktuella texter](../../src/content/site-content.json) när du arbetar vidare med det här repot i Lovable. Där finns presentationen av kören och dirigenten, repetitionstiderna och länken till ansökningsformuläret. Starttexterna längre ned hör till den ursprungliga demon. Ett dirigentcitat kan läggas till när det finns en godkänd formulering.

| Referens | Innehåll |
| --- | --- |
| [Dalslandskörens logotyp](reference/choir-material/dalslandskoren-logotyp.png) | Rund DBK-logotyp med akvarellblommor på cremefärgad bakgrund. |
| [Värmlands nations entré](reference/choir-material/varmlands-nation-entre.webp) | Foto av nationshuset från entrésidan. |
| [Värmlands nations fasad](reference/choir-material/varmlands-nation-fasad.webp) | Foto av nationshuset med domkyrkans torn i bakgrunden. |
| [Dalsland](reference/choir-material/dalsland-notblad.jpg) | Handskrivet notblad. |
| [Affisch för öppet rep](reference/choir-material/oppet-rep-14-december.png) | Inbjudan till Värmlands nation den 14 december kl. 18.30–20.30, med information om att ingen föranmälan krävs. |

Filerna är originalbilder för inspiration. Webbplatsens nuvarande [transparenta logotyp](../../public/assets/brand/dbk-circle-transparent.png) och [förgätmigej vid Om oss](../../public/assets/images/forget-me-not-sprig.png) finns under `public/assets/` i repots rot.

## Start here

1. Unzip this folder. Copy `LOVABLE_PROMPT.md` into your Lovable chat.
2. Supply `BRIEF.md`, `content/site-content.json`, `ASSETS.md`, and the files under `public/assets/` as project resources. Keep their paths when importing them into the project. If your import flow does not preserve folders, recreate the paths before building.
3. Attach the two images in `reference/visuals/` for visual direction. They are inspiration, with sample content and alternate branding; the brief and selected logo take precedence.

If adding resources in stages, begin with the brief, content, selected logo, hero image, and the two references. Add other assets only when needed. Have Lovable confirm which files it can access before implementing; a pasted filename alone does not supply the file.

## Folder map

```text
dalslandskoren-lovable/
  README.md                   Human setup and folder map
  LOVABLE_PROMPT.md            Paste into Lovable
  BRIEF.md                    Short authoritative project brief
  ASSETS.md                   Asset choices and usage notes
  content/site-content.json   Editable Swedish starter copy and empty data
  public/assets/
    brand/                    Your chosen PNG logo
    images/                   Three WebP concept images
    icons/                    One consistent SVG icon family
    illustrations/            Optional floral SVG artwork
    patterns/                 Optional repeating SVG backgrounds
    backgrounds/              Optional page and card SVG backgrounds
  reference/
    visuals/                  Two optional design references
    design-tokens.css         Original kit tokens; optional starting point
    asset-manifest.json       Paths, dimensions, source mapping, checksums
```

Only `public/assets/` is intended for the generated site's public files. Use the content JSON as the basis for the app's editable content module. Keep handoff documents and references outside the production public folder.

## Editorial choices

- Preserved the requested logo unchanged; excluded competing logos and monogram concepts.
- Chose WebP photos and SVG graphics; removed redundant JPG/PNG exports, image buttons, and duplicate icon families.
- Replaced the long breakdown and HTML/CSS recipes with a brief. Lovable should choose its own layout and implementation.
- Kept the original design-kit tokens as optional reference, with no fixed sizing requirements.
- Dates, venues, email, social handles, and university affiliation in the references are examples, not verified choir information. The starter data leaves these unset.
- The supplied choir hero is AI-generated concept imagery. Replace it with a real choir photo before public launch.

The original archives and extracted Downloads folders are untouched. This handoff intentionally curates them rather than duplicating every source file. `reference/asset-manifest.json` records the source of every included asset.
