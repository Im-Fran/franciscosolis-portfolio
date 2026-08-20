import {createContext, useContext} from "react";
import type {CmsCollection, CmsEditor} from "@/lib/cms/types.ts";

export type CmsContextValue = {
  /** The account behind the current token, as the CMS itself sees it. */
  editor: CmsEditor | null;
  /** The collections the service manages — what the navigation is built from. */
  collections: CmsCollection[];
  loading: boolean;
  error: string | null;
  /** Signed in, but holding no role in this application: the API answered 403 to `/admin/me`. */
  forbidden: boolean;
  reload: () => void;
};

export const CmsContext = createContext<CmsContextValue | null>(null);

export const useCms = () => {
  const value = useContext(CmsContext);
  if (!value) throw new Error("useCms must be used inside <CmsProvider>");
  return value;
};

/** The collection the interface should open first, and the fallback when a slug is unknown. */
export const firstCollection = (collections: CmsCollection[]) => collections[0]?.slug ?? null;
