import type {ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {AUTH_ROUTE} from "@/lib/auth/config.ts";
import {AuthLoading} from "@/pages/auth/components/auth-loading.tsx";

/**
 * Gate for the signed-in areas. Anonymous visitors are sent to sign-in with the page they wanted,
 * so the flow resumes there instead of dropping them on the account screen.
 */
export const RequireAuth = ({children}: {children: ReactNode}) => {
  const {status} = useAuth();
  const location = useLocation();
  const {t} = useTranslation();

  if (status === "loading") return <AuthLoading label={t("auth:account.restoring")}/>;

  if (status === "anonymous") {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`${AUTH_ROUTE}?return_to=${encodeURIComponent(returnTo)}`} replace/>;
  }

  return <>{children}</>;
};
