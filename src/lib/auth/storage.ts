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

/**
 * How many pending sign-ins to keep at once.
 *
 * One slot is not enough: a single slot means "send me another link" — or a second tab — silently
 * overwrites the verifier the first link needs, and opening that first link then fails as a
 * `state-mismatch`, which reads to the user as tampering rather than as the ordinary thing they
 * just did. Each entry is a few hundred bytes and expires on its own, so remembering the recent
 * few costs nothing and makes every link the user was actually sent redeemable.
 */
const MAX_TRANSACTIONS = 5;

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

const has = (key: string) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
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

  /**
   * Reads the record, expiring stale entries on the way out. A record written before this key
   * held a list is a bare object, so it is normalized rather than discarded — an upgrade must not
   * strand a magic link that is already in someone's inbox.
   */
  const readTransactions = (): AuthTransaction[] => {
    const stored = read<AuthTransaction | AuthTransaction[]>(transactionKey);
    if (!stored) return [];

    const now = Date.now();
    const live = (Array.isArray(stored) ? stored : [stored]).filter(
      (transaction) => transaction?.state && now - transaction.created_at <= TRANSACTION_TTL_MS,
    );

    if (live.length === 0) remove(transactionKey);
    return live;
  };

  return {
    /** Exposed so the session store can tell its own `storage` events from another client's. */
    tokensKey,

    readTokens: () => {
      const tokens = read<StoredTokens>(tokensKey);
      if (tokens && typeof tokens.access_token === "string" && tokens.access_token) return tokens;

      /*
       * Present but unusable — `{}`, `null`, unparseable, a half-written record. An object without
       * a token is the harmful shape: it reads as "there is a session" to every guard while failing
       * at the point of use, so each visit to a protected route flashes a loader and bounces back
       * to sign-in, for good. Clearing whatever is there puts the browser back in a clean anonymous
       * state instead.
       */
      if (has(tokensKey)) remove(tokensKey);
      return null;
    },
    writeTokens: (tokens: StoredTokens) => write(tokensKey, tokens),
    clearTokens: () => remove(tokensKey),

    /** The live transactions, newest first, with the expired ones already dropped. */
    readTransactions: () => readTransactions(),

    writeTransaction: (transaction: AuthTransaction) => {
      const kept = readTransactions().filter((pending) => pending.state !== transaction.state);
      write(transactionKey, [transaction, ...kept].slice(0, MAX_TRANSACTIONS));
    },

    /** The transaction a callback's `state` belongs to, or the newest one when asked for none. */
    readTransaction: (state?: string) => {
      const pending = readTransactions();
      if (state === undefined) return pending[0] ?? null;
      return pending.find((transaction) => transaction.state === state) ?? null;
    },

    /** Forgets one transaction, or every one of them when asked for none. */
    clearTransaction: (state?: string) => {
      if (state === undefined) return remove(transactionKey);
      const kept = readTransactions().filter((transaction) => transaction.state !== state);
      if (kept.length === 0) return remove(transactionKey);
      write(transactionKey, kept);
    },
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
