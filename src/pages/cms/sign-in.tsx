import {useTranslation} from "react-i18next";
import {Link, Navigate, useSearchParams} from "react-router-dom";
import {SignInPanel} from "@/components/auth/sign-in-panel.tsx";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {sanitizeReturnTo} from "@/lib/auth/config.ts";

/**
 * Entry point of the CMS: the same authorization code flow the rest of the site uses, started
 * under the CMS's own client id so the token comes back minted for this application.
 */
export const SignIn = () => {
  const {t} = useTranslation();
  const {status, client} = useAuth();
  const [params] = useSearchParams();
  const returnTo = sanitizeReturnTo(params.get("return_to"), client.config);

  if (status === "authenticated") return <Navigate to={returnTo} replace/>;

  return (
    <SignInPanel
      ns="cms"
      client={client}
      returnTo={returnTo}
      eyebrow={t("cms:app_name")}
      footer={
        <>
          {t("cms:sign_in.staff_only")}{" "}
          <Link to="/" className="text-neutral-400 underline-offset-4 transition-colors hover:text-text" data-fs-hover>
            {t("cms:sign_in.back_home")}
          </Link>
        </>
      }
    />
  );
};
