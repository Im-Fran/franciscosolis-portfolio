import {useTranslation} from "react-i18next";
import {CallbackPanel} from "@/components/auth/callback-panel.tsx";

/** Where both providers return after a sign-in started from the CMS. */
export const Callback = () => {
  const {t} = useTranslation();

  return <CallbackPanel ns="cms" eyebrow={t("cms:app_name")}/>;
};
