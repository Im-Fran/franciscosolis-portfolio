/**
 * "3 hours ago" for a log entry, from the platform rather than a date library.
 *
 * `Intl.RelativeTimeFormat` is in every browser this site supports and already knows how to say it
 * in every language the site speaks, so pulling a dependency in for one string would be a poor
 * trade. It complements the absolute timestamp rather than replacing it: an audit log is evidence,
 * and "3 hours ago" is only useful next to the exact moment it stands for.
 */

const DIVISIONS: {amount: number; unit: Intl.RelativeTimeFormatUnit}[] = [
  {amount: 60, unit: "second"},
  {amount: 60, unit: "minute"},
  {amount: 24, unit: "hour"},
  {amount: 7, unit: "day"},
];

/** Past this, the absolute date says more than "5 weeks ago" does. */
const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const formatRelativeTime = (value: string | null | undefined, language: string) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const elapsed = date.getTime() - Date.now();
  if (Math.abs(elapsed) > RECENT_WINDOW_MS) return null;

  const formatter = new Intl.RelativeTimeFormat(language, {numeric: "auto"});
  let amount = elapsed / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(amount) < division.amount) return formatter.format(Math.round(amount), division.unit);
    amount /= division.amount;
  }
  return formatter.format(Math.round(amount), "week");
};
