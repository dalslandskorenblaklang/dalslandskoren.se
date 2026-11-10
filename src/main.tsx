import { createRoot, hydrateRoot } from "react-dom/client";
import { ChoirPage } from "./ChoirPage";
import { SiteContext } from "./content/context";
import { site } from "./content/site";
import { siteContentSchema } from "./content/schema";
import "./styles.css";

const root = document.getElementById("root")!;
const boot = JSON.parse(document.getElementById("site-data")?.textContent || "null");
const admin = boot?.admin || location.hostname === "admin.dalslandskoren.se" || location.pathname.startsWith("/admin");
if (admin) {
  import("./admin/Admin").then(({ Admin }) => createRoot(root).render(<Admin />)).catch(() => {
    root.textContent = "Redaktören kunde inte laddas. Ladda om sidan.";
  });
} else if (boot?.content) {
  hydrateRoot(root, <SiteContext.Provider value={siteContentSchema.parse(boot.content)}><ChoirPage /></SiteContext.Provider>);
} else {
  // UI-only Vite development; production receives live, server-rendered content.
  createRoot(root).render(<SiteContext.Provider value={site}><ChoirPage /></SiteContext.Provider>);
}
