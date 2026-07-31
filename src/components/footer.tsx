import {useTranslation} from "react-i18next";

const Footer = () => {
  const {t} = useTranslation();

  return (
    <footer className="py-6 text-center text-sm text-neutral-500">
      {t("common:footer_credit")}
    </footer>
  );
};

export default Footer;
