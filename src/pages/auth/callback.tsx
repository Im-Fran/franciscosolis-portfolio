import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {Alert} from "@/components/ui/alert.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {AUTH_ROUTE} from "@/lib/auth/config.ts";
import {completeAuthorization} from "@/lib/auth/flow.ts";
import {describeError} from "@/lib/auth/useResource.ts";
import {AuthCard} from "@/pages/auth/components/auth-card.tsx";

/**
 * Landing point for both providers. Redeems the single-use authorization code, then hands over to
 * wherever the sign-in started from.
 */
export const Callback = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {reload} = useAuth();
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const code = params.get("code");
  const state = params.get("state");
  const providerError = params.get("error");
  const providerErrorDescription = params.get("error_description");

  useEffect(() => {
    if (providerError) {
      setError(providerErrorDescription || providerError);
      return;
    }
    if (!code || !state) {
      setError("missing-code");
      return;
    }

    let active = true;
    completeAuthorization(code, state)
      .then(async (returnTo) => {
        await reload();
        if (active) navigate(returnTo, {replace: true});
      })
      .catch((cause: unknown) => {
        if (active) setError(describeError(cause).message);
      });

    return () => {
      active = false;
    };
  }, [code, state, providerError, providerErrorDescription, navigate, reload]);

  if (error) {
    return (
      <AuthCard title={t("auth:callback.error_title")} subtitle={t("auth:callback.error_subtitle")}>
        <div className="flex flex-col gap-5">
          <Alert tone="error">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>
          <Button asChild data-fs-hover>
            <Link to={AUTH_ROUTE} replace>{t("auth:callback.retry")}</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("auth:callback.title")} subtitle={t("auth:callback.subtitle")}>
      <div className="flex items-center gap-3 text-sm text-neutral-400">
        <Spinner size={18} label={t("auth:callback.title")}/>
        {t("auth:callback.working")}
      </div>
    </AuthCard>
  );
};
