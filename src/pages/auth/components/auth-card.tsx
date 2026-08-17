import type {ReactNode} from "react";
import {Link} from "react-router-dom";
import {GlobeSimple} from "@phosphor-icons/react";
import {BrandLockup} from "@/components/brand";
import {Button} from "@/components/ui/button/button.tsx";
import {useLanguageToggle} from "@/hooks/useLanguageToggle.ts";
import {cn} from "@/lib/utils.ts";

export type AuthCardProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/** The single centred panel the sign-in and callback screens are built on. */
export const AuthCard = ({title, subtitle, children, footer, className}: AuthCardProps) => {
  const {language, toggleLanguage} = useLanguageToggle();

  return (
    <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-3xl"
        style={{background: "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 20%, transparent), transparent 70%)"}}
      />

      <div className="absolute top-6 right-4 z-10">
        <Button variant="ghost" size="sm" onClick={toggleLanguage} data-fs-hover>
          <GlobeSimple size={16}/> {language === "es" ? "EN" : "ES"}
        </Button>
      </div>

      <div className={cn("relative z-10 w-full max-w-md", className)}>
        <Link to="/" className="mx-auto mb-10 flex w-fit" aria-label="FranciscoSolis" data-fs-hover>
          <BrandLockup size={34} tone="dark"/>
        </Link>

        <div className="rounded-[var(--radius-lg)] bg-surface p-7 shadow-[var(--shadow-md)]">
          <h1 className="text-[26px] leading-tight text-text">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-relaxed text-neutral-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-[13px] text-neutral-500">{footer}</div>}
      </div>
    </section>
  );
};
