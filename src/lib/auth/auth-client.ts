import {WEB_AUTH_CONFIG} from "@/lib/auth/config.ts";
import type {AuthClientConfig} from "@/lib/auth/config.ts";
import {authApi, createAuthApi} from "@/lib/auth/api.ts";
import type {AuthApi} from "@/lib/auth/api.ts";
import {createHttpClient, webHttp} from "@/lib/auth/client.ts";
import type {HttpClient} from "@/lib/auth/client.ts";
import {createAuthFlow, webFlow} from "@/lib/auth/flow.ts";
import type {AuthFlow} from "@/lib/auth/flow.ts";
import {createSessionStore, webSession} from "@/lib/auth/session.ts";
import type {SessionStore} from "@/lib/auth/session.ts";

/**
 * One application's whole auth stack: its session, its view of the auth API and its sign-in flow.
 *
 * `<AuthProvider client={…}>` is what puts one in front of a set of routes, so `useAuth()` inside
 * the CMS resolves to the CMS session while the rest of the site keeps its own.
 */
export type AuthClient = {
  config: AuthClientConfig;
  session: SessionStore;
  http: HttpClient;
  api: AuthApi;
  flow: AuthFlow;
};

/**
 * Builds the stack for an application. Call it once per client id and share the result: a second
 * instance over the same storage namespace would keep its own listeners, and neither copy would
 * hear about the other's sign-outs within the tab.
 */
export const createAuthClient = (config: AuthClientConfig): AuthClient => {
  const session = createSessionStore(config);
  const http = createHttpClient(config.baseUrl, session);
  const api = createAuthApi(http.request);

  return {config, session, http, api, flow: createAuthFlow(config, session, http, api)};
};

/** The site's own client, assembled from the module-level instances the `/auth` screens import. */
export const webAuth: AuthClient = {
  config: WEB_AUTH_CONFIG,
  session: webSession,
  http: webHttp,
  api: authApi,
  flow: webFlow,
};
