// All page text, image paths and links live in site-content.json.
// Edit that file to update copy, add a concert, swap the photo or add contact links.
import raw from "./site-content.json";
import type { z } from "zod";
import { siteContentSchema } from "./schema";

export type Concert = {
  title: string;
  /** ISO date-time, e.g. "2026-12-13T16:00" */
  date: string;
  venue: string;
  description?: string | undefined;
  ticketUrl?: string | null | undefined;
  eventUrl?: string | null | undefined;
};

export type SiteContent = z.infer<typeof siteContentSchema>;

export const site = siteContentSchema.parse(raw);
