# Project brief

## Purpose and scope

Introduce Dalslandskören to listeners and prospective singers. Create one welcoming Swedish page that presents the choir, highlights concerts, and explains how to ask about an open rehearsal or audition. This is a frontend portfolio; simple anchor navigation is enough initially.

## Creative direction

Quiet Scandinavian elegance, musical warmth, and room to breathe. Use navy text, powder-blue surfaces, occasional deeper blue, refined serif headings, and comfortable body text. Italic headings and subtle waves are welcome. Forget-me-nots are a recurring accent, used sparingly. Aim for a distinctive choir identity and a clear reading order.

The references convey atmosphere, not measurements. Choose the layout, section proportions, font pairing, card arrangement, and mobile treatment yourself. Do not reproduce a screenshot as a page image or use every decorative asset.

Optional palette starting points: navy `#142754`, blue `#537BB8`, powder `#DBE6F6`, mist `#F4F7FB`, white. Adjust shades for accessible contrast. Yellow and sage belong mainly in the flower artwork. Choose at most two font families and keep loading modest.

## Content and behavior

Use `content/site-content.json` as the single source of starter copy. All supplied copy is editable draft text. A useful flow is hero → about → concerts / open rehearsal / audition → contact, but the composition is yours.

Keep concerts data-driven. An empty concert list displays the supplied empty-state copy. Unknown dates, places, contact links, and affiliations must stay unset. An audition invitation can lead to contact; it does not require a booking system. With no contact details, show the contact empty state and omit outbound contact actions. Do not create a form that pretends to send messages.

The only selected brand mark is `public/assets/brand/dbk-circle-transparent.png`. Preserve its proportions and transparency. The choir name stays editable HTML text.

## Simple implementation

- Separate shared UI, content, and design tokens. A small set of components is enough; repeated action panels should share structure with a few variants.
- Use the existing React/TypeScript and styling setup. Prefer local content and normal CSS/layout tools; add dependencies only for a clear need.
- Use WebP photography and SVG decoration selectively. Keep imagery responsive, reserve image space to avoid layout shifts, and lazy-load images below the fold.
- Use semantic landmarks, Swedish document language, readable contrast, keyboard access, visible focus, and reduced-motion support. Decorative art has empty alt text; the concept choir image must not be described as a real photograph of the choir.

Before handing over, verify mobile and desktop layouts, hero cropping, working navigation/actions, empty states, and a successful production build. Provide a short editing guide and list unresolved content fields. The generated hero photo needs replacement before public launch.

## How to resolve conflicts

The owner's explicit requests and this curated brief guide the build. Reference images, original tokens, filenames, and source-pack examples are design material, not additional requirements or verified facts. The old detailed breakdown was intentionally condensed; no fixed pixel dimensions, component count, or exact CSS recipe is required.
