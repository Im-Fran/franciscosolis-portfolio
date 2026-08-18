import {useCallback, useState} from "react";
import type {FormEvent} from "react";
import {useTranslation} from "react-i18next";
import {ArrowClockwise, Plus, X} from "@phosphor-icons/react";
import {Alert} from "@/components/ui/alert.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Field, Input, Select, Textarea} from "@/components/ui/input.tsx";
import {Modal} from "@/components/ui/modal.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {authApi} from "@/lib/auth/api.ts";
import {describeError, useResource} from "@/lib/auth/useResource.ts";
import {Panel, PanelState} from "@/pages/auth/components/panel.tsx";
import type {Permission, Role} from "@/lib/auth/types.ts";

const ROLE_SLUG_PATTERN = "^[a-z0-9][a-z0-9_-]{1,62}$";

/** Roles and the permissions attached to them. Permissions themselves are seeded, not created here. */
export const RolesPanel = () => {
  const {t} = useTranslation();
  const roles = useResource(useCallback((signal: AbortSignal) => authApi.admin.roles(signal), []));
  const permissions = useResource(useCallback((signal: AbortSignal) => authApi.admin.permissions(signal), []));
  const applications = useResource(useCallback((signal: AbortSignal) => authApi.admin.applications(signal), []));

  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (key: string, action: () => Promise<unknown>) => {
    setError(null);
    setBusy(key);
    try {
      await action();
      roles.reload();
    } catch (cause) {
      setError(describeError(cause).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Panel
      title={t("auth:admin.roles.title")}
      description={t("auth:admin.roles.description")}
      action={
        <>
          <Button variant="ghost" size="sm" onClick={roles.reload} data-fs-hover>
            <ArrowClockwise size={14}/> {t("auth:common.refresh")}
          </Button>
          <Button size="sm" onClick={() => setCreating(true)} data-fs-hover>
            <Plus size={14}/> {t("auth:admin.roles.create")}
          </Button>
        </>
      }
    >
      {error && <Alert tone="error" className="mb-4">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>}

      <PanelState
        loading={roles.loading}
        error={roles.error}
        forbidden={roles.status === 403}
        empty={roles.data?.length === 0}
        emptyLabel={t("auth:admin.roles.empty")}
        onRetry={roles.reload}
      >
        <ul className="flex flex-col divide-y divide-neutral-800">
          {roles.data?.map((role) => (
            <RoleRow
              key={role.id}
              role={role}
              permissions={permissions.data ?? []}
              busy={busy}
              onAttach={(slug) => mutate(`attach-${role.id}`, () => authApi.admin.attachPermission(role.id, slug))}
              onDetach={(slug) =>
                mutate(`detach-${role.id}-${slug}`, () => authApi.admin.detachPermission(role.id, slug))
              }
            />
          ))}
        </ul>
      </PanelState>

      {creating && (
        <RoleDialog
          permissions={permissions.data ?? []}
          applications={(applications.data ?? []).map((application) => ({
            value: application.client_id,
            label: application.name,
          }))}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            roles.reload();
          }}
        />
      )}
    </Panel>
  );
};

const RoleRow = ({
  role,
  permissions,
  busy,
  onAttach,
  onDetach,
}: {
  role: Role;
  permissions: Permission[];
  busy: string | null;
  onAttach: (slug: string) => void;
  onDetach: (slug: string) => void;
}) => {
  const {t} = useTranslation();
  const [toAttach, setToAttach] = useState("");
  const attachable = permissions.filter((permission) => !role.permissions.includes(permission.slug));

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="text-sm text-text">{role.name}</p>
        <code className="text-xs text-neutral-500">{role.slug}</code>
        <Badge variant={role.application_id ? "neutral" : "accent"} size="sm">
          {role.application_id ?? t("auth:admin.roles.global")}
        </Badge>
        {role.is_default && <Badge variant="outline" size="sm">{t("auth:admin.roles.default")}</Badge>}
      </div>

      {role.description && <p className="mt-1 text-[13px] text-neutral-500">{role.description}</p>}

      <ul className="mt-3 flex flex-wrap gap-2">
        {role.permissions.length === 0 && (
          <li className="text-[13px] text-neutral-600">{t("auth:admin.roles.no_permissions")}</li>
        )}
        {role.permissions.map((slug) => (
          <li key={slug}>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-neutral-800 py-1 pr-1.5 pl-2.5 text-xs text-neutral-300">
              {slug}
              <button
                type="button"
                aria-label={t("auth:admin.roles.detach", {permission: slug})}
                disabled={busy !== null}
                onClick={() => onDetach(slug)}
                className="cursor-pointer rounded-full p-0.5 text-neutral-500 transition-colors hover:bg-neutral-700 hover:text-text disabled:opacity-50"
              >
                {busy === `detach-${role.id}-${slug}` ? <Spinner size={12}/> : <X size={12}/>}
              </button>
            </span>
          </li>
        ))}
      </ul>

      {attachable.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select
            aria-label={t("auth:admin.roles.attach")}
            value={toAttach}
            onChange={(event) => setToAttach(event.target.value)}
            className="h-9 w-auto min-w-[220px] text-[13px]"
          >
            <option value="">{t("auth:admin.roles.attach")}</option>
            {attachable.map((permission) => (
              <option key={permission.id} value={permission.slug}>
                {permission.slug}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            variant="secondary"
            disabled={!toAttach || busy !== null}
            onClick={() => {
              onAttach(toAttach);
              setToAttach("");
            }}
            data-fs-hover
          >
            {busy === `attach-${role.id}` ? <Spinner size={14}/> : <Plus size={14}/>}
            {t("auth:admin.roles.add")}
          </Button>
        </div>
      )}
    </li>
  );
};

const RoleDialog = ({
  permissions,
  applications,
  onClose,
  onCreated,
}: {
  permissions: Permission[];
  applications: {value: string; label: string}[];
  onClose: () => void;
  onCreated: () => void;
}) => {
  const {t} = useTranslation();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (permissionSlug: string) =>
    setSelected((current) =>
      current.includes(permissionSlug)
        ? current.filter((value) => value !== permissionSlug)
        : [...current, permissionSlug],
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await authApi.admin.createRole({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim() || null,
        application_id: applicationId || null,
        is_default: isDefault,
        permissions: selected,
      });
      onCreated();
    } catch (cause) {
      setError(describeError(cause).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t("auth:admin.roles.create")}>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <Field label={t("auth:admin.roles.name_label")} htmlFor="role-name">
          <Input
            id="role-name"
            required
            autoFocus
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field label={t("auth:admin.roles.slug_label")} htmlFor="role-slug" hint={t("auth:admin.roles.slug_hint")}>
          <Input
            id="role-slug"
            required
            pattern={ROLE_SLUG_PATTERN}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="editor"
          />
        </Field>

        <Field label={t("auth:admin.roles.description_label")} htmlFor="role-description">
          <Textarea
            id="role-description"
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>

        <Field
          label={t("auth:admin.roles.application_label")}
          htmlFor="role-application"
          hint={t("auth:admin.roles.application_hint")}
        >
          <Select id="role-application" value={applicationId} onChange={(event) => setApplicationId(event.target.value)}>
            <option value="">{t("auth:admin.roles.global")}</option>
            {applications.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </Field>

        {permissions.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-neutral-300">
              {t("auth:admin.roles.permissions_label")}
            </legend>
            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-[var(--radius-md)] border border-neutral-800 p-3">
              {permissions.map((permission) => {
                const checked = selected.includes(permission.slug);
                return (
                  <label
                    key={permission.id}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5 py-1 text-xs transition-colors ${
                      checked
                        ? "border-accent bg-accent-900/50 text-accent-200"
                        : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                    }`}
                    data-fs-hover
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(permission.slug)} className="sr-only"/>
                    {permission.slug}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300" data-fs-hover>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(event) => setIsDefault(event.target.checked)}
            className="size-4 cursor-pointer accent-[var(--color-accent)]"
          />
          {t("auth:admin.roles.is_default")}
        </label>

        {error && <Alert tone="error">{t(`auth:errors.${error}`, {defaultValue: error})}</Alert>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} data-fs-hover>
            {t("auth:common.cancel")}
          </Button>
          <Button type="submit" disabled={saving || !name.trim() || !slug.trim()} data-fs-hover>
            {saving && <Spinner size={16}/>}
            {t("auth:admin.roles.create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
