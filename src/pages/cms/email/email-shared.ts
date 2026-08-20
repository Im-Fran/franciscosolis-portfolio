import type {EmailMessage} from "@/lib/cms/types.ts";

/**
 * The limits `POST /cms/admin/emails` declares in openapi.json, kept next to the screens that have
 * to respect them: learning that a subject was 201 characters long from a 422 — after the confirm
 * dialog, with the recipients already named — is a miserable way to find out.
 */
export const SEND_LIMITS = {
  recipients: 20,
  address: 320,
  subject: 200,
  heading: 200,
  body: 200000,
} as const;

/**
 * Deliberately permissive. The service is the authority on what it accepts as a recipient, and a
 * stricter pattern here only ever refuses an address that would have been delivered fine; this one
 * exists to catch the typo and the stray comma, not to re-implement RFC 5322.
 */
const ADDRESS = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;

export const isEmailAddress = (value: string) =>
  value.length <= SEND_LIMITS.address && ADDRESS.test(value);

/**
 * Splits whatever was typed or pasted into the recipients box. `splitList` from `format.ts` keeps
 * spaces inside an entry, which is right for tags and wrong here: a list copied out of a mail
 * client comes separated by spaces as often as by commas.
 */
export const splitAddresses = (raw: string) =>
  raw
    .split(/[\s,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

/**
 * The placeholders a template's text mentions.
 *
 * This is a convenience reading of the template body, not a contract: the API publishes no list of
 * the variables a template expects, so the scan only recognises the plain `{{ name }}` form and
 * steps over block helpers like `{{#each}}`. Anything it misses the compose screen lets the editor
 * add by hand, and anything it invents is a spare input nobody has to fill.
 */
export const scanVariables = (...sources: (string | null | undefined)[]) => {
  const found = new Set<string>();
  for (const source of sources) {
    if (!source) continue;
    for (const match of source.matchAll(/\{\{\s*([A-Za-z_][\w.]*)\s*\}\}/g)) found.add(match[1]);
  }
  return [...found];
};

/** What "send again" carries from a logged message into the compose form. */
export type ComposePrefill = Partial<EmailMessage>;

/**
 * Router state is whatever the previous screen chose to put there — and on a reload there is none
 * at all — so it is checked before the form trusts a single field of it.
 */
export const readComposePrefill = (state: unknown): ComposePrefill | null => {
  if (!state || typeof state !== "object") return null;
  const prefill = (state as {prefill?: unknown}).prefill;
  if (!prefill || typeof prefill !== "object") return null;
  return prefill as ComposePrefill;
};

/** The recipients of a logged message, which the list endpoint does not promise to send at all. */
export const recipientsOf = (message: Pick<EmailMessage, "to">) =>
  Array.isArray(message.to) ? message.to.filter((address) => typeof address === "string") : [];
