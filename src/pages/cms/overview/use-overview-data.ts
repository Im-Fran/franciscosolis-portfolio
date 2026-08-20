import {useCallback} from "react";
import {describeError, useResource} from "@/lib/auth/useResource.ts";
import type {Resource} from "@/lib/auth/useResource.ts";
import {cmsApi} from "@/lib/cms/client.ts";
import type {AuditEntry, CmsCollection, EmailMessage, EmailTemplate, LegalDocument} from "@/lib/cms/types.ts";

/**
 * Everything the overview asks the API for, in one place and all at once.
 *
 * This screen loads on every visit to the CMS, so it never asks for a whole collection: it asks
 * each list for a short page and reads that page for what it can honestly say.
 */

/**
 * How many rows a "is there anything waiting?" probe asks for.
 *
 * No list endpoint in this API returns a total, so a number taken from a page is a floor and never
 * a total. Asking for a few rows rather than one is what lets a tile say "3" when it can prove
 * there are exactly three and "5+" when the page came back full — the number on screen is then
 * either exact or visibly open-ended, but never a guess wearing the clothes of a total.
 */
const PROBE_LIMIT = 5;

/** The audit log is read for its newest entries, not for a count, so this is simply how many fit. */
const ACTIVITY_LIMIT = 8;

/** A count read off a page: exact when the page had room to spare, a floor when it came back full. */
export type Probe = {n: number; more: boolean};

export const probeOf = (rows: unknown[]): Probe => ({n: rows.length, more: rows.length >= PROBE_LIMIT});

export type DraftProbe = {
  collection: CmsCollection;
  /** `null` when the probe failed — a row the API refused is dropped, never shown as a zero. */
  drafts: Probe | null;
  status: number | null;
};

export type OverviewData = {
  drafts: Resource<DraftProbe[]>;
  failedEmails: Resource<EmailMessage[]>;
  activity: Resource<AuditEntry[]>;
  legal: Resource<LegalDocument[]>;
  templates: Resource<EmailTemplate[]>;
};

export const useOverviewData = (collections: CmsCollection[]): OverviewData => {
  /*
   * There is no query that spans collections, so "anything unpublished?" is one probe per
   * collection. `allSettled` is what keeps a collection this account may not read from taking the
   * whole tile down with it: the refusal is recorded per row and the rest still render.
   */
  const drafts = useResource(
    useCallback(
      (signal: AbortSignal) =>
        Promise.allSettled(
          collections.map((collection) =>
            cmsApi.content.list(collection.slug, {status: "draft", limit: PROBE_LIMIT}, signal),
          ),
        ).then((results) =>
          results.map((result, index): DraftProbe => ({
            collection: collections[index],
            drafts: result.status === "fulfilled" ? probeOf(result.value) : null,
            status: result.status === "rejected" ? describeError(result.reason).status : null,
          })),
        ),
      [collections],
    ),
  );

  const failedEmails = useResource(
    useCallback((signal: AbortSignal) => cmsApi.emails.list({status: "failed", limit: PROBE_LIMIT}, signal), []),
  );

  const activity = useResource(
    useCallback((signal: AbortSignal) => cmsApi.audit({limit: ACTIVITY_LIMIT}, signal), []),
  );

  /*
   * Legal documents and email templates are the two lists the API returns whole — neither endpoint
   * takes `limit` or `offset` — so their length genuinely is a total and the overview may show it
   * as one. Every other number on this screen comes from a page and is labelled accordingly.
   */
  const legal = useResource(useCallback((signal: AbortSignal) => cmsApi.legal.list(signal), []));
  const templates = useResource(useCallback((signal: AbortSignal) => cmsApi.templates.list(signal), []));

  return {drafts, failedEmails, activity, legal, templates};
};
