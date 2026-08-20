import {useTranslation} from "react-i18next";
import {Avatar} from "@/components/ui/avatar.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Panel} from "@/components/ui/panel.tsx";
import {useAuth} from "@/lib/auth/auth-context.ts";
import type {CmsEditor} from "@/lib/cms/types.ts";

const Group = ({label, values, empty, accent}: {label: string; values: string[]; empty: string; accent?: boolean}) => (
  <div>
    <p className="mb-2 text-[13px] text-neutral-500">{label}</p>
    {values.length === 0 ? (
      <p className="text-sm text-neutral-500">{empty}</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge key={value} variant={accent ? "accent" : "outline"} size="sm">{value}</Badge>
        ))}
      </div>
    )}
  </div>
);

export type YourAccessProps = {editor: CmsEditor | null; className?: string};

/**
 * Who the API sees on every write from this tab, and what it currently lets that account do.
 *
 * `editor` is the copy `CmsProvider` already loaded, so this tile costs nothing to render — and
 * the note under it is the important part: the token, not this screen, is where the answer came
 * from.
 */
export const YourAccess = ({editor, className}: YourAccessProps) => {
  const {t} = useTranslation(["cms_overview", "cms"]);
  const {me} = useAuth();

  const user = me?.user;
  const name = user?.name ?? editor?.name ?? null;
  const email = user?.email ?? editor?.email ?? "";

  return (
    <Panel className={className} title={t("cms_overview:access.title")} description={t("cms_overview:access.description")}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Avatar name={name} email={email} picture={user?.picture ?? editor?.picture} size={40}/>
          <div className="min-w-0">
            <p className="truncate text-sm text-text">{name || email}</p>
            <p className="truncate text-[13px] text-neutral-500">{email}</p>
          </div>
        </div>

        <Group
          label={t("cms_overview:access.roles_label")}
          values={editor?.roles ?? []}
          empty={t("cms_overview:access.roles_empty")}
          accent
        />
        <Group
          label={t("cms_overview:access.permissions_label")}
          values={editor?.permissions ?? []}
          empty={t("cms_overview:access.permissions_empty")}
        />

        <p className="text-xs leading-relaxed text-neutral-500">{t("cms_overview:access.note")}</p>
      </div>
    </Panel>
  );
};
