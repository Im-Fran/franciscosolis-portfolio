import {useEffect, useState} from 'react';
import {i18n} from "@/translations/translations.ts";
import {Button} from "@/components/ui/button/button.tsx";
import {useLocalStorage} from "usehooks-ts";

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useLocalStorage('cookie-consent', true);

  const handleAccept = () => setIsVisible(false);

  const [translations, setTranslations] = useState<{message: string | null | undefined; accept: string | null | undefined;}>(i18n.translations[i18n.locale].cookies)

  useEffect(() => i18n.onChange(() => setTranslations(i18n.translations[i18n.locale].cookies)), []);

  return isVisible && <div className={"flex flex-col gap-5 items-start justify-center fixed bottom-0 left-0 w-auto bg-black text-white text-start p-4 z-50 m-4 md:max-w-sm rounded-2xl"}>
      <p>{translations.message}</p>
      <Button onClick={handleAccept}>
        {translations.accept}
      </Button>
  </div>;
};

export default CookieConsentBanner;