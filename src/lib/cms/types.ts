/**
 * Types mirroring the CMS API (https://api.franciscosolis.cl/openapi.json), `/cms` module.
 *
 * As in the auth interface, the list and detail endpoints only *guarantee* a small set of keys in
 * their schema while writing accepts a much wider shape. Everything the schema does not promise is
 * typed optional and every view renders it defensively, so a field the service starts or stops
 * sending never breaks a screen.
 */

/* ── Service metadata ─────────────────────────────────────────────────────── */

/** Service status: what this CMS is and which collections it manages. */
export type CmsStatus = {
  message: string;
  collections: string[];
};

export type CmsCollection = {
  slug: string;
  name: string;
  description: string;
};

/**
 * The editor behind the current access token.
 *
 * Roles and permissions are the ones minted into the token by the auth service, so they can lag a
 * change by up to the token's lifetime — the API itself is always the authority.
 */
export type CmsEditor = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  roles: string[];
  permissions: string[];
  application_id: string;
  session_id: string;
};

/* ── Content ──────────────────────────────────────────────────────────────── */

export type ContentStatus = "draft" | "published" | "archived";

export const CONTENT_STATUSES: ContentStatus[] = ["draft", "published", "archived"];

/**
 * One entry of a collection. `data` is the collection-specific payload the API stores verbatim:
 * it has no documented schema, so the interface edits it as JSON rather than inventing one.
 */
export type ContentItem = {
  id: string;
  collection: string;
  slug: string;
  title: string;
  status: string;
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
  data?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

/** The writable half of a content item — the same shape for a create and a partial update. */
export type ContentPayload = {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  summary?: string | null;
  body?: string | null;
  status?: ContentStatus;
  featured?: boolean;
  position?: number;
  started_at?: string | null;
  ended_at?: string | null;
  url?: string | null;
  image_url?: string | null;
  tags?: string[];
  data?: Record<string, unknown>;
};

/** A create has to carry a title; everything else the service defaults. */
export type NewContent = ContentPayload & {title: string};

export type ContentQuery = {
  status?: ContentStatus;
  search?: string;
  tag?: string;
  limit?: number;
  offset?: number;
};

export type ReorderItem = {id: string; position: number};

/* ── Legal ────────────────────────────────────────────────────────────────── */

export type LegalDocument = {
  id: string;
  slug: string;
  title: string;
  status: string;
  summary?: string | null;
  body?: string | null;
  version?: string | null;
  effective_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type LegalPayload = {
  slug?: string;
  title?: string;
  summary?: string | null;
  body?: string;
  status?: ContentStatus;
  version?: string | null;
  effective_at?: string | null;
};

/** A legal document is nothing without its text, so both a title and a body are required. */
export type NewLegal = LegalPayload & {title: string; body: string};

/* ── Email templates ──────────────────────────────────────────────────────── */

export type EmailTemplate = {
  id: string;
  slug: string;
  subject: string;
  name?: string;
  description?: string | null;
  html?: string | null;
  text?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type EmailTemplatePayload = {
  slug?: string;
  name?: string;
  description?: string | null;
  subject?: string;
  html?: string | null;
  text?: string | null;
};

export type NewEmailTemplate = EmailTemplatePayload & {name: string; subject: string};

/* ── Emails ───────────────────────────────────────────────────────────────── */

export type EmailStatus = "queued" | "sent" | "failed";

export const EMAIL_STATUSES: EmailStatus[] = ["queued", "sent", "failed"];

export type EmailMessage = {
  id: string;
  subject: string;
  status: string;
  to?: string[];
  template?: string | null;
  variables?: Record<string, string> | null;
  layout?: string | null;
  heading?: string | null;
  html?: string | null;
  text?: string | null;
  from?: string | null;
  reply_to?: string | null;
  error?: string | null;
  created_at?: string;
  sent_at?: string | null;
};

/**
 * What to send. Either `template` (rendered server-side with `variables`) or a `subject` plus a
 * body — the service is the one that decides which combinations it accepts.
 */
export type SendEmail = {
  to: string[];
  template?: string;
  variables?: Record<string, string>;
  subject?: string;
  html?: string;
  text?: string;
  layout?: "branded" | "raw";
  heading?: string;
  from?: string;
  reply_to?: string;
};

export type EmailQuery = {
  status?: EmailStatus;
  limit?: number;
  offset?: number;
};

/* ── Audit ────────────────────────────────────────────────────────────────── */

/** Only `id`, `event` and `created_at` are guaranteed; the rest is shown when the service sends it. */
export type AuditEntry = {
  id: string;
  event: string;
  created_at: string;
  actor_id?: string | null;
  actor_email?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AuditQuery = {
  limit?: number;
  offset?: number;
};
