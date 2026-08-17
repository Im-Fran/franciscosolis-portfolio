import {AUTH_BASE_URL} from "@/lib/auth/config.ts";
import {webSession} from "@/lib/auth/session.ts";
import type {SessionStore} from "@/lib/auth/session.ts";
import type {ApiEnvelope, ApiErrorBody} from "@/lib/auth/types.ts";

/** An error answer from the API, carrying the status so callers can branch on 403 vs 404. */
export class AuthApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

/** The network never reached the service — worth telling apart from a rejection by the service. */
export class AuthNetworkError extends Error {
  constructor(message = "network-error") {
    super(message);
    this.name = "AuthNetworkError";
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  /** JSON request body. */
  json?: unknown;
  /** Send an access token. Off for the handful of public endpoints. */
  auth?: boolean;
  signal?: AbortSignal;
};

export type RequestFn = <T>(path: string, options?: RequestOptions) => Promise<T>;

const parseError = async (response: Response) => {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (typeof body?.error === "string") return body.error;
  } catch {
    /* Empty or non-JSON error bodies fall back to the status text. */
  }
  return response.statusText || `HTTP ${response.status}`;
};

export type HttpClient = ReturnType<typeof createHttpClient>;

/**
 * A fetch wrapper for one service, authenticated with one application's session.
 *
 * `baseUrl` and `session` are separate on purpose: the CMS API lives under a different base than
 * the auth service, yet both are called with the tokens the CMS signed in with.
 */
export const createHttpClient = (baseUrl: string, session: SessionStore) => {
  const send = async (path: string, options: RequestOptions, token: string | null) => {
    const headers: Record<string, string> = {};
    if (options.json !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      return await fetch(`${baseUrl}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.json === undefined ? undefined : JSON.stringify(options.json),
        signal: options.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new AuthNetworkError();
    }
  };

  /**
   * Calls the API and unwraps its `{ code, data }` envelope.
   *
   * A 401 on an authenticated call is retried once behind a token refresh: the service re-checks
   * the session on every request, so a token can stop being accepted before its own expiry.
   */
  const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
    const authenticated = options.auth !== false;
    let response = await send(path, options, authenticated ? await session.getAccessToken() : null);

    if (response.status === 401 && authenticated) {
      const outcome = await session.refreshSession();

      /* A refresh that never reached the service says nothing about the session; keep it and report. */
      if (outcome.status === "unavailable") throw new AuthNetworkError();
      if (outcome.status === "revoked") throw new AuthApiError(401, await parseError(response));

      response = await send(path, options, outcome.tokens.access_token);
      if (response.status === 401) {
        session.endSession();
        throw new AuthApiError(401, await parseError(response));
      }
    }

    if (!response.ok) throw new AuthApiError(response.status, await parseError(response));

    /* 204s and the bodiless 201s both arrive empty, so read as text before committing to JSON. */
    const text = response.status === 204 ? "" : await response.text();
    if (!text) return undefined as T;

    const body = JSON.parse(text) as ApiEnvelope<T> | T;
    return body && typeof body === "object" && "code" in body && "data" in body
      ? (body as ApiEnvelope<T>).data
      : (body as T);
  };

  /** Posts the `application/x-www-form-urlencoded` body the OAuth endpoints expect. */
  const postForm = async <T>(path: string, fields: Record<string, string>): Promise<T> => {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams(fields),
      });
    } catch {
      throw new AuthNetworkError();
    }
    if (!response.ok) throw new AuthApiError(response.status, await parseError(response));
    return (await response.json()) as T;
  };

  return {request, postForm};
};

/** The site's own client, talking to the auth service with the site's session. */
export const webHttp = createHttpClient(AUTH_BASE_URL, webSession);

export const request: RequestFn = webHttp.request;
export const postForm = webHttp.postForm;
