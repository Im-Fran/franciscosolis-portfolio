import {createContext, useContext} from "react";
import type {AuthClient} from "@/lib/auth/auth-client.ts";
import type {MeResponse} from "@/lib/auth/types.ts";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export type AuthContextValue = {
  /** The application this subtree signs in as — the site's own client, or the CMS's. */
  client: AuthClient;
  status: AuthStatus;
  /** Profile plus the roles and permissions held for this application; null until signed in. */
  me: MeResponse | null;
  /** Set when the session could be neither restored nor cleanly discarded (usually a network fault). */
  error: string | null;
  /** Re-reads `/me`, e.g. after the profile or a role changed. */
  reload: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Whether to offer the admin console. The API is still the authority on every admin call. */
  canAdminister: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
};

/**
 * Permission slugs are seeded server-side, so the front-end cannot enumerate them ahead of time.
 * This only decides whether the admin console is *offered*: every admin endpoint re-checks the
 * caller and the console renders an explicit no-access state when the API answers 403.
 */
const ADMIN_SLUG = /^admin(?:[.:_-]|$)/i;

export const hasAdminAccess = (me: MeResponse | null) =>
  !!me && (me.permissions.some((slug) => ADMIN_SLUG.test(slug)) || me.roles.some((slug) => ADMIN_SLUG.test(slug)));
