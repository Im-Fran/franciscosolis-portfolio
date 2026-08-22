import {WEB_AUTH_CONFIG} from "@/lib/auth/config.ts";
import type {AuthClientConfig} from "@/lib/auth/config.ts";
import {createAuthStorage, isExpired, toStoredTokens} from "@/lib/auth/storage.ts";
import type {StoredTokens} from "@/lib/auth/storage.ts";
import type {ApiEnvelope, TokenResponse} from "@/lib/auth/types.ts";

/**
 * Owns the token lifecycle of one application outside React, so refreshing survives re-renders,
 * StrictMode's double effects and several components asking for a token at once.
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

export type SessionStore = ReturnType<typeof createSessionStore>;

export const createSessionStore = (config: AuthClientConfig) => {
  const storage = createAuthStorage(config.storageNamespace);
  const listeners = new Set<Listener>();
  let refreshing: Promise<RefreshOutcome> | null = null;

  const notify = (tokens: StoredTokens | null) => {
    for (const listener of listeners) listener(tokens);
  };

  /** Another tab signed in, signed out or rotated its tokens: adopt whatever it left behind. */
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== storage.tokensKey) return;
    notify(storage.readTokens());
  };

  const subscribe = (listener: Listener) => {
    if (listeners.size === 0) window.addEventListener("storage", onStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  };

  /** Stores the answer to a token request. `null` when the body was not a usable token answer. */
  const startSession = (response: TokenResponse | ApiEnvelope<TokenResponse>) => {
    const tokens = toStoredTokens(response, storage.readTokens());
    if (!tokens) return null;

    storage.writeTokens(tokens);
    notify(tokens);
    return tokens;
  };

  const endSession = () => {
    storage.clearTokens();
    notify(null);
  };

  const performRefresh = async (): Promise<RefreshOutcome> => {
    const current = storage.readTokens();
    if (!current?.refresh_token) {
      /*
       * There is nothing left to refresh with, so the record is spent whatever else it holds.
       * Clearing it is what ends the session everywhere at once: left in place, the guards kept
       * reading it as "signed in" while every request went out with no token behind it.
       */
      if (current) endSession();
      return {status: "revoked"};
    }

    let response: Response;
    try {
      response = await fetch(`${config.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: config.clientId,
          refresh_token: current.refresh_token,
        }),
      });
    } catch {
      /* Offline or the service is unreachable — keep the tokens and let the caller retry later. */
      return {status: "unavailable"};
    }

    if (!response.ok) {
      /*
       * A refused refresh token does not on its own mean the chain is gone. Refresh tokens are
       * single-use, so when another tab rotated this one while the request above was in flight,
       * the service is refusing a token that is merely *spent* — and the pair that tab wrote is
       * live. Only when the stored token is still the one just refused is the session really
       * over; wiping unconditionally signed both tabs out of a perfectly good session.
       */
      const latest = storage.readTokens();
      if (latest?.refresh_token && latest.refresh_token !== current.refresh_token) {
        notify(latest);
        return {status: "refreshed", tokens: latest};
      }

      /* The chain is gone (rotated away, revoked or expired); there is nothing left to recover. */
      endSession();
      return {status: "revoked"};
    }

    const rotated = startSession((await response.json()) as TokenResponse);

    /*
     * A 200 that is not a token answer — a proxy that rewrote the body, a shape this client does
     * not know — says nothing about the chain, so the stored pair stands and the caller retries.
     * What must not happen is storing it: that is what produced a "session" with no token in it.
     */
    return rotated ? {status: "refreshed", tokens: rotated} : {status: "unavailable"};
  };

  /** Exchanges the stored refresh token for a fresh pair. Concurrent callers share one request. */
  const refreshSession = () => {
    refreshing ??= performRefresh().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  /**
   * A token to send with the next request: the stored one while it is still good, a freshly rotated
   * one when it is not. Falls back to the spent token when the service is unreachable, so the
   * caller gets a network failure to act on rather than a silent sign-out.
   */
  const getAccessToken = async () => {
    const tokens = storage.readTokens();
    if (!tokens) {
      /*
       * Nothing usable is left: no record, or one the store just discarded as unreadable. That
       * discard happens without a `storage` event of its own, so it is announced here — otherwise a
       * screen that was rendered while the session still looked live keeps that view for good.
       */
      notify(null);
      return null;
    }
    if (!isExpired(tokens)) return tokens.access_token;

    const outcome = await refreshSession();
    if (outcome.status === "refreshed") return outcome.tokens.access_token;
    return outcome.status === "unavailable" ? tokens.access_token : null;
  };

  return {
    storage,
    subscribe,
    getTokens: () => storage.readTokens(),
    startSession,
    endSession,
    refreshSession,
    getAccessToken,
  };
};

/** The site's own session. Other applications build theirs through `createAuthClient`. */
export const webSession = createSessionStore(WEB_AUTH_CONFIG);

export const {subscribe, getTokens, startSession, endSession, refreshSession, getAccessToken} = webSession;
