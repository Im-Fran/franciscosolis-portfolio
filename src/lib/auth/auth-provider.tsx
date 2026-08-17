import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import type {ReactNode} from "react";
import {authApi} from "@/lib/auth/api.ts";
import {AuthContext, hasAdminAccess} from "@/lib/auth/auth-context.ts";
import type {AuthStatus} from "@/lib/auth/auth-context.ts";
import {AuthNetworkError} from "@/lib/auth/client.ts";
import {signOut as endSessionEverywhere} from "@/lib/auth/flow.ts";
import {getAccessToken, getTokens, subscribe} from "@/lib/auth/session.ts";
import type {MeResponse} from "@/lib/auth/types.ts";

/**
 * Restores the session on load and keeps it in step with the token store, including rotations and
 * sign-outs performed by another tab.
 */
export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [status, setStatus] = useState<AuthStatus>(() => (getTokens() ? "loading" : "anonymous"));
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setMe(null);
      setStatus("anonymous");
      return;
    }
    try {
      setMe(await authApi.me());
      setError(null);
      setStatus("authenticated");
    } catch (cause) {
      if (cause instanceof AuthNetworkError) {
        /* The tokens may still be good; report the fault instead of signing the user out. */
        setError("network");
        setStatus(getTokens() ? "authenticated" : "anonymous");
        return;
      }
      setMe(null);
      setStatus("anonymous");
    }
  }, []);

  /** Collapses overlapping loads — mount, a token event and a manual reload can arrive together. */
  const reload = useCallback(() => {
    loading.current ??= load().finally(() => {
      loading.current = null;
    });
    return loading.current;
  }, [load]);

  useEffect(() => {
    void reload();
    return subscribe((tokens) => {
      if (!tokens) {
        setMe(null);
        setStatus("anonymous");
        return;
      }
      void reload();
    });
  }, [reload]);

  const signOut = useCallback(async () => {
    await endSessionEverywhere();
    setMe(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({status, me, error, reload, signOut, canAdminister: hasAdminAccess(me)}),
    [status, me, error, reload, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};
