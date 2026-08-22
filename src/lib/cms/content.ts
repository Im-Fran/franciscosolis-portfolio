import {useCallback} from "react";
import {createHttpClient} from "@/lib/auth/client.ts";
import {webSession} from "@/lib/auth/session.ts";
import {useResource, type Resource} from "@/lib/auth/useResource.ts";
import {CMS_BASE_URL} from "@/lib/cms/config.ts";
import {useA11y} from "@/lib/a11y";
import type {Language} from "@/lib/a11y";

/**
 * The public half of the CMS API — what the landing page renders itself from.
 *
 * Nothing here is authenticated. The service answers `/content/*` and `/legal/*` to anyone, and
 * only ever with `published` entries, which is exactly the boundary a public site needs; the
 * editorial client lives in `client.ts` and is a different thing entirely, signed in under the
 * CMS's own application. Keeping them apart matters for more than tidiness: importing `client.ts`
 * builds the CMS's whole auth stack, and the landing page has no business holding a second
 * session just to read a list of projects.
 *
 * The one thing shared is the HTTP client, for its timeout, its `{ code, data }` unwrapping and
 * its error taxonomy — `useResource` already knows how to describe an `AuthApiError`. It is built
 * over the site's own session, which it never reads: every call below passes `auth: false`.
 */
const http = createHttpClient(CMS_BASE_URL, webSession);

/**
 * An entry as the public API renders it, in one language.
 *
 * The prose fields arrive already resolved — the service merges the requested locale's overrides
 * over the entry's own text — so nothing here has to know that translations exist. `locale` is the
 * language that actually came back, which is not always the one asked for: an untranslated entry
 * falls back rather than disappearing.
 */
export type CmsEntry = {
  id: string;
  collection: string;
  slug: string;
  title: string;
  locale: string;
  available_locales: string[];
  subtitle?: string | null;
  summary?: string | null;
  body?: string | null;
  featured?: boolean;
  position?: number;
  started_at?: string | null;
  ended_at?: string | null;
  url?: string | null;
  image_url?: string | null;
  tags?: string[];
  /** Collection-specific fields. Read defensively — the service validates it, this file does not. */
  data?: Record<string, unknown> | null;
  published_at?: string | null;
  updated_at?: string;
};

/** A legal page in a listing: everything but the body, which is far too long for an index. */
export type CmsLegalSummary = {
  id: string;
  slug: string;
  title: string;
  locale: string;
  available_locales: string[];
  summary?: string | null;
  version?: string | null;
  effective_at?: string | null;
  updated_at?: string;
};

/** The same page with its text. Markdown — the service renders nothing. */
export type CmsLegalPage = CmsLegalSummary & {body: string};

const query = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
};

const seg = (value: string) => encodeURIComponent(value);

export type CollectionQuery = {
  locale?: Language;
  featured?: boolean;
  tag?: string;
  limit?: number;
};

export const cmsContent = {
  /** Published entries of a collection, in the order an editor arranged them. */
  collection: (collection: string, params: CollectionQuery = {}, signal?: AbortSignal) =>
    http.request<CmsEntry[]>(`/content/${seg(collection)}${query({...params})}`, {auth: false, signal}),

  entry: (collection: string, slug: string, locale?: Language, signal?: AbortSignal) =>
    http.request<CmsEntry>(`/content/${seg(collection)}/${seg(slug)}${query({locale})}`, {auth: false, signal}),

  /** Published legal pages, titles only. What the tabs on `/legal` and the footer are built from. */
  legal: (locale?: Language, signal?: AbortSignal) =>
    http.request<CmsLegalSummary[]>(`/legal${query({locale})}`, {auth: false, signal}),

  legalPage: (slug: string, locale?: Language, signal?: AbortSignal) =>
    http.request<CmsLegalPage>(`/legal/${seg(slug)}${query({locale})}`, {auth: false, signal}),
};

/**
 * Loads one collection in the language the visitor is reading the site in.
 *
 * The locale comes from the accessibility preferences rather than from i18next directly, for the
 * same reason the header's language toggle does: that is the value the site persists and mirrors
 * onto `<html lang>`, and reading it here keeps the copy the API serves and the copy i18next
 * serves from ever disagreeing about which language is on screen.
 */
export const useCmsCollection = (collection: string, params: CollectionQuery = {}): Resource<CmsEntry[]> => {
  const {preferences} = useA11y();
  const {featured, tag, limit} = params;

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      cmsContent.collection(collection, {locale: preferences.language, featured, tag, limit}, signal),
    [collection, preferences.language, featured, tag, limit],
  );

  return useResource(fetcher);
};

/**
 * Loads several collections as one list, which is how the timeline is built: a career is one
 * sequence, and the CMS happens to split it across `experience`, `education` and `certifications`.
 *
 * A collection that fails is dropped rather than taking the others with it — half a timeline beats
 * none — and the resource only reports an error when every one of them failed.
 */
export const useCmsCollections = (collections: readonly string[]): Resource<CmsEntry[]> => {
  const {preferences} = useA11y();
  const key = collections.join(",");

  const fetcher = useCallback(
    async (signal: AbortSignal) => {
      const results = await Promise.allSettled(
        key.split(",").map((collection) => cmsContent.collection(collection, {locale: preferences.language}, signal)),
      );

      const fulfilled = results.filter((result) => result.status === "fulfilled");
      if (fulfilled.length === 0) {
        throw results[0]?.status === "rejected" ? results[0].reason : new Error("no collections requested");
      }
      return fulfilled.flatMap((result) => result.value);
    },
    [key, preferences.language],
  );

  return useResource(fetcher);
};

/** The published legal pages, for the tabs on `/legal`. */
export const useCmsLegalIndex = (): Resource<CmsLegalSummary[]> => {
  const {preferences} = useA11y();
  const fetcher = useCallback(
    (signal: AbortSignal) => cmsContent.legal(preferences.language, signal),
    [preferences.language],
  );
  return useResource(fetcher);
};

/** One legal page with its body. `slug` is null until the index has said which pages exist. */
export const useCmsLegalPage = (slug: string | null): Resource<CmsLegalPage | null> => {
  const {preferences} = useA11y();
  const fetcher = useCallback(
    (signal: AbortSignal) => (slug ? cmsContent.legalPage(slug, preferences.language, signal) : Promise.resolve(null)),
    [slug, preferences.language],
  );
  return useResource(fetcher);
};

/** A string field the API may have sent as null, empty or missing. */
export const text = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/**
 * Reads a list of strings out of an entry's `data` blob.
 *
 * The blob is validated by the service against a schema this file does not have, so every read is
 * defensive: a field that is absent, null or the wrong type yields an empty list rather than
 * throwing halfway through rendering a card.
 */
export const stringList = (data: Record<string, unknown> | null | undefined, field: string): string[] => {
  const value = data?.[field];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
};

/** Same, for a single string field. */
export const stringField = (data: Record<string, unknown> | null | undefined, field: string): string | null => {
  const value = data?.[field];
  return typeof value === "string" ? text(value) : null;
};
