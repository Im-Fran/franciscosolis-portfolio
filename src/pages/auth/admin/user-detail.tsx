import {useCallback, useState} from "react";
import {useTranslation} from "react-i18next";
import {Prohibit, ShieldCheck, SignOut, X} from "@phosphor-icons/react";
import {Alert} from "@/components/ui/alert.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Select} from "@/components/ui/input.tsx";
import {Modal} from "@/components/ui/modal.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {authApi} from "@/lib/auth/api.ts";
import {describeUserAgent, formatDateTime} from "@/lib/auth/format.ts";
import {describeError, useResource} from "@/lib/auth/useResource.ts";
import {Avatar} from "@/pages/auth/components/auth-shell.tsx";
import {PanelState} from "@/pages/auth/components/panel.tsx";
import type {Role} from "@/lib/auth/types.ts";

export type UserDetailProps = {
  userId: string;
  roles: Role[];
  onClose: () => void;
  /** Lets the list behind the dialog pick up a status change. */
  onChanged: () => void;
};

/** Everything an administrator can do to one account, in a single dialog. */
export const UserDetail = ({userId, roles, onClose, onChanged}: UserDetailProps) => {
  const {t, i18n} = useTranslation();
  const detail = useResource(useCallback((signal: AbortSignal) => authApi.admin.user(userId, signal), [userId]));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roleToGrant, setRoleToGrant] = useState("");

  const user = detail.data?.user;
  const heldRoles = detail.data?.roles ?? [];
  const grantable = roles.filter((role) => !heldRoles.some((held) => held.id === role.id));

  const run = async (key: string, action: () => Promise<unknown>) => {
    setError(null);
    setBusy(key);
    try {
      await action();
      detail.reload();
      onChanged();
    } catch (cause) {
      setError(describeError(cause).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal open onClose={onClose} title={t("auth:admin.users.detail_title")} className="max-w-2xl">
      <PanelState
        loading={detail.loading}
        error={detail.error}
        forbidden={detail.status === 403}
        onRetry={detail.reload}
      >
        {user && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} email={user.email ?? ""} picture={user.picture} size={48}/>
              <div className="min-w-0">
                <p className="truncate text-text">{user.name || user.email || user.id}</p>
                {user.name && user.email && <p className="truncate text-[13px] text-neutral-500">{user.email}</p>}
                <p className="mt-1 flex flex-wrap items-center gap-2">
                  {user.status && (
                    <Badge variant={user.status === "active" ? "accent" : "outline"} size="sm">
                      {t(`auth:status.${user.status}`, {defaultValue: user.status})}
                    </Badge>
                  )}
                  {user.email_verified === false && (
                    <Badge variant="outline" size="sm">{t("auth:admin.users.unverified")}</Badge>
                  )}
                </p>
              </div>
            </div>

            {error && <Alert tone="error">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>}

            <section>
              <h4 className="mb-2 text-[13px] text-neutral-500">{t("auth:admin.users.roles_label")}</h4>
              {heldRoles.length === 0 ? (
                <p className="text-[13px] text-neutral-600">{t("auth:admin.users.roles_empty")}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {heldRoles.map((role) => (
                    <li key={role.id}>
                      <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-accent-800/60 py-1 pr-1.5 pl-2.5 text-xs text-accent-200">
                        {role.name}
                        <button
                          type="button"
                          aria-label={t("auth:admin.users.revoke_role", {role: role.name})}
                          disabled={busy !== null}
                          onClick={() => void run(`role-${role.id}`, () => authApi.admin.revokeRole(userId, role.id))}
                          className="cursor-pointer rounded-full p-0.5 text-accent-300 transition-colors hover:bg-accent-700/60 hover:text-white disabled:opacity-50"
                        >
                          {busy === `role-${role.id}` ? <Spinner size={12}/> : <X size={12}/>}
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {grantable.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Select
                    aria-label={t("auth:admin.users.grant_role")}
                    value={roleToGrant}
                    onChange={(event) => setRoleToGrant(event.target.value)}
                    className="h-9 w-auto min-w-[200px] text-[13px]"
                  >
                    <option value="">{t("auth:admin.users.grant_role")}</option>
                    {grantable.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} ({role.slug})
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    disabled={!roleToGrant || busy !== null}
                    onClick={() =>
                      void run("grant", async () => {
                        await authApi.admin.grantRole(userId, roleToGrant);
                        setRoleToGrant("");
                      })
                    }
                    data-fs-hover
                  >
                    {busy === "grant" ? <Spinner size={14}/> : <ShieldCheck size={14}/>}
                    {t("auth:admin.users.grant")}
                  </Button>
                </div>
              )}
            </section>

            {detail.data?.identities && detail.data.identities.length > 0 && (
              <section>
                <h4 className="mb-2 text-[13px] text-neutral-500">{t("auth:admin.users.identities_label")}</h4>
                <ul className="flex flex-wrap gap-2">
                  {detail.data.identities.map((identity) => (
                    <li key={identity.id}>
                      <Badge variant="neutral" size="sm">
                        {t(`auth:providers.${identity.provider}`, {defaultValue: identity.provider})}
                        {identity.email ? ` · ${identity.email}` : ""}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {detail.data?.sessions && detail.data.sessions.length > 0 && (
              <section>
                <h4 className="mb-2 text-[13px] text-neutral-500">{t("auth:admin.users.sessions_label")}</h4>
                <ul className="flex flex-col gap-2 text-[13px] text-neutral-400">
                  {detail.data.sessions
                    .filter((session) => !session.revoked_at)
                    .map((session) => (
                      <li key={session.id} className="flex flex-wrap justify-between gap-2">
                        <span>{describeUserAgent(session.user_agent) ?? session.application_id}</span>
                        <span className="text-neutral-600">
                          {formatDateTime(session.last_seen_at, i18n.language)}
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            )}

            <footer className="flex flex-wrap gap-2 border-t border-neutral-800 pt-5">
              <Button
                variant="secondary"
                size="sm"
                disabled={busy !== null}
                onClick={() =>
                  void run("status", () =>
                    authApi.admin.updateUser(userId, {status: user.status === "disabled" ? "active" : "disabled"}),
                  )
                }
                data-fs-hover
              >
                {busy === "status" ? <Spinner size={14}/> : <Prohibit size={14}/>}
                {user.status === "disabled" ? t("auth:admin.users.enable") : t("auth:admin.users.disable")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={busy !== null}
                onClick={() => void run("sessions", () => authApi.admin.revokeUserSessions(userId))}
                data-fs-hover
              >
                {busy === "sessions" ? <Spinner size={14}/> : <SignOut size={14}/>}
                {t("auth:admin.users.revoke_sessions")}
              </Button>
            </footer>

            <p className="text-xs text-neutral-600">
              <code className="break-all">{user.id}</code>
            </p>
          </div>
        )}
      </PanelState>
    </Modal>
  );
};
