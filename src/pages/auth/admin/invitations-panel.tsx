import {useCallback, useState} from "react";
import type {FormEvent} from "react";
import {useTranslation} from "react-i18next";
import {ArrowClockwise, PaperPlaneTilt, Plus, Trash} from "@phosphor-icons/react";
import {Alert} from "@/components/ui/alert.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Field, Input, Select} from "@/components/ui/input.tsx";
import {Modal} from "@/components/ui/modal.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {authApi} from "@/lib/auth/api.ts";
import {loginUrl} from "@/lib/auth/config.ts";
import {formatDate} from "@/lib/auth/format.ts";
import {describeError, useResource} from "@/lib/auth/useResource.ts";
import {Panel, PanelState} from "@/pages/auth/components/panel.tsx";
import type {BadgeProps} from "@/components/ui/badge/badge-variants.ts";
import type {InvitationStatus} from "@/lib/auth/types.ts";

const statusTone = (status: InvitationStatus): BadgeProps["variant"] =>
  status === "pending" ? "accent" : status === "accepted" ? "neutral" : "outline";

/** Sign-up is invitation-only, so this list is what lets a new address sign in at all. */
export const InvitationsPanel = () => {
  const {t, i18n} = useTranslation();
  const invitations = useResource(useCallback((signal: AbortSignal) => authApi.admin.invitations(signal), []));
  const applications = useResource(useCallback((signal: AbortSignal) => authApi.admin.applications(signal), []));
  const roles = useResource(useCallback((signal: AbortSignal) => authApi.admin.roles(signal), []));

  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const revoke = async (id: string) => {
    setError(null);
    setRevoking(id);
    try {
      await authApi.admin.revokeInvitation(id);
      invitations.reload();
    } catch (cause) {
      setError(describeError(cause).message);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <Panel
      title={t("auth:admin.invitations.title")}
      description={t("auth:admin.invitations.description")}
      action={
        <>
          <Button variant="ghost" size="sm" onClick={invitations.reload} data-fs-hover>
            <ArrowClockwise size={14}/> {t("auth:common.refresh")}
          </Button>
          <Button size="sm" onClick={() => setCreating(true)} data-fs-hover>
            <Plus size={14}/> {t("auth:admin.invitations.invite")}
          </Button>
        </>
      }
    >
      {error && <Alert tone="error" className="mb-4">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>}

      <PanelState
        loading={invitations.loading}
        error={invitations.error}
        forbidden={invitations.status === 403}
        empty={invitations.data?.length === 0}
        emptyLabel={t("auth:admin.invitations.empty")}
        onRetry={invitations.reload}
      >
        <ul className="flex flex-col divide-y divide-neutral-800">
          {invitations.data?.map((invitation) => (
            <li key={invitation.id} className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text">{invitation.email}</p>
                <p className="text-[13px] text-neutral-500">
                  {[
                    invitation.application_id,
                    invitation.expires_at &&
                      t("auth:admin.invitations.expires", {value: formatDate(invitation.expires_at, i18n.language)}),
                  ]
                    .filter(Boolean)
                    .join(" · ") || t("auth:admin.invitations.global")}
                </p>
              </div>

              <Badge variant={statusTone(invitation.status)} size="sm">
                {t(`auth:admin.invitations.status.${invitation.status}`, {defaultValue: invitation.status})}
              </Badge>

              {invitation.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={revoking !== null}
                  onClick={() => void revoke(invitation.id)}
                  data-fs-hover
                >
                  {revoking === invitation.id ? <Spinner size={14}/> : <Trash size={14}/>}
                  {t("auth:common.revoke")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </PanelState>

      {creating && (
        <InviteDialog
          applications={(applications.data ?? []).map((application) => ({
            value: application.client_id,
            label: application.name,
          }))}
          roles={(roles.data ?? []).map((role) => ({value: role.id, label: `${role.name} (${role.slug})`}))}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            invitations.reload();
          }}
        />
      )}
    </Panel>
  );
};

type Option = {value: string; label: string};

const InviteDialog = ({
  applications,
  roles,
  onClose,
  onCreated,
}: {
  applications: Option[];
  roles: Option[];
  onClose: () => void;
  onCreated: () => void;
}) => {
  const {t} = useTranslation();
  const [email, setEmail] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("14");
  const [sendEmail, setSendEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await authApi.admin.createInvitation({
        email: email.trim(),
        application_id: applicationId || null,
        role_id: roleId || null,
        expires_in_days: Number(expiresInDays) || undefined,
        send_email: sendEmail,
        /* Points the emailed invitation at this interface rather than the API's own issuer. */
        login_url: loginUrl(),
      });
      onCreated();
    } catch (cause) {
      setError(describeError(cause).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t("auth:admin.invitations.invite")}>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <Field label={t("auth:admin.invitations.email_label")} htmlFor="invite-email">
          <Input
            id="invite-email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="persona@correo.cl"
          />
        </Field>

        <Field
          label={t("auth:admin.invitations.application_label")}
          htmlFor="invite-application"
          hint={t("auth:admin.invitations.application_hint")}
        >
          <Select id="invite-application" value={applicationId} onChange={(event) => setApplicationId(event.target.value)}>
            <option value="">{t("auth:admin.invitations.any_application")}</option>
            {applications.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </Field>

        <Field label={t("auth:admin.invitations.role_label")} htmlFor="invite-role">
          <Select id="invite-role" value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            <option value="">{t("auth:admin.invitations.default_role")}</option>
            {roles.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </Field>

        <Field label={t("auth:admin.invitations.expiry_label")} htmlFor="invite-expiry">
          <Input
            id="invite-expiry"
            type="number"
            min={1}
            max={90}
            value={expiresInDays}
            onChange={(event) => setExpiresInDays(event.target.value)}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300" data-fs-hover>
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(event) => setSendEmail(event.target.checked)}
            className="size-4 cursor-pointer accent-[var(--color-accent)]"
          />
          {t("auth:admin.invitations.send_email")}
        </label>

        {error && <Alert tone="error">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} data-fs-hover>
            {t("auth:common.cancel")}
          </Button>
          <Button type="submit" disabled={saving || !email.trim()} data-fs-hover>
            {saving ? <Spinner size={16}/> : <PaperPlaneTilt size={16}/>}
            {t("auth:admin.invitations.send")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
