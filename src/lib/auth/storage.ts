import type {TokenResponse} from "@/lib/auth/types.ts";

/**
 * Persistence for the sign-in flow, namespaced per application so the site and the CMS can hold a
 * session each without treading on one another.
 *
 * Both records live in `localStorage` rather than `sessionStorage` on purpose: a magic link is
 * opened from an email client, which lands in a *new* tab that would not inherit a per-tab store,
 * and the PKCE verifier has to survive that hop for the code exchange to succeed.
 *
 * That also means the refresh token is readable by any script running on this origin — the usual
 * trade-off for a browser-only public client with no back-end of its own to hold it.
 */

/** A pending authorization request, kept between starting a sign-in and the callback. */
export type AuthTransaction = {
  state: string;
  code_verifier: string;
  provider: string;
  /** Where to send the user once the exchange succeeds. */
  return_to: string;
  created_at: number;
};

export type StoredTokens = {
  access_token: string;
  refresh_token: string;
  session_id: string;
  scope: string | null;
  /** Epoch ms at which the access token stops being accepted. */
  expires_at: number;
};

/** A transaction older than this is stale — a magic link the user never finished opening. */
const TRANSACTION_TTL_MS = 30 * 60 * 1000;

/** Refresh this long before the real expiry, so a request never travels with a just-dead token. */
const EXPIRY_SKEW_MS = 30 * 1000;

const read = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private modes and full quotas both land here; sign-in still works for this tab. */
  }
};

const remove = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export type AuthStorage = ReturnType<typeof createAuthStorage>;

/** The token and pending-transaction records of one application. */
export const createAuthStorage = (namespace: string) => {
  const tokensKey = `${namespace}.tokens`;
  const transactionKey = `${namespace}.transaction`;

  return {
    /** Exposed so the session store can tell its own `storage` events from another client's. */
    tokensKey,

    readTokens: () => read<StoredTokens>(tokensKey),
    writeTokens: (tokens: StoredTokens) => write(tokensKey, tokens),
    clearTokens: () => remove(tokensKey),

    writeTransaction: (transaction: AuthTransaction) => write(transactionKey, transaction),

    readTransaction: () => {
      const transaction = read<AuthTransaction>(transactionKey);
      if (!transaction) return null;
      if (Date.now() - transaction.created_at > TRANSACTION_TTL_MS) {
        remove(transactionKey);
        return null;
      }
      return transaction;
    },

    clearTransaction: () => remove(transactionKey),
  };
};

export const toStoredTokens = (response: TokenResponse): StoredTokens => ({
  access_token: response.access_token,
  refresh_token: response.refresh_token,
  session_id: response.session_id,
  scope: response.scope,
  expires_at: Date.now() + response.expires_in * 1000,
});

export const isExpired = (tokens: StoredTokens) => Date.now() >= tokens.expires_at - EXPIRY_SKEW_MS;
