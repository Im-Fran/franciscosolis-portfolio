/**
 * Where the auth service lives and how a front-end identifies itself to it.
 *
 * Every application hosted on this origin is its own OAuth client: the site itself signs in under
 * `franciscosolis-web` at `/auth`, the CMS under `franciscosolis-cms` at `/apps/cms`. They talk to
 * the same issuer but get tokens minted for different applications — with different roles — so each
 * one keeps its own session. An `AuthClientConfig` describes one of them; `createAuthClient` in
 * `auth-client.ts` turns it into a working client.
 *
 * The issuer and the site's own client id are build-time env vars so a preview deployment can point
 * at another issuer or register under its own client id without a code change. See `.env.example`.
 */

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const AUTH_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_AUTH_BASE_URL ?? "https://api.franciscosolis.cl/auth",
);

export const AUTH_SCOPE = "openid profile email";

export type AuthClientConfig = {
  /**
   * Namespaces this client's entries in `localStorage`. Two applications must never share one, or
   * signing out of the CMS would take the site's session with it.
   */
  storageNamespace: string;
  /** Client id the application is registered under on the auth service. */
  clientId: string;
  /** Base URL of the auth service, without a trailing slash. */
  baseUrl: string;
  scope: string;
  /** Where the guard sends anonymous visitors. */
  signInRoute: string;
  /** Route that redeems the authorization code; also the registered redirect URI. */
  callbackRoute: string;
  /** Where a sign-in lands when it did not start from a particular page. */
  defaultReturnTo: string;
  /**
   * When set, a `return_to` is only honoured inside this path. The CMS uses it so a link into its
   * sign-in screen cannot bounce the editor into an unrelated part of the site.
   */
  returnToPrefix?: string;
};

/** Base path of the auth interface inside this site. */
export const AUTH_ROUTE = "/auth";
export const CALLBACK_ROUTE = `${AUTH_ROUTE}/callback`;
export const ACCOUNT_ROUTE = `${AUTH_ROUTE}/account`;
export const ADMIN_ROUTE = `${AUTH_ROUTE}/admin`;

/**
 * This SPA is a *public* OAuth client: it holds no secret and authenticates with PKCE alone. The
 * application must be registered on the auth service with the callback below as a redirect URI.
 */
export const AUTH_CLIENT_ID = import.meta.env.VITE_AUTH_CLIENT_ID ?? "franciscosolis-web";

/** The site's own client — the one `/auth` signs in with. */
export const WEB_AUTH_CONFIG: AuthClientConfig = {
  storageNamespace: "fs.auth",
  clientId: AUTH_CLIENT_ID,
  baseUrl: AUTH_BASE_URL,
  scope: AUTH_SCOPE,
  signInRoute: AUTH_ROUTE,
  callbackRoute: CALLBACK_ROUTE,
  defaultReturnTo: ACCOUNT_ROUTE,
};

export const authUrl = (path: string) => `${AUTH_BASE_URL}${path}`;

/** Absolute redirect URI handed to the authorization server; must match the registered one. */
export const redirectUri = (config: AuthClientConfig = WEB_AUTH_CONFIG) =>
  new URL(config.callbackRoute, window.location.origin).toString();

/** Absolute sign-in URL, used as the `login_url` of an emailed invitation. */
export const loginUrl = () => new URL(AUTH_ROUTE, window.location.origin).toString();

/**
 * Keeps `?return_to=` to paths inside this site — and, when the client asks for it, inside its own
 * section. A protocol-relative or absolute value would turn the sign-in screen into an open
 * redirect, so anything but a single-slash path is discarded.
 */
export const sanitizeReturnTo = (
  value: string | null | undefined,
  config: AuthClientConfig = WEB_AUTH_CONFIG,
) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return config.defaultReturnTo;

  if (config.returnToPrefix) {
    /* Compare on segment boundaries, so `/apps/cms-something` is not read as being inside the CMS. */
    const rest = value.startsWith(config.returnToPrefix) ? value.slice(config.returnToPrefix.length) : null;
    if (rest === null || (rest !== "" && !rest.startsWith("/") && !rest.startsWith("?"))) {
      return config.defaultReturnTo;
    }
  }

  return value;
};
