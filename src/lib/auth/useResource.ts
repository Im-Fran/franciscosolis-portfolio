import {useCallback, useEffect, useState} from "react";
import {AuthApiError, AuthNetworkError} from "@/lib/auth/client.ts";

export type Resource<T> = {
  data: T | null;
  loading: boolean;
  /** Human-readable failure from the API, or `network` when the service was unreachable. */
  error: string | null;
  /** HTTP status of the failure, so views can tell 403 apart from a genuine error. */
  status: number | null;
  reload: () => void;
};

export const describeError = (cause: unknown) => {
  if (cause instanceof AuthNetworkError) return {message: "network", status: null};
  if (cause instanceof AuthApiError) return {message: cause.message, status: cause.status};
  return {message: cause instanceof Error ? cause.message : String(cause), status: null};
};

/**
 * Loads one API resource, cancelling the in-flight request when the inputs change or the view
 * unmounts. `fetcher` must be stable — wrap it in `useCallback` at the call site.
 */
export const useResource = <T>(fetcher: (signal: AbortSignal) => Promise<T>): Resource<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetcher(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setError(null);
        setStatus(null);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        const described = describeError(cause);
        setError(described.message);
        setStatus(described.status);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [fetcher, nonce]);

  return {data, loading, error, status, reload};
};
