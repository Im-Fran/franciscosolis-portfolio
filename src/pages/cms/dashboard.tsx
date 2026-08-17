import {useCallback} from "react";
import type {ReactNode} from "react";
import {useTranslation} from "react-i18next";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Avatar} from "@/components/ui/avatar.tsx";
import {Panel, PanelState} from "@/components/ui/panel.tsx";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {formatDateTime} from "@/lib/auth/format.ts";
import {useResource} from "@/lib/auth/useResource.ts";
import {cmsApi} from "@/lib/cms/client.ts";
import {CmsShell} from "@/pages/cms/components/cms-shell.tsx";
import {NoAccess} from "@/pages/cms/components/no-access.tsx";

const Detail = ({label, children}: {label: string; children: ReactNode}) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-800/70 py-2 last:border-0">
    <span className="text-[13px] text-neutral-500">{label}</span>
    <span className="min-w-0 truncate text-[13px] text-neutral-300">{children}</span>
  </div>
);

/**
 * What the CMS shows once a session is in place: who is signed in, what that account may do here
 * and which collections the service manages. The editing screens themselves land on top of this.
 */
export const Dashboard = () => {
  const {t, i18n} = useTranslation();
  const {me} = useAuth();

  const editor = useResource(useCallback((signal: AbortSignal) => cmsApi.me(signal), []));
  const collections = useResource(useCallback((signal: AbortSignal) => cmsApi.collections(signal), []));

  /* A session is not an invitation: the CMS answers 403 for an account it does not admit. */
  if (editor.status === 403) return <NoAccess email={me?.user.email}/>;

  const user = me?.user;
  const roles = editor.data?.roles ?? [];
  const permissions = editor.data?.permissions ?? [];

  return (
    <CmsShell title={t("cms:dashboard.title")}>
      <div className="mb-8">
        <h1 className="text-[28px] leading-tight text-text">{t("cms:dashboard.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">{t("cms:dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("cms:dashboard.session_title")} description={t("cms:dashboard.session_description")}>
          {user && (
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={user.name} email={user.email} picture={user.picture} size={44}/>
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{user.name || user.email}</p>
                <p className="truncate text-[13px] text-neutral-500">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <Detail label={t("cms:dashboard.application_label")}>
              {editor.data?.application_id ?? me?.application_id ?? "—"}
            </Detail>
            <Detail label={t("cms:dashboard.session_id_label")}>
              <code className="font-mono text-xs">{editor.data?.session_id ?? me?.session_id ?? "—"}</code>
            </Detail>
            <Detail label={t("cms:dashboard.last_login_label")}>
              {formatDateTime(user?.last_login_at, i18n.language) ?? "—"}
            </Detail>
            <Detail label={t("cms:dashboard.email_verified_label")}>
              {user?.email_verified ? t("cms:common.yes") : t("cms:common.no")}
            </Detail>
          </div>
        </Panel>

        <Panel title={t("cms:dashboard.access_title")} description={t("cms:dashboard.access_description")}>
          <PanelState
            ns="cms"
            loading={editor.loading}
            error={editor.error}
            onRetry={editor.reload}
          >
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-[13px] text-neutral-500">{t("cms:dashboard.roles_label")}</p>
                {roles.length === 0 ? (
                  <p className="text-sm text-neutral-500">{t("cms:dashboard.roles_empty")}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge key={role} variant="accent" size="sm">{role}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-[13px] text-neutral-500">{t("cms:dashboard.permissions_label")}</p>
                {permissions.length === 0 ? (
                  <p className="text-sm text-neutral-500">{t("cms:dashboard.permissions_empty")}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permission) => (
                      <Badge key={permission} size="sm">{permission}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs leading-relaxed text-neutral-500">{t("cms:dashboard.access_note")}</p>
            </div>
          </PanelState>
        </Panel>

        <Panel
          className="lg:col-span-2"
          title={t("cms:dashboard.collections_title")}
          description={t("cms:dashboard.collections_description")}
        >
          <PanelState
            ns="cms"
            loading={collections.loading}
            error={collections.error}
            empty={collections.data?.length === 0}
            emptyLabel={t("cms:dashboard.collections_empty")}
            onRetry={collections.reload}
          >
            <ul className="grid gap-3 sm:grid-cols-2">
              {collections.data?.map((collection) => (
                <li
                  key={collection.slug}
                  className="rounded-[var(--radius-md)] border border-neutral-800 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text">{collection.name}</span>
                    <Badge size="sm">{collection.slug}</Badge>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">{collection.description}</p>
                </li>
              ))}
            </ul>
          </PanelState>

          <p className="mt-5 text-xs leading-relaxed text-neutral-500">{t("cms:dashboard.editing_soon")}</p>
        </Panel>
      </div>
    </CmsShell>
  );
};
