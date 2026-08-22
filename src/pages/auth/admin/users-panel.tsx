import {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {ArrowClockwise, CaretLeft, CaretRight, MagnifyingGlass} from "@phosphor-icons/react";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {Button} from "@/components/ui/button/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {authApi} from "@/lib/auth/api.ts";
import {formatDate} from "@/lib/auth/format.ts";
import {useResource} from "@/lib/auth/useResource.ts";
import {Avatar} from "@/components/ui/avatar.tsx";
import {Panel, PanelState} from "@/pages/auth/components/panel.tsx";
import {UserDetail} from "@/pages/auth/admin/user-detail.tsx";

const PAGE_SIZE = 25;

/** Browsing and searching accounts; everything editable lives in the detail dialog. */
export const UsersPanel = () => {
  const {t, i18n} = useTranslation();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  /* Debounced so typing a name does not fire a request per keystroke. */
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const users = useResource(
    useCallback(
      (signal: AbortSignal) =>
        authApi.admin.users({query: query || undefined, limit: PAGE_SIZE, offset: page * PAGE_SIZE}, signal),
      [query, page],
    ),
  );

  /* The endpoint returns a page, not a total, so a full page is taken as "there may be more". */
  const hasMore = (users.data?.length ?? 0) === PAGE_SIZE;

  /* Roles power the grant control inside the dialog; a 403 here just leaves that control empty. */
  const roles = useResource(useCallback((signal: AbortSignal) => authApi.admin.roles(signal), []));

  return (
    <Panel
      title={t("auth:admin.users.title")}
      description={t("auth:admin.users.description")}
      action={
        <Button variant="ghost" size="sm" onClick={users.reload} data-fs-hover>
          <ArrowClockwise size={14}/> {t("auth:common.refresh")}
        </Button>
      }
    >
      <div className="relative mb-5">
        <MagnifyingGlass size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-600"/>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("auth:admin.users.search_placeholder")}
          aria-label={t("auth:admin.users.search_placeholder")}
          className="pl-9"
          type="search"
        />
      </div>

      <PanelState
        loading={users.loading}
        error={users.error}
        forbidden={users.status === 403}
        empty={users.data?.length === 0}
        emptyLabel={query ? t("auth:admin.users.no_matches") : t("auth:admin.users.empty")}
        onRetry={users.reload}
      >
        <ul className="flex flex-col divide-y divide-neutral-800">
          {users.data?.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => setSelected(user.id)}
                className="flex w-full cursor-pointer flex-wrap items-center gap-4 rounded-[var(--radius-md)] px-2 py-3 text-left transition-colors hover:bg-neutral-800/40"
                data-fs-hover
              >
                <Avatar name={user.name} email={user.email} picture={user.picture} size={36}/>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text">{user.name || user.email}</p>
                  {/* An account with no name is already identified by the line above. */}
                  {user.name && <p className="truncate text-[13px] text-neutral-500">{user.email}</p>}
                </div>
                {user.status && user.status !== "active" && (
                  <Badge variant="outline" size="sm">
                    {t(`auth:status.${user.status}`, {defaultValue: user.status})}
                  </Badge>
                )}
                {user.created_at && (
                  <span className="text-xs text-neutral-600">{formatDate(user.created_at, i18n.language)}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {(page > 0 || hasMore) && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-800 pt-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              data-fs-hover
            >
              <CaretLeft size={14}/> {t("auth:common.previous")}
            </Button>
            <span className="text-xs text-neutral-600">{t("auth:common.page", {page: page + 1})}</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={!hasMore}
              onClick={() => setPage((current) => current + 1)}
              data-fs-hover
            >
              {t("auth:common.next")} <CaretRight size={14}/>
            </Button>
          </div>
        )}
      </PanelState>

      {selected && (
        <UserDetail
          userId={selected}
          roles={roles.data ?? []}
          onClose={() => setSelected(null)}
          onChanged={users.reload}
        />
      )}
    </Panel>
  );
};
