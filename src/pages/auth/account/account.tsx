import type {ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {Alert} from "@/components/ui/alert.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {formatDateTime} from "@/lib/auth/format.ts";
import {AuthShell} from "@/pages/auth/components/auth-shell.tsx";
import {Panel} from "@/pages/auth/components/panel.tsx";
import {IdentitiesPanel} from "@/pages/auth/account/identities-panel.tsx";
import {ProfileForm} from "@/pages/auth/account/profile-form.tsx";
import {SessionsPanel} from "@/pages/auth/account/sessions-panel.tsx";

/** What the account holds: profile, granted access, linked providers and live sessions. */
export const Account = () => {
  const {t, i18n} = useTranslation();
  const {me, error} = useAuth();

  if (!me) return null;

  const {user, roles, permissions, application_id} = me;

  return (
    <AuthShell title={t("auth:account.title")}>
      <div className="mb-8">
        <h1 className="text-[clamp(26px,4vw,36px)] leading-tight text-text">{t("auth:account.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">{t("auth:account.subtitle")}</p>
      </div>

      {error === "network" && (
        <Alert tone="error" className="mb-6">{t("auth:errors.network")}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <ProfileForm user={user}/>
          <SessionsPanel/>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title={t("auth:account.access_title")} description={t("auth:account.access_description", {application: application_id})}>
            <dl className="flex flex-col gap-5 text-sm">
              <div>
                <dt className="text-[13px] text-neutral-500">{t("auth:account.roles_label")}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {roles.length === 0 ? (
                    <span className="text-[13px] text-neutral-600">{t("auth:account.roles_empty")}</span>
                  ) : (
                    roles.map((role) => <Badge key={role} variant="accent">{role}</Badge>)
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-[13px] text-neutral-500">{t("auth:account.permissions_label")}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {permissions.length === 0 ? (
                    <span className="text-[13px] text-neutral-600">{t("auth:account.permissions_empty")}</span>
                  ) : (
                    permissions.map((permission) => (
                      <Badge key={permission} variant="neutral" size="sm">{permission}</Badge>
                    ))
                  )}
                </dd>
              </div>
            </dl>
          </Panel>

          <IdentitiesPanel/>

          <Panel title={t("auth:account.details_title")}>
            <dl className="flex flex-col gap-3 text-sm">
              <Detail label={t("auth:account.status_label")}>
                <Badge variant={user.status === "active" ? "accent" : "outline"} size="sm">
                  {t(`auth:status.${user.status}`, {defaultValue: user.status})}
                </Badge>
              </Detail>
              <Detail label={t("auth:account.email_verified_label")}>
                {t(user.email_verified ? "auth:common.yes" : "auth:common.no")}
              </Detail>
              <Detail label={t("auth:account.member_since_label")}>
                {formatDateTime(user.created_at, i18n.language)}
              </Detail>
              <Detail label={t("auth:account.last_login_label")}>
                {formatDateTime(user.last_login_at, i18n.language) ?? "—"}
              </Detail>
              <Detail label={t("auth:account.user_id_label")}>
                <code className="text-xs break-all text-neutral-400">{user.id}</code>
              </Detail>
            </dl>
          </Panel>
        </div>
      </div>
    </AuthShell>
  );
};

const Detail = ({label, children}: {label: string; children: ReactNode}) => (
  <div className="flex flex-wrap items-baseline justify-between gap-3">
    <dt className="text-[13px] text-neutral-500">{label}</dt>
    <dd className="text-right text-[13px] text-neutral-300">{children}</dd>
  </div>
);
