import {useCallback} from "react";
import {useTranslation} from "react-i18next";
import {EnvelopeSimple, LinkSimple} from "@phosphor-icons/react";
import {SiGoogle} from "@icons-pack/react-simple-icons";
import {authApi} from "@/lib/auth/api.ts";
import {formatDateTime} from "@/lib/auth/format.ts";
import {useResource} from "@/lib/auth/useResource.ts";
import {Panel, PanelState} from "@/pages/auth/components/panel.tsx";

const providerIcon = (provider: string) => {
  if (provider === "google") return <SiGoogle size={18}/>;
  if (provider === "magic_link") return <EnvelopeSimple size={18}/>;
  return <LinkSimple size={18}/>;
};

/** The providers this account can sign in with. */
export const IdentitiesPanel = () => {
  const {t, i18n} = useTranslation();
  const identities = useResource(useCallback((signal: AbortSignal) => authApi.identities(signal), []));

  return (
    <Panel title={t("auth:account.identities_title")} description={t("auth:account.identities_description")}>
      <PanelState
        loading={identities.loading}
        error={identities.error}
        empty={identities.data?.length === 0}
        emptyLabel={t("auth:account.identities_empty")}
        onRetry={identities.reload}
      >
        <ul className="flex flex-col divide-y divide-neutral-800">
          {identities.data?.map((identity) => (
            <li key={identity.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
              <span className="shrink-0 text-neutral-400">{providerIcon(identity.provider)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text">
                  {t(`auth:providers.${identity.provider}`, {defaultValue: identity.provider})}
                </p>
                {identity.email && <p className="truncate text-[13px] text-neutral-500">{identity.email}</p>}
              </div>
              <p className="text-xs text-neutral-600">
                {identity.last_used_at
                  ? t("auth:account.last_used", {value: formatDateTime(identity.last_used_at, i18n.language)})
                  : t("auth:account.linked_on", {value: formatDateTime(identity.created_at, i18n.language)})}
              </p>
            </li>
          ))}
        </ul>
      </PanelState>
    </Panel>
  );
};
