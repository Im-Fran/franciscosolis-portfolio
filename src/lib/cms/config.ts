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
export const CMS_ROUTE = "/cms";
export const CMS_SIGN_IN_ROUTE = `${CMS_ROUTE}/sign-in`;
export const CMS_CALLBACK_ROUTE = `${CMS_ROUTE}/callback`;

/**
 * Where the interface's own sections live. Kept here rather than spelled out at each call site so
 * a link and the route it points at cannot drift apart.
 */
export const cmsRoute = {
  overview: CMS_ROUTE,
  content: (collection: string) => `${CMS_ROUTE}/content/${collection}`,
  contentNew: (collection: string) => `${CMS_ROUTE}/content/${collection}/new`,
  contentItem: (collection: string, id: string) => `${CMS_ROUTE}/content/${collection}/${id}`,
  legal: `${CMS_ROUTE}/legal`,
  legalNew: `${CMS_ROUTE}/legal/new`,
  legalItem: (id: string) => `${CMS_ROUTE}/legal/${id}`,
  templates: `${CMS_ROUTE}/email/templates`,
  templateNew: `${CMS_ROUTE}/email/templates/new`,
  templateItem: (id: string) => `${CMS_ROUTE}/email/templates/${id}`,
  emails: `${CMS_ROUTE}/email/messages`,
  emailNew: `${CMS_ROUTE}/email/messages/new`,
  emailItem: (id: string) => `${CMS_ROUTE}/email/messages/${id}`,
  audit: `${CMS_ROUTE}/audit`,
} as const;

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
