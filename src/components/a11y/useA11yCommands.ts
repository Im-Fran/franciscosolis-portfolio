import {useMemo} from "react";
import {useTranslation} from "react-i18next";
import type {Icon} from "@phosphor-icons/react";
import {ArrowCounterClockwise, SlidersHorizontal} from "@phosphor-icons/react";
import {useA11y, type A11yPreferences, type Theme} from "@/lib/a11y";
import {
  A11Y_SETTINGS,
  optionLabelKey,
  settingHintKey,
  settingLabelKey,
  THEME_OPTION_ICON,
  type SettingValue,
} from "@/components/a11y/a11y-settings.ts";

export type A11yCommand = {
  id: string;
  /**
   * The setting this belongs to, rendered between the "Accessibility:" namespace prefix and the
   * value. Left out by the commands that are not a preference, which would otherwise read
   * "Accessibility: Accessibility — Reset everything".
   */
  group?: string;
  label: string;
  hint?: string;
  icon: Icon;
  /** True when the command describes the state the site is already in. */
  active: boolean;
  /** Normalised name of the command, in both languages. What ranking is really about. */
  title: string;
  /** The title plus its hint and the setting's keywords — matched, but never ranked highly. */
  search: string;
  run: () => void;
};

/** Folds accents away so "animacion" finds "Animaciones" and "espanol" finds "Español". */
const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Whether every letter of the token shows up in order — the loosest match still worth offering. */
const isSubsequence = (haystack: string, token: string): boolean => {
  let cursor = 0;
  for (const character of haystack) {
    if (character !== token[cursor]) continue;
    cursor += 1;
    if (cursor === token.length) return true;
  }
  return false;
};

/**
 * Scores one token against a command. Matches in the command's own name rank far above matches in
 * its hint or keywords, and the fuzzy pass only ever runs against the name: hints are long enough
 * that almost any short token appears somewhere in them in order, which used to drag every
 * command into the results.
 *
 * 0 means no match, and one failed token disqualifies the whole command.
 */
const scoreToken = (command: A11yCommand, token: string): number => {
  const index = command.title.indexOf(token);
  if (index === 0) return 6;
  if (index > 0) return 4;
  if (command.search.includes(token)) return 2;
  return isSubsequence(command.title, token) ? 1 : 0;
};

export const filterCommands = (commands: readonly A11yCommand[], query: string): A11yCommand[] => {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [...commands];

  return commands
    .map((command) => {
      let total = 0;
      for (const token of tokens) {
        const score = scoreToken(command, token);
        if (score === 0) return null;
        total += score;
      }
      return {command, total};
    })
    .filter((entry): entry is {command: A11yCommand; total: number} => entry !== null)
    /* Stable within a score, so equally good matches keep the panel's own order. */
    .sort((a, b) => b.total - a.total)
    .map((entry) => entry.command);
};

/**
 * Flattens every accessibility preference into one command per possible value, plus the two
 * commands that are not preferences: open the panel, and reset.
 */
export const useA11yCommands = (openPanel: () => void): A11yCommand[] => {
  const {t, i18n} = useTranslation();
  const {preferences, setPreference, reset, announce} = useA11y();
  const language = i18n.language;

  return useMemo(() => {
    const commands: A11yCommand[] = [];
    /*
     * Names in the other language go into the searchable title too, so someone typing "oscuro"
     * lands on "Theme — Dark" and someone typing "dark" lands on "Tema — Oscuro". Both bundles are
     * preloaded in main.tsx; if one somehow is not, i18next hands back the key, which the guard drops.
     */
    const other = i18n.getFixedT(language === "es" ? "en" : "es");
    const alt = (key: string) => {
      const translated = other(key);
      return translated === key || translated.startsWith("settings.") ? "" : translated;
    };
    /*
     * Every row of A11Y_SETTINGS is precisely typed on its own, but walking the table collapses
     * the rows into a union and the key/value pairing with it. The write is widened once, here,
     * rather than at each of the eight call sites.
     */
    const apply = setPreference as (key: keyof A11yPreferences, value: SettingValue) => void;

    for (const setting of A11Y_SETTINGS) {
      const group = t(settingLabelKey(setting.key));
      const hint = t(settingHintKey(setting.key));
      const values: readonly SettingValue[] = setting.kind === "toggle" ? [true, false] : setting.options;

      for (const value of values) {
        const label =
          setting.kind === "toggle"
            ? t(value === true ? "a11y:enabled" : "a11y:disabled")
            : t(optionLabelKey(setting.key, String(value)));
        const icon =
          setting.kind === "choice" && setting.key === "theme"
            ? THEME_OPTION_ICON[value as Theme]
            : setting.icon;

        const altLabel =
          setting.kind === "toggle"
            ? alt(value === true ? "a11y:enabled" : "a11y:disabled")
            : alt(optionLabelKey(setting.key, String(value)));
        const title = normalize([group, label, alt(settingLabelKey(setting.key)), altLabel].join(" "));

        commands.push({
          id: `${setting.key}:${String(value)}`,
          group,
          label,
          hint,
          icon,
          active: preferences[setting.key] === value,
          title,
          search: normalize([title, hint, setting.keywords].join(" ")),
          run: () => {
            apply(setting.key, value);
            announce(t("a11y:changed", {setting: group, value: label}));
          },
        });
      }
    }

    const openTitle = normalize([t("a11y:palette.open_panel"), alt("a11y:palette.open_panel")].join(" "));
    commands.push({
      id: "panel:open",
      label: t("a11y:palette.open_panel"),
      icon: SlidersHorizontal,
      active: false,
      title: openTitle,
      search: normalize([openTitle, "panel ajustes settings preferencias preferences"].join(" ")),
      run: openPanel,
    });

    const resetTitle = normalize([t("a11y:palette.reset_command"), alt("a11y:palette.reset_command")].join(" "));
    commands.push({
      id: "panel:reset",
      label: t("a11y:palette.reset_command"),
      icon: ArrowCounterClockwise,
      active: false,
      title: resetTitle,
      search: normalize([resetTitle, "reset restablecer restaurar defaults valores por defecto"].join(" ")),
      run: () => {
        reset();
        announce(t("a11y:reset_done"));
      },
    });

    return commands;
  }, [t, i18n, language, preferences, setPreference, reset, announce, openPanel]);
};
