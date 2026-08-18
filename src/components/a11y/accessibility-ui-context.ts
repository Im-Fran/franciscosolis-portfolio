import {createContext, useContext} from "react";

export type AccessibilityUiContextValue = {
  openPanel: () => void;
  openPalette: () => void;
};

/** Lets anything below the layout — the footer button, a page — reach the two entry points. */
export const AccessibilityUiContext = createContext<AccessibilityUiContextValue>({
  openPanel: () => {},
  openPalette: () => {},
});

export const useAccessibilityUi = () => useContext(AccessibilityUiContext);
