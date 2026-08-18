import {useCallback, useEffect, useMemo, useState, type ReactNode} from "react";
import {AccessibilityUiContext} from "@/components/a11y/accessibility-ui-context.ts";
import {AccessibilityPanel} from "@/components/a11y/accessibility-panel.tsx";
import {CommandPalette} from "@/components/a11y/command-palette.tsx";
import {isPaletteShortcut} from "@/components/a11y/shortcut.ts";

/**
 * Owns the two ways into the accessibility preferences — the panel and the command palette — and
 * the keyboard chord that opens the second one. Mounted once, around the layout, so the footer
 * button and the shortcut both reach the same state.
 */
export const AccessibilityCenter = ({children}: {children: ReactNode}) => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openPanel = useCallback(() => {
    setPaletteOpen(false);
    setPanelOpen(true);
  }, []);

  const openPalette = useCallback(() => {
    setPanelOpen(false);
    setPaletteOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPaletteShortcut(event)) return;
      /* Claims the chord from the browser's own binding, the way an editor in a tab does. */
      event.preventDefault();
      setPanelOpen(false);
      setPaletteOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({openPanel, openPalette}), [openPanel, openPalette]);

  return (
    <AccessibilityUiContext.Provider value={value}>
      {children}
      <AccessibilityPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onOpenPalette={openPalette}
      />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenPanel={openPanel}
      />
    </AccessibilityUiContext.Provider>
  );
};
