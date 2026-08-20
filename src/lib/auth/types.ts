/**
 * Types mirroring the FranciscoSolis Auth API (https://api.franciscosolis.cl/auth/openapi.json).
 *
 * The admin list endpoints only *guarantee* a small set of keys in their schema; the extra fields
 * below are the ones the service sends in practice, so they are typed optional and every view
 * renders them defensively.
 */

/** Envelope every endpoint answers with, except the OAuth token endpoint. */
export type ApiEnvelope<T> = { code: number; data: T };
export type ApiErrorBody = { code: number; error: string };

/* ── Service metadata ─────────────────────────────────────────────────────── */

export type AuthProviderName = "magic_link" | "google";

export type AuthProviderInfo = {
  name: AuthProviderName | (string & {});
  display_name: string;
  /** `email` providers are started with a POST, `redirect` ones by navigating away. */
  initiation: "email" | "redirect" | (string & {});
  start_path: string;
  /** False when this deployment has no secrets configured for the provider. */
  available: boolean;
};

export type ServiceStatus = {
  message: string;
  issuer: string;
  providers: AuthProviderInfo[];
};

/* ── Parked authorization requests ────────────────────────────────────────── */

/** One provider as offered for a parked request, with the URL that starts it. */
export type PendingAuthorizationProvider = {
  name: AuthProviderName | (string & {});
  display_name: string;
  /** `email` providers are started by posting an address, `redirect` ones by navigating away. */
  initiation: "email" | "redirect" | (string & {});
  /** Absolute URL on the auth service that resumes this request through the provider. */
  start_url: string;
};

/**
 * A request parked by `GET /oauth/authorize`, as the hosted sign-in screen reads it.
 *
 * It carries only what the browser holding the handle already sent — the client's `state` and
 * `nonce` are deliberately not here.
 */
export type PendingAuthorizationRequest = {
  request: string;
  client_id: string;
  client_name: string;
  scope: string | null;
  login_hint: string | null;
  expires_at: string;
  providers: PendingAuthorizationProvider[];
};

/** What both magic-link endpoints answer with, whether or not an email actually went out. */
export type MagicLinkAccepted = {
  message: string;
  expires_in: number;
};

/* ── Tokens ───────────────────────────────────────────────────────────────── */

/** Flat OAuth 2.0 token response — not wrapped in the `{ code, data }` envelope. */
export type TokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  scope: string | null;
  session_id: string;
};

/* ── Account ──────────────────────────────────────────────────────────────── */

export type User = {
  id: string;
  email: string;
  email_verified: boolean;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  locale: string | null;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MeResponse = {
  user: User;
  application_id: string;
  session_id: string;
  /** Roles and permissions held for the application the access token was issued to. */
  roles: string[];
  permissions: string[];
};

export type ProfileUpdate = {
  name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  picture?: string | null;
  locale?: string | null;
};

export type Identity = {
  id: string;
  provider: string;
  email: string | null;
  last_used_at: string | null;
  created_at: string;
};

export type Session = {
  id: string;
  application_id: string;
  provider: string;
  ip: string | null;
  user_agent: string | null;
  /** True for the session the access token in use belongs to. */
  current: boolean;
  revoked_at: string | null;
  last_seen_at: string;
  created_at: string;
};

/* ── Admin ────────────────────────────────────────────────────────────────── */

export type AdminUserSummary = {
  id: string;
  email: string;
  name?: string | null;
  status?: string;
  email_verified?: boolean;
  picture?: string | null;
  last_login_at?: string | null;
  created_at?: string;
};

/** Only `user.id` is guaranteed by the schema, so every other field is treated as optional here. */
export type AdminUserDetail = {
  user: Partial<User> & {id: string};
  roles?: Role[];
  identities?: Identity[];
  sessions?: Session[];
};

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked" | (string & {});

export type Invitation = {
  id: string;
  email: string;
  status: InvitationStatus;
  application_id?: string | null;
  role_id?: string | null;
  expires_at?: string | null;
  accepted_at?: string | null;
  revoked_at?: string | null;
  created_at?: string;
};

export type NewInvitation = {
  email: string;
  application_id?: string | null;
  role_id?: string | null;
  expires_in_days?: number;
  send_email?: boolean;
  login_url?: string;
};

export type Application = {
  client_id: string;
  name: string;
  description?: string | null;
  redirect_uris?: string[];
  confidential?: boolean;
  is_active?: boolean;
  created_at?: string;
};

export type NewApplication = {
  client_id: string;
  name: string;
  description?: string | null;
  redirect_uris: string[];
  confidential?: boolean;
};

/** The generated secret comes back on creation and is never readable again. */
export type CreatedApplication = Application & { client_secret?: string | null };

export type ApplicationUpdate = {
  name?: string;
  description?: string | null;
  redirect_uris?: string[];
  is_active?: boolean;
};

export type Role = {
  id: string;
  slug: string;
  name: string;
  /** Null marks a global role, which applies to every client application. */
  application_id: string | null;
  permissions: string[];
  description?: string | null;
  is_default?: boolean;
};

export type NewRole = {
  slug: string;
  name: string;
  description?: string | null;
  application_id?: string | null;
  is_default?: boolean;
  permissions?: string[];
};

export type Permission = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
};
