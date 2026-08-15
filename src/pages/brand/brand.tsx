import {type ReactNode, useState} from "react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {ArrowLeft, Check, Copy, GlobeSimple, Prohibit} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button/button.tsx";
import {BRAND_MARK_MIN_SIZE, BrandLockup, BrandMark} from "@/components/brand";
import {useLanguageToggle} from "@/hooks/useLanguageToggle.ts";

type Surface = "dark" | "light";

const SURFACE_BACKGROUND: Record<Surface, string> = {
  dark: "var(--color-brand-surface-dark)",
  light: "var(--color-brand-surface-light)",
};

const SWATCHES: Array<{ roleKey: string; hex: string }> = [
  {roleKey: "accent", hex: "#2f6bff"},
  {roleKey: "on_dark", hex: "#4d82ff"},
  {roleKey: "ink", hex: "#0f2440"},
  {roleKey: "surface_dark", hex: "#0b1626"},
  {roleKey: "surface_light", hex: "#f7f9fc"},
];

const MARK_SIZES = [BRAND_MARK_MIN_SIZE, 24, 32, 64];

const ASSETS: Array<{ useKey: string; svg: string; png: string }> = [
  {useKey: "horizontal", svg: "fs-lockup-horizontal.svg", png: "png/fs-lockup-horizontal.png"},
  {useKey: "horizontal_dark", svg: "fs-lockup-horizontal-dark.svg", png: "png/fs-lockup-horizontal-dark.png"},
  {useKey: "stacked", svg: "fs-lockup-stacked.svg", png: "png/fs-lockup-stacked.png"},
  {useKey: "mark", svg: "fs-mark.svg", png: "png/fs-mark.png"},
  {useKey: "mark_mono", svg: "fs-mark-mono.svg", png: "png/fs-mark-mono.png"},
];

const CLEAR_SPACE_MARK = 64;

const Section = ({title, body, children}: { title: string; body?: string; children?: ReactNode }) => (
  <section className="mt-16">
    <h2 className="text-[clamp(22px,3vw,30px)] text-text mb-3">{title}</h2>
    {body && <p className="max-w-2xl text-[15px] leading-[1.65] text-neutral-300">{body}</p>}
    {children}
  </section>
);

/** Frames a mark against one of the two brand surfaces, so tone choices can be compared side by side. */
const Stage = ({surface, label, children}: { surface: Surface; label: string; children: ReactNode }) => (
  <div className="rounded-[var(--radius-md)] border border-neutral-800 overflow-hidden">
    <p className="border-b border-neutral-800 bg-surface px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-neutral-500">
      {label}
    </p>
    <div className="flex items-center justify-center p-10" style={{background: SURFACE_BACKGROUND[surface]}}>
      {children}
    </div>
  </div>
);

const Swatch = ({hex, role}: { hex: string; role: string }) => {
  const {t} = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={t("brand:color.copy", {hex})}
      className="group flex items-center gap-4 rounded-[var(--radius-md)] border border-neutral-800 bg-surface p-3 text-left transition-colors hover:border-neutral-700 cursor-pointer"
      data-fs-hover
    >
      <span
        className="size-12 shrink-0 rounded-[var(--radius-sm)] border border-neutral-700"
        style={{background: hex}}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-[1.4] text-text">{role}</span>
        <span className="mt-0.5 block font-mono text-xs uppercase text-neutral-500">{hex}</span>
      </span>
      <span className="shrink-0 text-neutral-500 group-hover:text-neutral-300 transition-colors">
        {copied
          ? <span className="inline-flex items-center gap-1 text-xs text-accent-300"><Check size={14}/>{t("brand:color.copied")}</span>
          : <Copy size={16}/>}
      </span>
    </button>
  );
};

export const Brand = () => {
  const {t} = useTranslation();
  const {language, toggleLanguage} = useLanguageToggle();

  const donts = t("brand:donts.items", {returnObjects: true}) as unknown as string[];

  return (
    <section className="relative w-full overflow-hidden">
      <div className="container relative z-10 mx-auto max-w-3xl px-4 pt-32 pb-24">
        <div className="mb-10 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" data-fs-hover>
            <Link to="/">
              <ArrowLeft size={16}/>
              {t("brand:back")}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLanguage} data-fs-hover>
            <GlobeSimple size={16}/>
            {language === "es" ? "EN" : "ES"}
          </Button>
        </div>

        <p className="mb-3 text-[13px] uppercase tracking-[0.08em] text-accent-300">{t("brand:kicker")}</p>
        <h1 className="mb-6 text-[clamp(32px,5.5vw,56px)] text-text">{t("brand:title")}</h1>
        <p className="max-w-2xl text-[16px] leading-[1.65] text-neutral-300">{t("brand:intro")}</p>

        <Section title={t("brand:lockup.title")} body={t("brand:lockup.body")}>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Stage surface="dark" label={t("brand:lockup.on_dark")}>
              <BrandLockup size={36} tone="dark"/>
            </Stage>
            <Stage surface="light" label={t("brand:lockup.on_light")}>
              <BrandLockup size={36} tone="light"/>
            </Stage>
          </div>
          <p className="mt-4 text-sm leading-[1.6] text-neutral-500">{t("brand:lockup.note")}</p>
        </Section>

        <Section title={t("brand:stacked.title")} body={t("brand:stacked.body")}>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Stage surface="dark" label={t("brand:lockup.on_dark")}>
              <BrandLockup size={44} tone="dark" variant="stacked"/>
            </Stage>
            <Stage surface="light" label={t("brand:lockup.on_light")}>
              <BrandLockup size={44} tone="light" variant="stacked"/>
            </Stage>
          </div>
        </Section>

        <Section title={t("brand:mark.title")} body={t("brand:mark.body")}>
          <div className="mt-6">
            <Stage surface="dark" label={t("brand:mark.sizes_label")}>
              <div className="flex items-end gap-6">
                {MARK_SIZES.map((size) => (
                  <span key={size} className="flex flex-col items-center gap-2">
                    <BrandMark size={size}/>
                    <span className="font-mono text-[10px] text-neutral-500">{size}</span>
                  </span>
                ))}
              </div>
            </Stage>
          </div>

          <h3 className="mt-8 mb-2 text-lg text-text">{t("brand:mark.mono_title")}</h3>
          <p className="max-w-2xl text-[15px] leading-[1.65] text-neutral-300">{t("brand:mark.mono_body")}</p>
          <div className="mt-4">
            <Stage surface="light" label={t("brand:mark.mono_title")}>
              <BrandMark size={64} mono/>
            </Stage>
          </div>
        </Section>

        <Section title={t("brand:color.title")} body={t("brand:color.body")}>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {SWATCHES.map(({roleKey, hex}) => (
              <Swatch key={hex} hex={hex} role={t(`brand:color.roles.${roleKey}`)}/>
            ))}
          </div>
        </Section>

        <Section title={t("brand:type.title")} body={t("brand:type.body")}>
          <div className="mt-6 rounded-[var(--radius-md)] border border-neutral-800 bg-surface p-8">
            <p
              className="font-display font-semibold leading-none text-text text-[clamp(28px,7vw,56px)]"
              style={{letterSpacing: "-0.02em"}}
            >
              FranciscoSolis
            </p>
            <p className="mt-5 font-mono text-xs text-neutral-500">{t("brand:type.specimen_caption")}</p>
          </div>
        </Section>

        <Section title={t("brand:clear_space.title")} body={t("brand:clear_space.body")}>
          <div className="mt-6">
            <Stage surface="dark" label={t("brand:clear_space.label")}>
              <span
                className="inline-flex border border-dashed"
                style={{
                  padding: CLEAR_SPACE_MARK / 2,
                  borderColor: "color-mix(in oklab, var(--color-brand-on-dark) 55%, transparent)",
                }}
              >
                <BrandMark size={CLEAR_SPACE_MARK}/>
              </span>
            </Stage>
          </div>
        </Section>

        <Section title={t("brand:donts.title")} body="">
          <ul className="mt-2 space-y-3">
            {donts.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-[1.6] text-neutral-300">
                <Prohibit size={18} className="mt-0.5 shrink-0 text-neutral-500"/>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t("brand:code.title")} body={t("brand:code.body")}>
          <pre className="mt-6 w-full overflow-x-auto rounded-[var(--radius-md)] border border-neutral-800 bg-surface p-4 text-left text-xs leading-relaxed text-neutral-300">
{`import {BrandLockup, BrandMark} from "@/components/brand";

<BrandLockup tone="dark" />           // header lockup
<BrandLockup variant="stacked" />     // square placements
<BrandMark size={24} />               // mark alone
<BrandMark mono size={24} />          // single-color ink mark`}
          </pre>
        </Section>

        <Section title={t("brand:assets.title")} body={t("brand:assets.body")}>
          <ul className="mt-6 divide-y divide-neutral-800 rounded-[var(--radius-md)] border border-neutral-800 bg-surface">
            {ASSETS.map(({useKey, svg, png}) => (
              <li key={svg} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <span className="min-w-0">
                  <span className="block truncate font-mono text-xs text-text">{svg}</span>
                  <span className="mt-1 block text-sm text-neutral-500">{t(`brand:assets.uses.${useKey}`)}</span>
                </span>
                <span className="flex shrink-0 gap-2">
                  <Button asChild variant="secondary" size="sm" data-fs-hover>
                    <a href={`/brand/${svg}`} download>{t("brand:assets.download_svg")}</a>
                  </Button>
                  <Button asChild variant="secondary" size="sm" data-fs-hover>
                    <a href={`/brand/${png}`} download>{t("brand:assets.download_png")}</a>
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </section>
  );
};
