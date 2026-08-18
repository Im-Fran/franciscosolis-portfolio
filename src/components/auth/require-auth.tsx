import type {ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {Navigate, useLocation} from "react-router-dom";
import {AuthLoading} from "@/components/auth/auth-loading.tsx";
import {useAuth} from "@/lib/auth/auth-context.ts";

/**
 * Gate for the signed-in areas. Anonymous visitors are sent to the sign-in screen of whichever
 * application the surrounding provider stands for, carrying the page they wanted, so the flow
 * resumes there instead of dropping them on a default landing.
 *
 * `restoringKey` names the copy shown while a stored session is being checked, so each application
 * can word the wait in its own namespace.
 */
export const RequireAuth = ({children, restoringKey}: {children: ReactNode; restoringKey?: string}) => {
  const {status, client} = useAuth();
  const location = useLocation();
  const {t} = useTranslation();

  if (status === "loading") return <AuthLoading label={restoringKey ? t(restoringKey) : undefined}/>;

  if (status === "anonymous") {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`${client.config.signInRoute}?return_to=${encodeURIComponent(returnTo)}`} replace/>;
  }

  return <>{children}</>;
};
