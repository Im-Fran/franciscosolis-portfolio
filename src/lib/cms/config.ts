import {AUTH_BASE_URL, AUTH_SCOPE} from "@/lib/auth/config.ts";
import type {AuthClientConfig} from "@/lib/auth/config.ts";

/**
 * Where the CMS API lives and how the CMS interface identifies itself to the auth service.
 *
 * The CMS is a client application of its own: it signs in at the same issuer as the rest of the
 * site but under `franciscosolis-cms`, so the access token it receives carries the roles and
 * permissions granted *for the CMS* — which is exactly what `/cms/admin/*` checks.
 */

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const CMS_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_CMS_BASE_URL ?? "https://api.franciscosolis.cl/cms",
);

export const CMS_CLIENT_ID = import.meta.env.VITE_CMS_CLIENT_ID ?? "franciscosolis-cms";

/** Base path of the CMS interface inside this site. */
export const CMS_ROUTE = "/apps/cms";
export const CMS_SIGN_IN_ROUTE = `${CMS_ROUTE}/sign-in`;
export const CMS_CALLBACK_ROUTE = `${CMS_ROUTE}/callback`;

/**
 * A separate storage namespace is what keeps the two sessions apart: signing out of the CMS must
 * not touch the session the site itself holds, and vice versa.
 */
export const CMS_AUTH_CONFIG: AuthClientConfig = {
  storageNamespace: "fs.cms",
  clientId: CMS_CLIENT_ID,
  baseUrl: AUTH_BASE_URL,
  scope: AUTH_SCOPE,
  signInRoute: CMS_SIGN_IN_ROUTE,
  callbackRoute: CMS_CALLBACK_ROUTE,
  defaultReturnTo: CMS_ROUTE,
  returnToPrefix: CMS_ROUTE,
};
