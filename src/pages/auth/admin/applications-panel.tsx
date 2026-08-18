import {useCallback, useState} from "react";
import type {FormEvent} from "react";
import {useTranslation} from "react-i18next";
import {ArrowClockwise, Copy, PencilSimple, Plus} from "@phosphor-icons/react";
import {Alert} from "@/components/ui/alert.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Field, Input, Textarea} from "@/components/ui/input.tsx";
import {Modal} from "@/components/ui/modal.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {authApi} from "@/lib/auth/api.ts";
import {describeError, useResource} from "@/lib/auth/useResource.ts";
import {Panel, PanelState} from "@/pages/auth/components/panel.tsx";
import type {Application} from "@/lib/auth/types.ts";

const CLIENT_ID_PATTERN = "^[a-z0-9][a-z0-9-]{1,62}$";

const parseRedirectUris = (value: string) =>
  value
    .split(/[\n,]/)
    .map((uri) => uri.trim())
    .filter(Boolean);

/** Registered OAuth clients: which applications may start a sign-in and where they may be sent back. */
export const ApplicationsPanel = () => {
  const {t} = useTranslation();
  const applications = useResource(useCallback((signal: AbortSignal) => authApi.admin.applications(signal), []));
  const [editing, setEditing] = useState<Application | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <Panel
      title={t("auth:admin.applications.title")}
      description={t("auth:admin.applications.description")}
      action={
        <>
          <Button variant="ghost" size="sm" onClick={applications.reload} data-fs-hover>
            <ArrowClockwise size={14}/> {t("auth:common.refresh")}
          </Button>
          <Button size="sm" onClick={() => setCreating(true)} data-fs-hover>
            <Plus size={14}/> {t("auth:admin.applications.register")}
          </Button>
        </>
      }
    >
      <PanelState
        loading={applications.loading}
        error={applications.error}
        forbidden={applications.status === 403}
        empty={applications.data?.length === 0}
        emptyLabel={t("auth:admin.applications.empty")}
        onRetry={applications.reload}
      >
        <ul className="flex flex-col divide-y divide-neutral-800">
          {applications.data?.map((application) => (
            <li key={application.client_id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm text-text">
                  {application.name}
                  {application.confidential && (
                    <Badge variant="neutral" size="sm">{t("auth:admin.applications.confidential")}</Badge>
                  )}
                  {application.is_active === false && (
                    <Badge variant="outline" size="sm">{t("auth:admin.applications.inactive")}</Badge>
                  )}
                </p>
                <p className="truncate text-[13px] text-neutral-500">
                  <code>{application.client_id}</code>
                  {application.description ? ` · ${application.description}` : ""}
                </p>
                {application.redirect_uris && application.redirect_uris.length > 0 && (
                  <p className="mt-1 truncate text-xs text-neutral-600">{application.redirect_uris.join(" · ")}</p>
                )}
              </div>

              <Button variant="ghost" size="sm" onClick={() => setEditing(application)} data-fs-hover>
                <PencilSimple size={14}/> {t("auth:common.edit")}
              </Button>
            </li>
          ))}
        </ul>
      </PanelState>

      {(creating || editing) && (
        <ApplicationDialog
          application={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            applications.reload();
          }}
        />
      )}
    </Panel>
  );
};

const ApplicationDialog = ({
  application,
  onClose,
  onSaved,
}: {
  application: Application | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const {t} = useTranslation();
  const editing = application !== null;

  const [clientId, setClientId] = useState(application?.client_id ?? "");
  const [name, setName] = useState(application?.name ?? "");
  const [description, setDescription] = useState(application?.description ?? "");
  const [redirectUris, setRedirectUris] = useState((application?.redirect_uris ?? []).join("\n"));
  const [confidential, setConfidential] = useState(application?.confidential ?? false);
  const [isActive, setIsActive] = useState(application?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Shown once: only the hash is stored, so the secret cannot be read back later. */
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editing) {
        await authApi.admin.updateApplication(application.client_id, {
          name: name.trim(),
          description: description.trim() || null,
          redirect_uris: parseRedirectUris(redirectUris),
          is_active: isActive,
        });
        onSaved();
        return;
      }

      const created = await authApi.admin.createApplication({
        client_id: clientId.trim(),
        name: name.trim(),
        description: description.trim() || null,
        redirect_uris: parseRedirectUris(redirectUris),
        confidential,
      });

      /* Hold the dialog open while the one-time secret is on screen. */
      if (created?.client_secret) setSecret(created.client_secret);
      else onSaved();
    } catch (cause) {
      setError(describeError(cause).message);
    } finally {
      setSaving(false);
    }
  };

  if (secret) {
    return (
      <Modal open onClose={onSaved} title={t("auth:admin.applications.secret_title")}>
        <div className="flex flex-col gap-4">
          <Alert tone="info">{t("auth:admin.applications.secret_warning")}</Alert>
          <code className="rounded-[var(--radius-md)] border border-neutral-800 bg-bg p-3 text-xs break-all text-accent-200">
            {secret}
          </code>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                void navigator.clipboard?.writeText(secret).then(() => setCopied(true));
              }}
              data-fs-hover
            >
              <Copy size={16}/> {copied ? t("auth:common.copied") : t("auth:common.copy")}
            </Button>
            <Button onClick={onSaved} data-fs-hover>{t("auth:common.done")}</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? t("auth:admin.applications.edit_title") : t("auth:admin.applications.register")}
    >
      <form className="flex flex-col gap-4" onSubmit={submit}>
        {!editing && (
          <Field
            label={t("auth:admin.applications.client_id_label")}
            htmlFor="application-client-id"
            hint={t("auth:admin.applications.client_id_hint")}
          >
            <Input
              id="application-client-id"
              required
              autoFocus
              pattern={CLIENT_ID_PATTERN}
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="mi-aplicacion"
            />
          </Field>
        )}

        <Field label={t("auth:admin.applications.name_label")} htmlFor="application-name">
          <Input
            id="application-name"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field label={t("auth:admin.applications.description_label")} htmlFor="application-description">
          <Textarea
            id="application-description"
            rows={2}
            value={description ?? ""}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>

        <Field
          label={t("auth:admin.applications.redirect_uris_label")}
          htmlFor="application-redirect-uris"
          hint={t("auth:admin.applications.redirect_uris_hint")}
        >
          <Textarea
            id="application-redirect-uris"
            required
            rows={3}
            value={redirectUris}
            onChange={(event) => setRedirectUris(event.target.value)}
            placeholder="https://franciscosolis.cl/auth/callback"
            className="font-mono text-xs"
          />
        </Field>

        {editing ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300" data-fs-hover>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 cursor-pointer accent-[var(--color-accent)]"
            />
            {t("auth:admin.applications.active")}
          </label>
        ) : (
          <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-300" data-fs-hover>
            <input
              type="checkbox"
              checked={confidential}
              onChange={(event) => setConfidential(event.target.checked)}
              className="mt-0.5 size-4 cursor-pointer accent-[var(--color-accent)]"
            />
            <span>
              {t("auth:admin.applications.confidential")}
              <span className="block text-xs text-neutral-500">
                {t("auth:admin.applications.confidential_hint")}
              </span>
            </span>
          </label>
        )}

        {error && <Alert tone="error">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} data-fs-hover>
            {t("auth:common.cancel")}
          </Button>
          <Button type="submit" disabled={saving} data-fs-hover>
            {saving && <Spinner size={16}/>}
            {editing ? t("auth:common.save") : t("auth:admin.applications.register")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
