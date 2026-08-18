/**
 * The console sections of `/auth`. Both are shared with the other consoles on this site — the CMS
 * renders the same panels with its own copy — so they live in `components/ui` and are re-exported
 * here, where the auth screens already reach for them.
 */
export {Panel, PanelState} from "@/components/ui/panel.tsx";
export type {PanelProps, PanelStateProps} from "@/components/ui/panel.tsx";
