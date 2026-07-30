import {useRef} from "react";
import {useTranslation} from "react-i18next";
import {GithubLogo, LinkedinLogo, XLogo, InstagramLogo, MapPin} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button/button.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";

const socials = [
  {label: "GitHub", href: "https://github.com/Im-Fran", Icon: GithubLogo},
  {label: "LinkedIn", href: "https://linkedin.com/in/fsolism", Icon: LinkedinLogo},
  {label: "X", href: "https://x.com/Im_Fran_", Icon: XLogo},
  {label: "Instagram", href: "https://instagram.com/fran.dev_", Icon: InstagramLogo},
];

export const Contact = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section id="contacto" ref={sectionRef} className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{background: "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 18%, transparent), transparent 70%)"}}
      />

      <div className="container relative z-10 mx-auto px-4 pt-24 pb-40">
        <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
          {t("contact:kicker")}
        </p>
        <h2 className="reveal text-[clamp(32px,5.5vw,64px)] text-text mb-8 max-w-3xl">
          {t("contact:title")}
        </h2>

        <a
          href="mailto:fsolism@franciscosolis.cl"
          data-fs-hover
          className="reveal inline-block border-b border-accent-500 text-2xl sm:text-3xl text-text pb-1 mb-10"
        >
          fsolism@franciscosolis.cl
        </a>

        <div className="reveal flex flex-wrap items-center gap-3">
          {socials.map(({label, href, Icon}) => (
            <Button key={label} asChild variant="ghost" data-fs-hover>
              <a href={href} target="_blank" rel="noreferrer">
                <Icon size={18}/>
                {label}
              </a>
            </Button>
          ))}
          <Button variant="ghost" disabled className="opacity-50 gap-2">
            {t("contact:download_cv")}
            <Badge variant="neutral" size="sm">{t("contact:coming_soon")}</Badge>
          </Button>
        </div>

        <div className="reveal mt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-neutral-800 pt-6 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14}/> {t("contact:location")}
          </span>
          <span>{t("common:copyright", {year: new Date().getFullYear()})}</span>
        </div>
      </div>
    </section>
  );
};
