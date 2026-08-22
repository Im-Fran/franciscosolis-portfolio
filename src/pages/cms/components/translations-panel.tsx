import {useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {TranslateIcon} from "@phosphor-icons/react";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Field, Input, Textarea} from "@/components/ui/input.tsx";
import {Panel} from "@/components/ui/panel.tsx";
import {useCms} from "@/lib/cms/cms-context.ts";
import type {TranslationFields, Translations} from "@/lib/cms/types.ts";
import {MarkdownEditor} from "@/pages/cms/components/markdown-editor.tsx";

/**
 * Where an editor writes the other languages of an entry.
 *
 * The panel is deliberately *not* a second copy of the form. Only prose is translatable — slugs,
 * dates, links, tags and the `data` blob are the same fact in every language — so what it shows is
 * a handful of text fields per locale, each with the source text underneath it. Seeing what is
 * being translated beside the box it goes in is the difference between translating an entry and
 * guessing which of two similar summaries this field was.
 *
 * A field left blank is not stored: the service drops empty overrides, and the API then falls back
 * to the source text for that field alone. So a partly-filled locale is a valid, useful state
 * rather than a half-saved one, and the badge on each tab says how much of it is done.
 */

export type TranslatableField = keyof TranslationFields;

export type TranslationsPanelProps = {
  /** Which fields this record has. A legal page has no subtitle. */
  fields: readonly TranslatableField[];
  /** The source text, shown under each box so the editor can see what they are translating. */
  source: Partial<Record<TranslatableField, string>>;
  value: Translations;
  onChange: (value: Translations) => void;
  /** The API's own length caps, per field. */
  limits: Partial<Record<TranslatableField, number>>;
  /** i18n namespace holding this screen's `editor.*` copy — `cms_content` or `cms_legal`. */
  ns: string;
  disabled?: boolean;
};

const FIELD_ID = (locale: string, field: TranslatableField) => `translation-${locale}-${field}`;

/** How many of an entry's fields this locale has text for — what the tab badge counts. */
const filledCount = (translation: TranslationFields | undefined, fields: readonly TranslatableField[]) =>
  fields.filter((field) => (translation?.[field] ?? "").trim().length > 0).length;

export const TranslationsPanel = ({
  fields,
  source,
  value,
  onChange,
  limits,
  ns,
  disabled,
}: TranslationsPanelProps) => {
  const {t} = useTranslation([ns, "cms"]);
  const {translationLocales, defaultLocale} = useCms();
  const [activeLocale, setActiveLocale] = useState<string | null>(null);

  const locales = translationLocales;
  const locale = activeLocale && locales.includes(activeLocale) ? activeLocale : locales[0] ?? null;
  const translation = useMemo(() => (locale ? value[locale] ?? {} : {}), [value, locale]);

  /**
   * Writes one field of one locale, dropping the locale once nothing is left in it.
   *
   * Keeping an empty object around would be harmless — the service prunes it — but it would make
   * the tab badge read "0 of 4" for a language the editor has just finished clearing, which reads
   * as work in progress rather than as "there is no Spanish here".
   */
  const setField = (field: TranslatableField, text: string) => {
    if (!locale) return;

    const next: TranslationFields = {...translation, [field]: text};
    const kept = Object.fromEntries(
      Object.entries(next).filter(([, entry]) => (entry ?? "").trim().length > 0),
    ) as TranslationFields;

    const updated = {...value};
    if (Object.keys(kept).length > 0) updated[locale] = kept;
    else delete updated[locale];

    onChange(updated);
  };

  const clearLocale = () => {
    if (!locale) return;
    const updated = {...value};
    delete updated[locale];
    onChange(updated);
  };

  const localeName = (code: string) => t(`cms:locales.${code}`, {defaultValue: code.toUpperCase()});

  /* The two editors label their fields differently — `editor.fields.title` on legal pages,
     `editor.title` on content entries — so the panel reads whichever of the two exists. */
  const fieldLabel = (field: TranslatableField) =>
    t(`${ns}:editor.fields.${field}`, {defaultValue: t(`${ns}:editor.${field}`, {defaultValue: field})});

  return (
    <Panel
      title={t(`${ns}:editor.translations_title`)}
      description={t(`${ns}:editor.translations_description`, {locale: localeName(defaultLocale)})}
      action={<TranslateIcon size={18} className="text-neutral-500"/>}
    >
      {locales.length === 0 || !locale ? (
        <p className="text-sm text-neutral-400">{t(`${ns}:editor.translations_none`)}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {locales.map((code) => {
              const filled = filledCount(value[code], fields);
              return (
                <Button
                  key={code}
                  type="button"
                  variant={code === locale ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setActiveLocale(code)}
                  data-fs-hover
                >
                  {localeName(code)}
                  <Badge variant={filled > 0 ? "accent" : "neutral"}>{`${filled}/${fields.length}`}</Badge>
                </Button>
              );
            })}
            {filledCount(translation, fields) > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearLocale}
                disabled={disabled}
                className="ml-auto"
                data-fs-hover
              >
                {t(`${ns}:editor.translations_clear`, {locale: localeName(locale)})}
              </Button>
            )}
          </div>

          {fields.map((field) => {
            const id = FIELD_ID(locale, field);
            const original = (source[field] ?? "").trim();
            const hint = original
              ? t(`${ns}:editor.translations_source`, {text: original.length > 160 ? `${original.slice(0, 160)}…` : original})
              : t(`${ns}:editor.translations_source_empty`);

            return (
              <Field key={field} label={fieldLabel(field)} htmlFor={id} hint={hint}>
                {field === "body" ? (
                  <MarkdownEditor
                    id={id}
                    value={translation.body ?? ""}
                    onChange={(text) => setField("body", text)}
                    maxLength={limits.body}
                    disabled={disabled}
                  />
                ) : field === "summary" ? (
                  <Textarea
                    id={id}
                    value={translation.summary ?? ""}
                    maxLength={limits.summary}
                    rows={3}
                    disabled={disabled}
                    onChange={(event) => setField("summary", event.target.value)}
                  />
                ) : (
                  <Input
                    id={id}
                    value={translation[field] ?? ""}
                    maxLength={limits[field]}
                    disabled={disabled}
                    onChange={(event) => setField(field, event.target.value)}
                  />
                )}
              </Field>
            );
          })}
        </div>
      )}
    </Panel>
  );
};
