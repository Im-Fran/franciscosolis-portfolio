import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {MapPin} from "@phosphor-icons/react";
import {BrandLockup} from "@/components/brand";
import {AccessibilityLauncher} from "@/components/a11y";

const Footer = () => {
  const {t} = useTranslation();

  return (
    <footer className="border-t border-neutral-800 py-6 text-sm text-neutral-500">
      <div className="container mx-auto px-4 pb-6 mb-6 border-b border-neutral-800 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Link to="/" aria-label="FranciscoSolis" data-fs-hover>
          <BrandLockup size={30} tone="auto"/>
        </Link>
        <AccessibilityLauncher/>
      </div>
      <div className="container mx-auto px-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <span className="inline-flex items-center gap-1">
          <MapPin size={14}/> {t("contact:location")}
        </span>
        <span className="flex flex-col items-center gap-1 sm:flex-row sm:gap-4">
          <span>{t("common:footer_credit")}</span>
          <Link to="/brand" className="text-neutral-500 hover:text-text transition-colors" data-fs-hover>
            {t("common:brand_link")}
          </Link>
          <Link to="/legal" className="text-neutral-500 hover:text-text transition-colors" data-fs-hover>
            {t("common:legal_link")}
          </Link>
        </span>
        <span>{t("common:copyright", {year: new Date().getFullYear()})}</span>
      </div>
    </footer>
  );
};

export default Footer;
