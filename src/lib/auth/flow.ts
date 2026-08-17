import {WEB_AUTH_CONFIG, redirectUri} from "@/lib/auth/config.ts";
import type {AuthClientConfig} from "@/lib/auth/config.ts";
import {authApi} from "@/lib/auth/api.ts";
import type {AuthApi} from "@/lib/auth/api.ts";
import {AuthApiError, webHttp} from "@/lib/auth/client.ts";
import type {HttpClient} from "@/lib/auth/client.ts";
import {challengeFor, randomToken} from "@/lib/auth/pkce.ts";
import {webSession} from "@/lib/auth/session.ts";
import type {SessionStore} from "@/lib/auth/session.ts";
import type {TokenResponse} from "@/lib/auth/types.ts";

/** The authorization code flow with PKCE, from either provider, end to end. */

export type AuthFlow = ReturnType<typeof createAuthFlow>;

export const createAuthFlow = (
  config: AuthClientConfig,
  session: SessionStore,
  http: HttpClient,
  api: AuthApi,
) => {
  const {storage} = session;

  const beginTransaction = async (provider: string, returnTo: string) => {
    const codeVerifier = randomToken();
    const transaction = {
      state: randomToken(16),
      code_verifier: codeVerifier,
      provider,
      return_to: returnTo,
      created_at: Date.now(),
    };
    storage.writeTransaction(transaction);
    return {transaction, codeChallenge: await challengeFor(codeVerifier)};
  };

  /** Sends the magic link. Answers 202 whether or not the address has an account, by design. */
  const startMagicLink = async (email: string, returnTo = config.defaultReturnTo) => {
    const {transaction, codeChallenge} = await beginTransaction("magic_link", returnTo);
    return http.request<{message: string; expires_in: number}>("/magic-link", {
      auth: false,
      method: "POST",
      json: {
        email,
        client_id: config.clientId,
        redirect_uri: redirectUri(config),
        state: transaction.state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        scope: config.scope,
      },
    });
  };

  /** Hands the browser over to Google; the flow resumes at the callback route. */
  const startGoogleSignIn = async (returnTo = config.defaultReturnTo, loginHint?: string) => {
    const {transaction, codeChallenge} = await beginTransaction("google", returnTo);
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri(config),
      state: transaction.state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      scope: config.scope,
    });
    if (loginHint) params.set("login_hint", loginHint);
    window.location.assign(`${config.baseUrl}/oauth/google/authorize?${params}`);
  };

  /**
   * In-flight exchanges keyed by code. Authorization codes are single-use, and React's StrictMode
   * runs the callback effect twice in development — without this the second run would spend an
   * already-redeemed code and surface a spurious failure.
   */
  const exchanges = new Map<string, Promise<string>>();

  const exchange = async (code: string, state: string) => {
    const transaction = storage.readTransaction();
    if (!transaction) throw new AuthApiError(400, "missing-transaction");
    if (transaction.state !== state) throw new AuthApiError(400, "state-mismatch");

    const tokens = await http.postForm<TokenResponse>("/oauth/token", {
      grant_type: "authorization_code",
      client_id: config.clientId,
      code,
      redirect_uri: redirectUri(config),
      code_verifier: transaction.code_verifier,
    });

    session.startSession(tokens);
    storage.clearTransaction();
    return transaction.return_to || config.defaultReturnTo;
  };

  /** Redeems the authorization code the provider redirected back with. Returns where to go next. */
  const completeAuthorization = (code: string, state: string) => {
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
  const signOut = async () => {
    try {
      await api.logout();
    } catch {
      /* An already-dead session still has to disappear from this browser. */
    }
    session.endSession();
    storage.clearTransaction();
  };

  return {startMagicLink, startGoogleSignIn, completeAuthorization, signOut};
};

/** The site's own flow. */
export const webFlow = createAuthFlow(WEB_AUTH_CONFIG, webSession, webHttp, authApi);

export const {startMagicLink, startGoogleSignIn, completeAuthorization, signOut} = webFlow;
