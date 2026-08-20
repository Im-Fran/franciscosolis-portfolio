import {ArrowsDownUp, Circle, PaperPlaneTilt, PencilSimple, PlusCircle, Trash} from "@phosphor-icons/react";
import type {Icon} from "@phosphor-icons/react";

/**
 * How an audit event's slug is turned into something scannable.
 *
 * The API documents no vocabulary for `event` — the response schema promises a string and nothing
 * else — so nothing here may depend on a slug being recognised. Everything is derived from the last
 * word of the slug (`content.created`, `email-template.deleted`, `emails.send`), and an event whose
 * verb is not one we know still renders, just in the neutral tone. That is the whole contract this
 * file honours: recognised events read better, unrecognised events still read.
 */

export type AuditVerb = "created" | "updated" | "deleted" | "reordered" | "sent" | "other";

/* Both tenses are accepted because a log could plausibly be written either way. */
const VERBS: Record<string, AuditVerb> = {
  create: "created",
  created: "created",
  update: "updated",
  updated: "updated",
  patch: "updated",
  delete: "deleted",
  deleted: "deleted",
  remove: "deleted",
  removed: "deleted",
  reorder: "reordered",
  reordered: "reordered",
  send: "sent",
  sent: "sent",
};

/** The verb of an event, taken from its last segment across any of the separators a slug might use. */
export const verbOf = (event: string): AuditVerb =>
  VERBS[event.toLowerCase().split(/[.:/_-]/).filter(Boolean).pop() ?? ""] ?? "other";

export type VerbStyle = {
  icon: Icon;
  /** The circular marker on the timeline rail. */
  marker: string;
  /** The event's own line, so a deletion is legible as a deletion before the words are read. */
  label: string;
};

/*
 * Deletions are the entries someone opens this screen to find, so they are the only ones that get a
 * warm colour on both the marker and the text; everything else stays quiet enough to scan past.
 */
export const VERB_STYLES: Record<AuditVerb, VerbStyle> = {
  created: {
    icon: PlusCircle,
    marker: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    label: "text-text",
  },
  updated: {
    icon: PencilSimple,
    marker: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    label: "text-text",
  },
  deleted: {
    icon: Trash,
    marker: "border-red-500/50 bg-red-500/15 text-red-300",
    label: "text-red-200",
  },
  reordered: {
    icon: ArrowsDownUp,
    marker: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    label: "text-text",
  },
  sent: {
    icon: PaperPlaneTilt,
    marker: "border-accent-700 bg-accent-800/50 text-accent-300",
    label: "text-text",
  },
  other: {
    icon: Circle,
    marker: "border-neutral-700 bg-neutral-800/60 text-neutral-400",
    label: "text-neutral-300",
  },
};

export const styleOf = (event: string) => VERB_STYLES[verbOf(event)];
