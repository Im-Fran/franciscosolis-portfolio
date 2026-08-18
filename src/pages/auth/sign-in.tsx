import {useTranslation} from "react-i18next";
import {Link, Navigate, useSearchParams} from "react-router-dom";
import {SignInPanel} from "@/components/auth/sign-in-panel.tsx";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {sanitizeReturnTo} from "@/lib/auth/config.ts";

/** Entry point of the auth interface: pick a provider and start the authorization code flow. */
export const SignIn = () => {
  const {t} = useTranslation();
  const {status, client} = useAuth();
  const [params] = useSearchParams();
  const returnTo = sanitizeReturnTo(params.get("return_to"), client.config);

  if (status === "authenticated") return <Navigate to={returnTo} replace/>;

  return (
    <SignInPanel
      ns="auth"
      client={client}
      returnTo={returnTo}
      footer={
        <>
          {t("auth:sign_in.invite_only")}{" "}
          <Link to="/" className="text-neutral-400 underline-offset-4 transition-colors hover:text-text" data-fs-hover>
            {t("auth:sign_in.back_home")}
          </Link>
        </>
      }
    />
  );
};
