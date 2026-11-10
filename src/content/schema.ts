import { z } from "zod";

const text = z.string().trim().min(1, "Fyll i text.").max(10000);
const cleanUrl = (value: string) => !/[\s\\\u0000-\u001f\u007f]/.test(value);
export function isSafeLink(value: string) {
  if (!cleanUrl(value)) return false;
  if (/^#[a-zA-Z][a-zA-Z0-9-]*$/.test(value)) return true;
  if (/^\/(?!\/)/.test(value)) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" && !!url.hostname && !url.username && !url.password)
      || (url.protocol === "mailto:" && !!url.pathname && !/%0[ad]/i.test(value));
  } catch { return false; }
}
const link = z.string().max(2048).refine(isSafeLink, "Använd en https-adress, mailto, #ankare eller lokal sökväg.");
const image = z.string().max(2048).refine(value => cleanUrl(value) && (
  /^\/assets\/[a-zA-Z0-9_./-]+$/.test(value) || (value.startsWith("https://") && isSafeLink(value))
), "Använd /assets/… eller en https-adress till en bild.");
const id = z.string().regex(/^[a-zA-Z][a-zA-Z0-9-]*$/);
const cta = z.object({ label: text, href: link });
const section = z.object({ id, title: text, text });

export const siteContentSchema = z.object({
  locale: z.literal("sv-SE"),
  brand: z.object({ name: text, logo: image }),
  navigation: z.array(cta).max(6),
  hero: z.object({ id, title: text, secondaryTitle: text, subtitle: text, image, imageAlt: text, imageIsConcept: z.boolean() }),
  about: section,
  concerts: z.object({ id, title: text, emptyState: text, eventLabel: text, items: z.array(z.object({
    title: text, date: z.string().datetime({ offset: true }), venue: text,
    description: z.string().max(10000).optional(), ticketUrl: link.nullable().optional(), eventUrl: link.nullable().optional(),
  })).max(100) }),
  openRehearsal: section.extend({ cta }),
  audition: section.extend({ cta, bookingUrl: link.nullable() }),
  contact: z.object({ id, title: text, intro: text, email: z.string().email().nullable(), instagramUrl: link.nullable(), emptyState: text, demoNotice: z.string().max(10000).optional() }),
  editorial: z.object({ copyStatus: text, confirmedFacts: z.array(text), needsConfirmation: z.array(text), renderEditorialNotes: z.boolean() }).optional(),
});

export const contentPatchSchema = siteContentSchema.partial().strict();

export async function matchesApiKey(provided: string | null, expected: string | undefined) {
  if (!provided || !expected) return false;
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const left = new Uint8Array(a), right = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}
