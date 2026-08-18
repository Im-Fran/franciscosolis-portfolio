import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ReactNode} from "react";
import {webAuth} from "@/lib/auth/auth-client.ts";
import type {AuthClient} from "@/lib/auth/auth-client.ts";
import {AuthContext, hasAdminAccess} from "@/lib/auth/auth-context.ts";
import type {AuthStatus} from "@/lib/auth/auth-context.ts";
import {AuthNetworkError} from "@/lib/auth/client.ts";
import type {MeResponse} from "@/lib/auth/types.ts";

/**
 * Restores the session on load and keeps it in step with the token store, including rotations and
 * sign-outs performed by another tab.
 *
 * `client` decides which application the subtree is signed in as; it defaults to the site's own.
 * Nesting a second provider — the CMS does exactly that — gives those routes a separate session
 * without disturbing the one around them.
 */
export const AuthProvider = ({client = webAuth, children}: {client?: AuthClient; children: ReactNode}) => {
  const [status, setStatus] = useState<AuthStatus>(() => (client.session.getTokens() ? "loading" : "anonymous"));
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    const token = await client.session.getAccessToken();
    if (!token) {
      setMe(null);
      setStatus("anonymous");
      return;
    }
    try {
      setMe(await client.api.me());
      setError(null);
      setStatus("authenticated");
    } catch (cause) {
      if (cause instanceof AuthNetworkError) {
        /* The tokens may still be good; report the fault instead of signing the user out. */
        setError("network");
        setStatus(client.session.getTokens() ? "authenticated" : "anonymous");
        return;
      }
      setMe(null);
      setStatus("anonymous");
    }
  }, [client]);

  /** Collapses overlapping loads — mount, a token event and a manual reload can arrive together. */
  const reload = useCallback(() => {
    loading.current ??= load().finally(() => {
      loading.current = null;
    });
    return loading.current;
  }, [load]);

  useEffect(() => {
    void reload();
    return client.session.subscribe((tokens) => {
      if (!tokens) {
        setMe(null);
        setStatus("anonymous");
        return;
      }
      void reload();
    });
  }, [client, reload]);

  const signOut = useCallback(async () => {
    await client.flow.signOut();
    setMe(null);
    setStatus("anonymous");
  }, [client]);

  const value = useMemo(
    () => ({client, status, me, error, reload, signOut, canAdminister: hasAdminAccess(me)}),
    [client, status, me, error, reload, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};
