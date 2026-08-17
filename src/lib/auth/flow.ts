import {AUTH_CLIENT_ID, AUTH_SCOPE, ACCOUNT_ROUTE, authUrl, redirectUri} from "@/lib/auth/config.ts";
import {authApi} from "@/lib/auth/api.ts";
import {AuthApiError, postForm, request} from "@/lib/auth/client.ts";
import {challengeFor, randomToken} from "@/lib/auth/pkce.ts";
import {endSession, startSession} from "@/lib/auth/session.ts";
import {clearTransaction, readTransaction, writeTransaction} from "@/lib/auth/storage.ts";
import type {TokenResponse} from "@/lib/auth/types.ts";

/** The authorization code flow with PKCE, from either provider, end to end. */

const beginTransaction = async (provider: string, returnTo: string) => {
  const codeVerifier = randomToken();
  const transaction = {
    state: randomToken(16),
    code_verifier: codeVerifier,
    provider,
    return_to: returnTo,
    created_at: Date.now(),
  };
  writeTransaction(transaction);
  return {transaction, codeChallenge: await challengeFor(codeVerifier)};
};

/** Sends the magic link. Answers 202 whether or not the address has an account, by design. */
export const startMagicLink = async (email: string, returnTo = ACCOUNT_ROUTE) => {
  const {transaction, codeChallenge} = await beginTransaction("magic_link", returnTo);
  return request<{message: string; expires_in: number}>("/magic-link", {
    auth: false,
    method: "POST",
    json: {
      email,
      client_id: AUTH_CLIENT_ID,
      redirect_uri: redirectUri(),
      state: transaction.state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      scope: AUTH_SCOPE,
    },
  });
};

/** Hands the browser over to Google; the flow resumes at the callback route. */
export const startGoogleSignIn = async (returnTo = ACCOUNT_ROUTE, loginHint?: string) => {
  const {transaction, codeChallenge} = await beginTransaction("google", returnTo);
  const params = new URLSearchParams({
    client_id: AUTH_CLIENT_ID,
    redirect_uri: redirectUri(),
    state: transaction.state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: AUTH_SCOPE,
  });
  if (loginHint) params.set("login_hint", loginHint);
  window.location.assign(authUrl(`/oauth/google/authorize?${params}`));
};

/**
 * In-flight exchanges keyed by code. Authorization codes are single-use, and React's StrictMode
 * runs the callback effect twice in development — without this the second run would spend an
 * already-redeemed code and surface a spurious failure.
 */
const exchanges = new Map<string, Promise<string>>();

const exchange = async (code: string, state: string) => {
  const transaction = readTransaction();
  if (!transaction) throw new AuthApiError(400, "missing-transaction");
  if (transaction.state !== state) throw new AuthApiError(400, "state-mismatch");

  const tokens = await postForm<TokenResponse>("/oauth/token", {
    grant_type: "authorization_code",
    client_id: AUTH_CLIENT_ID,
    code,
    redirect_uri: redirectUri(),
    code_verifier: transaction.code_verifier,
  });

  startSession(tokens);
  clearTransaction();
  return transaction.return_to || ACCOUNT_ROUTE;
};

/** Redeems the authorization code the provider redirected back with. Returns where to go next. */
export const completeAuthorization = (code: string, state: string) => {
  const pending = exchanges.get(code);
  if (pending) return pending;

  const attempt = exchange(code, state).finally(() => {
    /* Kept briefly so StrictMode's paired effect reuses the result instead of replaying the code. */
    setTimeout(() => exchanges.delete(code), 10_000);
  });
  exchanges.set(code, attempt);
  return attempt;
};

/** Ends the session server-side when possible, and locally either way. */
export const signOut = async () => {
  try {
    await authApi.logout();
  } catch {
    /* An already-dead session still has to disappear from this browser. */
  }
  endSession();
  clearTransaction();
};
