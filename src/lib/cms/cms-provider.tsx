import {useCallback, useEffect, useMemo, useState} from "react";
import type {ReactNode} from "react";
import {describeError} from "@/lib/auth/useResource.ts";
import {cmsApi} from "@/lib/cms/client.ts";
import {CmsContext} from "@/lib/cms/cms-context.ts";
import type {CmsCollection, CmsEditor} from "@/lib/cms/types.ts";

/**
 * Loads the two things every CMS screen needs — who is signed in *here*, and which collections the
 * service manages — once, above the whole signed-in subtree.
 *
 * Doing it in one place is what lets the layout answer the "is this account admitted at all"
 * question a single time: `/admin/me` replies 403 for an account with no role in the CMS, and the
 * shell renders the no-access screen instead of every panel failing on its own.
 */
export const CmsProvider = ({children}: {children: ReactNode}) => {
  const [editor, setEditor] = useState<CmsEditor | null>(null);
  const [collections, setCollections] = useState<CmsCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    /* The collections are public, so a 403 on `/admin/me` still leaves the shell something to show. */
    Promise.allSettled([cmsApi.me(controller.signal), cmsApi.collections(controller.signal)])
      .then(([me, list]) => {
        if (controller.signal.aborted) return;

        if (me.status === "fulfilled") {
          setEditor(me.value);
          setError(null);
          setForbidden(false);
        } else {
          const described = describeError(me.reason);
          setEditor(null);
          setForbidden(described.status === 403);
          setError(described.status === 403 ? null : described.message);
        }

        if (list.status === "fulfilled") setCollections(list.value);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [nonce]);

  const value = useMemo(
    () => ({editor, collections, loading, error, forbidden, reload}),
    [editor, collections, loading, error, forbidden, reload],
  );

  return <CmsContext value={value}>{children}</CmsContext>;
};
