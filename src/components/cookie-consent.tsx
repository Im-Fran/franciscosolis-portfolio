import {Button} from "@/components/ui/button/button.tsx";
import {useLocalStorage} from "usehooks-ts";
import {useTranslation} from "react-i18next";

const CookieConsentBanner = () => {
  const { t } = useTranslation()

  const [isVisible, setIsVisible] = useLocalStorage('cookie-consent', true);

  const handleAccept = () => setIsVisible(false);

  return isVisible && <div className={"flex flex-col gap-5 items-start justify-center fixed bottom-0 left-0 w-auto bg-black text-white text-start p-4 z-50 m-4 md:max-w-sm rounded-2xl"}>
      <p>{t('cookie_consent')}</p>
      <Button onClick={handleAccept}>
        {t('accept')}
      </Button>
  </div>;
};

export default CookieConsentBanner;