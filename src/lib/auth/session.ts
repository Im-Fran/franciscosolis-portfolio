import {AUTH_CLIENT_ID, authUrl} from "@/lib/auth/config.ts";
import {clearTokens, isExpired, readTokens, TOKENS_KEY, toStoredTokens, writeTokens} from "@/lib/auth/storage.ts";
import type {StoredTokens} from "@/lib/auth/storage.ts";
import type {TokenResponse} from "@/lib/auth/types.ts";

/**
 * Owns the token lifecycle outside React, so refreshing survives re-renders, StrictMode's double
 * effects and several components asking for a token at once.
 *
 * Refresh tokens rotate and are single-use: replaying one is treated as theft and revokes the whole
 * chain. Everything here therefore funnels through a single in-flight promise, and tokens are read
 * back from storage on every use so a rotation performed by another tab is picked up rather than
 * overwritten.
 */

type Listener = (tokens: StoredTokens | null) => void;

/**
 * Why a refresh ended the way it did. `unavailable` keeps the stored tokens — the service could not
 * be reached, which says nothing about whether they are still good — while `revoked` means the
 * chain is genuinely gone and the local session has already been cleared.
 */
export type RefreshOutcome =
  | {status: "refreshed"; tokens: StoredTokens}
  | {status: "unavailable"}
  | {status: "revoked"};

const listeners = new Set<Listener>();
let refreshing: Promise<RefreshOutcome> | null = null;

const notify = (tokens: StoredTokens | null) => {
  for (const listener of listeners) listener(tokens);
};

/** Another tab signed in, signed out or rotated its tokens: adopt whatever it left behind. */
const onStorage = (event: StorageEvent) => {
  if (event.key !== null && event.key !== TOKENS_KEY) return;
  notify(readTokens());
};

export const subscribe = (listener: Listener) => {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
};

export const getTokens = () => readTokens();

export const startSession = (response: TokenResponse) => {
  const tokens = toStoredTokens(response);
  writeTokens(tokens);
  notify(tokens);
  return tokens;
};

export const endSession = () => {
  clearTokens();
  notify(null);
};

/** Exchanges the stored refresh token for a fresh pair. Concurrent callers share one request. */
export const refreshSession = () => {
  refreshing ??= performRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

const performRefresh = async (): Promise<RefreshOutcome> => {
  const current = readTokens();
  if (!current?.refresh_token) return {status: "revoked"};

  let response: Response;
  try {
    response = await fetch(authUrl("/oauth/token"), {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: AUTH_CLIENT_ID,
        refresh_token: current.refresh_token,
      }),
    });
  } catch {
    /* Offline or the service is unreachable — keep the tokens and let the caller retry later. */
    return {status: "unavailable"};
  }

  if (!response.ok) {
    /* The chain is gone (rotated away, revoked or expired); there is nothing left to recover. */
    endSession();
    return {status: "revoked"};
  }

  return {status: "refreshed", tokens: startSession((await response.json()) as TokenResponse)};
};

/**
 * A token to send with the next request: the stored one while it is still good, a freshly rotated
 * one when it is not. Falls back to the spent token when the service is unreachable, so the caller
 * gets a network failure to act on rather than a silent sign-out.
 */
export const getAccessToken = async () => {
  const tokens = readTokens();
  if (!tokens) return null;
  if (!isExpired(tokens)) return tokens.access_token;

  const outcome = await refreshSession();
  if (outcome.status === "refreshed") return outcome.tokens.access_token;
  return outcome.status === "unavailable" ? tokens.access_token : null;
};
