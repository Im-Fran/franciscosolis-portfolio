/**
 * The palette answers to ctrl+shift+p and cmd+shift+p, the way VS Code does. Only the label
 * needs to know which platform it is on — the handler accepts either modifier everywhere.
 */
export const isMacLike = () => {
  if (typeof navigator === "undefined") return false;
  /* `userAgentData` where it exists, the UA string elsewhere: `platform` is deprecated but still the fallback. */
  const platform =
    (navigator as Navigator & {userAgentData?: {platform?: string}}).userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform);
};

export const shortcutLabel = () => (isMacLike() ? "⌘ ⇧ P" : "Ctrl ⇧ P");

/** True for the palette's own chord, so the handler and the hint can never disagree. */
export const isPaletteShortcut = (event: KeyboardEvent) =>
  event.shiftKey &&
  (event.metaKey || event.ctrlKey) &&
  /* `code` rather than `key`: shift+p arrives as "P", and a dead-key layout may not report it at all. */
  event.code === "KeyP";
