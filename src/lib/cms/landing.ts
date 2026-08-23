import type {CmsEntry} from "@/lib/cms/content.ts";

/**
 * What the landing page knows about the shape of the CMS's content, in one place.
 *
 * The CMS deliberately publishes no schema for a collection's `data` blob or for what a tag means,
 * so this file is the site's half of that contract: the toolbox categories it can render an icon
 * and a label for, and the collections its timeline is built from. Everything here is a *filter*,
 * never a source — an entry carrying a category this file does not know about is skipped, not
 * guessed at, so the CMS can grow a new one without this page rendering a blank card for it.
 */

/**
 * The toolbox categories the Stack section renders, in the order it renders them.
 *
 * Skills carry theirs in `data.category`; a project carries the same keys among its `tags`, mixed
 * in with the tags describing what kind of project it is (`landing`, `webapp`, `api`). Reading the
 * intersection is what links a stack card to the projects built with it.
 */
export const TOOLBOX_CATEGORIES = [
  "frontend",
  "backend",
  "mobile",
  "apis",
  "sysadmin",
  "cloud",
  "security",
  "ai",
] as const;

export type ToolboxCategory = (typeof TOOLBOX_CATEGORIES)[number];

export const isToolboxCategory = (value: string): value is ToolboxCategory =>
  (TOOLBOX_CATEGORIES as readonly string[]).includes(value);

/** The toolbox categories a project is tagged with, in the order the Stack section shows them. */
export const toolboxOf = (entry: CmsEntry): ToolboxCategory[] =>
  TOOLBOX_CATEGORIES.filter((category) => entry.tags?.includes(category));

/**
 * The collections the timeline merges, and whether an entry of each can still be running.
 *
 * A job or a degree with no end date is ongoing and reads "2023 — Present"; a certification with
 * no end date is not ongoing, it is a thing that happened in a year. Without the distinction every
 * credential earned in 2024 would claim to still be in progress.
 */
export const TIMELINE_COLLECTIONS = ["experience", "education", "certifications"] as const;

const ONGOING_COLLECTIONS = new Set<string>(["experience", "education"]);

export const canBeOngoing = (entry: CmsEntry): boolean => ONGOING_COLLECTIONS.has(entry.collection);

const year = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getUTCFullYear();
};

/**
 * The period label beside a timeline entry — "2020 — 2023", "2023 — Present", "2024".
 *
 * `present` and `undated` are passed in rather than looked up here: they are interface copy, which
 * stays in the translation namespaces, and this module is deliberately free of React and i18next.
 */
export const periodLabel = (entry: CmsEntry, labels: {present: string; undated: string}): string => {
  const start = year(entry.started_at);
  if (start === null) return labels.undated;

  const end = year(entry.ended_at);
  if (end !== null) return end === start ? String(start) : `${start} — ${end}`;

  return canBeOngoing(entry) ? `${start} — ${labels.present}` : String(start);
};

/**
 * Timeline order: oldest first, and an entry with no date at all before everything else.
 *
 * The undated entry is the one that opens the story ("self-taught from scratch"), which is why it
 * sorts first rather than last — the CMS's own listing sorts most-recent-first for a card grid,
 * and a timeline reads the other way round.
 */
export const byPeriod = (a: CmsEntry, b: CmsEntry): number => {
  const first = year(a.started_at);
  const second = year(b.started_at);
  if (first === null && second === null) return (a.position ?? 0) - (b.position ?? 0);
  if (first === null) return -1;
  if (second === null) return 1;
  if (first !== second) return first - second;
  return (a.position ?? 0) - (b.position ?? 0);
};
