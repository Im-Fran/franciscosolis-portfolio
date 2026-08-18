import {createAuthClient} from "@/lib/auth/auth-client.ts";
import {createHttpClient} from "@/lib/auth/client.ts";
import {CMS_AUTH_CONFIG, CMS_BASE_URL} from "@/lib/cms/config.ts";
import type {CmsCollection, CmsEditor, CmsStatus} from "@/lib/cms/types.ts";

/**
 * The CMS's own auth stack. Built once for the whole app: a second instance over the same storage
 * namespace would not hear about this one's sign-ins within the tab.
 */
export const cmsAuth = createAuthClient(CMS_AUTH_CONFIG);

/** The CMS API is a different service than the issuer, called with the CMS session's tokens. */
const http = createHttpClient(CMS_BASE_URL, cmsAuth.session);

export const cmsApi = {
  /** Public: what this CMS is and which collections it manages. */
  status: (signal?: AbortSignal) => http.request<CmsStatus>("/", {auth: false, signal}),

  /** Public: the collections, with the names and descriptions a navigation needs. */
  collections: (signal?: AbortSignal) => http.request<CmsCollection[]>("/collections", {auth: false, signal}),

  /**
   * The "am I still signed in" probe, and the check that this account is allowed in here at all:
   * the API answers 401 without a live session and 403 for an account the CMS does not admit.
   */
  me: (signal?: AbortSignal) => http.request<CmsEditor>("/admin/me", {signal}),
};
