import {useState} from "react";
import type {ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {ArrowSquareOut, GlobeSimple, SignOut} from "@phosphor-icons/react";
import {BrandLockup} from "@/components/brand";
import {Avatar} from "@/components/ui/avatar.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {useLanguageToggle} from "@/hooks/useLanguageToggle.ts";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {CMS_ROUTE} from "@/lib/cms/config.ts";

/** Header and page frame shared by every signed-in CMS screen. */
export const CmsShell = ({title, children}: {title: string; children: ReactNode}) => {
  const {t} = useTranslation();
  const {language, toggleLanguage} = useLanguageToggle();
  const {me, signOut} = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const user = me?.user;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-neutral-800">
        <div className="container mx-auto flex flex-wrap items-center gap-4 px-4 py-4">
          <Link to={CMS_ROUTE} className="flex items-center gap-2.5" aria-label={title} data-fs-hover>
            <BrandLockup size={28} tone="dark"/>
            <Badge variant="accent" size="sm">{t("cms:app_name")}</Badge>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild data-fs-hover>
              <Link to="/">
                <ArrowSquareOut size={16}/>
                <span className="hidden sm:inline">{t("cms:nav.site")}</span>
              </Link>
            </Button>

            <Button variant="ghost" size="sm" onClick={toggleLanguage} data-fs-hover>
              <GlobeSimple size={16}/> {language === "es" ? "EN" : "ES"}
            </Button>

            {user && (
              <span className="hidden items-center gap-2 rounded-[var(--radius-md)] border border-neutral-800 py-1.5 pr-3 pl-1.5 sm:inline-flex">
                <Avatar name={user.name} email={user.email} picture={user.picture} size={26}/>
                <span className="max-w-[180px] truncate text-[13px] text-neutral-300">{user.email}</span>
              </span>
            )}

            <Button
              variant="secondary"
              size="sm"
              disabled={signingOut}
              onClick={() => {
                setSigningOut(true);
                void signOut().finally(() => setSigningOut(false));
              }}
              data-fs-hover
            >
              {signingOut ? <Spinner size={14}/> : <SignOut size={16}/>}
              <span className="hidden sm:inline">{t("cms:nav.sign_out")}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto w-full flex-1 px-4 py-10">{children}</div>
    </div>
  );
};
