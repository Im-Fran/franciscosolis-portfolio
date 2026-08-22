/** Presentation helpers shared by the account and admin views. */

export const formatDateTime = (value: string | null | undefined, language: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language, {dateStyle: "medium", timeStyle: "short"}).format(date);
};

export const formatDate = (value: string | null | undefined, language: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language, {dateStyle: "medium"}).format(date);
};

/**
 * Condenses a user agent to "Browser · Platform", which is all a session list needs to be
 * recognisable. Unknown strings are truncated rather than dropped, so an odd client still shows.
 */
export const describeUserAgent = (userAgent: string | null | undefined) => {
  if (!userAgent) return null;

  const platform =
    /Windows/i.test(userAgent) ? "Windows"
    : /iPhone|iPad|iPod/i.test(userAgent) ? "iOS"
    : /Android/i.test(userAgent) ? "Android"
    : /Mac OS X|Macintosh/i.test(userAgent) ? "macOS"
    : /CrOS/i.test(userAgent) ? "ChromeOS"
    : /Linux/i.test(userAgent) ? "Linux"
    : null;

  const browser =
    /Edg\//i.test(userAgent) ? "Edge"
    : /OPR\/|Opera/i.test(userAgent) ? "Opera"
    : /Firefox\//i.test(userAgent) ? "Firefox"
    : /Chrome\//i.test(userAgent) ? "Chrome"
    : /Safari\//i.test(userAgent) ? "Safari"
    : null;

  if (!browser && !platform) return userAgent.length > 60 ? `${userAgent.slice(0, 57)}…` : userAgent;
  return [browser, platform].filter(Boolean).join(" · ");
};

/** Initials for the avatar fallback, from the display name when there is one and the email if not. */
export const initialsOf = (name: string | null | undefined, email: string) => {
  const source = name?.trim() || email.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return letters.toUpperCase();
};

/**
 * Whether an address is worth sending to the service.
 *
 * The sign-in forms carry `noValidate` — the browser's own bubble does not match the rest of the
 * screen — which also switches off the `type="email"` and `required` checks the markup asks for.
 * This is what stands in for them: a deliberately loose shape test, since the only authority on
 * whether an address exists is the mail that either arrives or does not.
 */
export const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
