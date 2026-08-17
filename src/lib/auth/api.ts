import {request as webRequest} from "@/lib/auth/client.ts";
import type {RequestFn} from "@/lib/auth/client.ts";
import type {
  AdminUserDetail,
  AdminUserSummary,
  Application,
  ApplicationUpdate,
  CreatedApplication,
  Identity,
  Invitation,
  MeResponse,
  NewApplication,
  NewInvitation,
  NewRole,
  Permission,
  ProfileUpdate,
  Role,
  ServiceStatus,
  Session,
} from "@/lib/auth/types.ts";

export type AuthApi = ReturnType<typeof createAuthApi>;

/** Every endpoint of the auth API this interface talks to, grouped the way the API documents them. */
export const createAuthApi = (request: RequestFn) => ({
  /** Public: which providers this deployment actually has configured. */
  status: (signal?: AbortSignal) => request<ServiceStatus>("/", {auth: false, signal}),

  me: (signal?: AbortSignal) => request<MeResponse>("/me", {signal}),
  updateMe: (changes: ProfileUpdate) => request<MeResponse>("/me", {method: "PATCH", json: changes}),
  identities: (signal?: AbortSignal) => request<Identity[]>("/me/identities", {signal}),
  sessions: (signal?: AbortSignal) => request<Session[]>("/me/sessions", {signal}),
  revokeSession: (id: string) => request<void>(`/me/sessions/${encodeURIComponent(id)}`, {method: "DELETE"}),
  logout: () => request<void>("/logout", {method: "POST"}),

  admin: {
    users: (params: {query?: string; limit?: number; offset?: number} = {}, signal?: AbortSignal) => {
      const search = new URLSearchParams();
      if (params.query) search.set("query", params.query);
      if (params.limit !== undefined) search.set("limit", String(params.limit));
      if (params.offset) search.set("offset", String(params.offset));
      const query = search.toString();
      return request<AdminUserSummary[]>(`/admin/users${query ? `?${query}` : ""}`, {signal});
    },
    user: (id: string, signal?: AbortSignal) =>
      request<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`, {signal}),
    updateUser: (id: string, changes: {status: "active" | "disabled"}) =>
      request<unknown>(`/admin/users/${encodeURIComponent(id)}`, {method: "PATCH", json: changes}),
    grantRole: (id: string, roleId: string) =>
      request<void>(`/admin/users/${encodeURIComponent(id)}/roles`, {method: "POST", json: {role_id: roleId}}),
    revokeRole: (id: string, roleId: string) =>
      request<void>(`/admin/users/${encodeURIComponent(id)}/roles/${encodeURIComponent(roleId)}`, {
        method: "DELETE",
      }),
    revokeUserSessions: (id: string) =>
      request<void>(`/admin/users/${encodeURIComponent(id)}/sessions`, {method: "DELETE"}),

    invitations: (signal?: AbortSignal) => request<Invitation[]>("/admin/invitations", {signal}),
    createInvitation: (invitation: NewInvitation) =>
      request<Invitation>("/admin/invitations", {method: "POST", json: invitation}),
    revokeInvitation: (id: string) =>
      request<void>(`/admin/invitations/${encodeURIComponent(id)}`, {method: "DELETE"}),

    applications: (signal?: AbortSignal) => request<Application[]>("/admin/applications", {signal}),
    createApplication: (application: NewApplication) =>
      request<CreatedApplication>("/admin/applications", {method: "POST", json: application}),
    updateApplication: (id: string, changes: ApplicationUpdate) =>
      request<Application>(`/admin/applications/${encodeURIComponent(id)}`, {method: "PATCH", json: changes}),

    roles: (signal?: AbortSignal) => request<Role[]>("/admin/roles", {signal}),
    createRole: (role: NewRole) => request<Role>("/admin/roles", {method: "POST", json: role}),
    permissions: (signal?: AbortSignal) => request<Permission[]>("/admin/permissions", {signal}),
    attachPermission: (roleId: string, slug: string) =>
      request<void>(`/admin/roles/${encodeURIComponent(roleId)}/permissions`, {
        method: "POST",
        json: {permission_slug: slug},
      }),
    detachPermission: (roleId: string, slug: string) =>
      request<void>(`/admin/roles/${encodeURIComponent(roleId)}/permissions/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      }),
  },
});

/** Bound to the site's own client; other applications get theirs from `createAuthClient`. */
export const authApi = createAuthApi(webRequest);
