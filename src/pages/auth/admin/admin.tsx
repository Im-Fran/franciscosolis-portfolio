import {useTranslation} from "react-i18next";
import {useSearchParams} from "react-router-dom";
import {AppWindow, Envelope, ShieldCheck, Users} from "@phosphor-icons/react";
import {AuthShell} from "@/pages/auth/components/auth-shell.tsx";
import {ApplicationsPanel} from "@/pages/auth/admin/applications-panel.tsx";
import {InvitationsPanel} from "@/pages/auth/admin/invitations-panel.tsx";
import {RolesPanel} from "@/pages/auth/admin/roles-panel.tsx";
import {UsersPanel} from "@/pages/auth/admin/users-panel.tsx";
import {cn} from "@/lib/utils.ts";

const TABS = ["users", "invitations", "applications", "roles"] as const;
type Tab = (typeof TABS)[number];

const icons: Record<Tab, typeof Users> = {
  users: Users,
  invitations: Envelope,
  applications: AppWindow,
  roles: ShieldCheck,
};

const isTab = (value: string | null): value is Tab => TABS.includes(value as Tab);

/**
 * Admin console. Which sections a signed-in user may actually use is decided by the API — each
 * panel renders an explicit no-access state when its endpoint answers 403.
 */
export const Admin = () => {
  const {t} = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab: Tab = isTab(params.get("tab")) ? (params.get("tab") as Tab) : "users";

  return (
    <AuthShell title={t("auth:admin.title")}>
      <div className="mb-8">
        <h1 className="text-[clamp(26px,4vw,36px)] leading-tight text-text">{t("auth:admin.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">{t("auth:admin.subtitle")}</p>
      </div>

      <div role="tablist" aria-label={t("auth:admin.title")} className="mb-6 flex flex-wrap gap-2">
        {TABS.map((name) => {
          const Icon = icons[name];
          const active = tab === name;
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParams(name === "users" ? {} : {tab: name}, {replace: true})}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border px-4 py-2 text-sm transition-colors",
                active
                  ? "border-accent bg-accent-900/40 text-accent-200"
                  : "border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-text",
              )}
              data-fs-hover
            >
              <Icon size={16}/> {t(`auth:admin.tabs.${name}`)}
            </button>
          );
        })}
      </div>

      {tab === "users" && <UsersPanel/>}
      {tab === "invitations" && <InvitationsPanel/>}
      {tab === "applications" && <ApplicationsPanel/>}
      {tab === "roles" && <RolesPanel/>}
    </AuthShell>
  );
};
