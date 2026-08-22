import {lazy} from "react";

/*
 * /legal renders the CMS's Markdown, which means a Markdown parser and a sanitizer — around 25 kB
 * gzipped that every visitor of the landing page would otherwise download to read a page most of
 * them never open. Same reasoning as the auth and CMS screens, so the same treatment.
 */
export const Legal = lazy(() => import("@/pages/legal/legal.tsx").then((module) => ({default: module.Legal})));
