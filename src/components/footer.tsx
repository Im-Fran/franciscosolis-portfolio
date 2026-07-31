import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";

const Footer = () => {
  const {t} = useTranslation();

  return (
    <footer className="py-6 flex flex-col items-center gap-2 text-center text-sm text-neutral-500">
      <span>{t("common:footer_credit")}</span>
      <Link to="/legal" className="text-neutral-500 hover:text-text transition-colors" data-fs-hover>
        {t("common:legal_link")}
      </Link>
    </footer>
  );
};

export default Footer;
