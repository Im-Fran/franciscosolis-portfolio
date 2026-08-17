/**
 * Where the auth service lives and how this front-end identifies itself to it.
 *
 * Both values are build-time env vars so a preview deployment can point at another issuer or
 * register under its own client id without a code change. See `.env.example`.
 */

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const AUTH_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_AUTH_BASE_URL ?? "https://api.franciscosolis.cl/auth",
);

/**
 * This SPA is a *public* OAuth client: it holds no secret and authenticates with PKCE alone. The
 * application must be registered on the auth service with the callback below as a redirect URI.
 */
export const AUTH_CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID ?? "franciscosolis-web";

export const AUTH_SCOPE = "openid profile email";

/** Base path of the auth interface inside this site. */
export const AUTH_ROUTE = "/auth";
export const CALLBACK_ROUTE = `${AUTH_ROUTE}/callback`;
export const ACCOUNT_ROUTE = `${AUTH_ROUTE}/account`;
export const ADMIN_ROUTE = `${AUTH_ROUTE}/admin`;

export const authUrl = (path: string) => `${AUTH_BASE_URL}${path}`;

/** Absolute redirect URI handed to the authorization server; must match the registered one. */
export const redirectUri = () => new URL(CALLBACK_ROUTE, window.location.origin).toString();

/** Absolute sign-in URL, used as the `login_url` of an emailed invitation. */
export const loginUrl = () => new URL(AUTH_ROUTE, window.location.origin).toString();

/**
 * Keeps `?return_to=` to paths inside this site. A protocol-relative or absolute value would turn
 * the sign-in screen into an open redirect, so anything but a single-slash path is discarded.
 */
export const sanitizeReturnTo = (value: string | null | undefined) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : ACCOUNT_ROUTE;
