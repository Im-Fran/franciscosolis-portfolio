import {useTranslation} from "react-i18next";
import {Spinner} from "@/components/ui/spinner.tsx";

/** Fallback shown while an auth screen's chunk is fetched, and while a session is being restored. */
export const AuthLoading = ({label}: {label?: string}) => {
  const {t} = useTranslation();
  const message = label ?? t("auth:common.loading");

  return (
    <div className="flex flex-1 items-center justify-center gap-3 py-32 text-sm text-neutral-400">
      <Spinner size={20} label={message}/>
      {message}
    </div>
  );
};
