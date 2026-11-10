import { createContext, useContext } from "react";
import { site, type SiteContent } from "./site";

export const SiteContext = createContext<SiteContent>(site);
export const useSiteContent = () => useContext(SiteContext);