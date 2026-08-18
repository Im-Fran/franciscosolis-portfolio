import {useCallback, useState} from "react";
import {useTranslation} from "react-i18next";
import {ArrowClockwise, Desktop, Trash} from "@phosphor-icons/react";
import {Alert} from "@/components/ui/alert.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {authApi} from "@/lib/auth/api.ts";
import {useAuth} from "@/lib/auth/auth-context.ts";
import {describeUserAgent, formatDateTime} from "@/lib/auth/format.ts";
import {describeError, useResource} from "@/lib/auth/useResource.ts";
import {Panel, PanelState} from "@/pages/auth/components/panel.tsx";

/** Every live session of the account, with the one in use flagged and each revocable on its own. */
export const SessionsPanel = () => {
  const {t, i18n} = useTranslation();
  const {signOut} = useAuth();
  const sessions = useResource(useCallback((signal: AbortSignal) => authApi.sessions(signal), []));
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = sessions.data?.filter((session) => !session.revoked_at) ?? [];

  const revoke = async (id: string, current: boolean) => {
    setError(null);
    setRevoking(id);
    try {
      await authApi.revokeSession(id);
      /* Revoking the session in use is a sign-out — the tokens on this device are dead either way. */
      if (current) await signOut();
      else sessions.reload();
    } catch (cause) {
      setError(describeError(cause).message);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <Panel
      title={t("auth:account.sessions_title")}
      description={t("auth:account.sessions_description")}
      action={
        <Button variant="ghost" size="sm" onClick={sessions.reload} data-fs-hover>
          <ArrowClockwise size={14}/> {t("auth:common.refresh")}
        </Button>
      }
    >
      {error && <Alert tone="error" className="mb-4">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>}

      <PanelState
        loading={sessions.loading}
        error={sessions.error}
        empty={active.length === 0}
        emptyLabel={t("auth:account.sessions_empty")}
        onRetry={sessions.reload}
      >
        <ul className="flex flex-col divide-y divide-neutral-800">
          {active.map((session) => (
            <li key={session.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
              <Desktop size={20} className="shrink-0 text-neutral-500"/>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm text-text">
                  {describeUserAgent(session.user_agent) ?? t("auth:account.unknown_device")}
                  {session.current && <Badge variant="accent" size="sm">{t("auth:account.current_session")}</Badge>}
                </p>
                <p className="mt-1 text-[13px] text-neutral-500">
                  {[
                    session.application_id,
                    t(`auth:providers.${session.provider}`, {defaultValue: session.provider}),
                    session.ip,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-0.5 text-xs text-neutral-600">
                  {t("auth:account.last_seen", {value: formatDateTime(session.last_seen_at, i18n.language)})}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={revoking !== null}
                onClick={() => void revoke(session.id, session.current)}
                data-fs-hover
              >
                {revoking === session.id ? <Spinner size={14}/> : <Trash size={14}/>}
                {session.current ? t("auth:account.sign_out_here") : t("auth:account.revoke")}
              </Button>
            </li>
          ))}
        </ul>
      </PanelState>
    </Panel>
  );
};
