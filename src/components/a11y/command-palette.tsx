import {useEffect, useId, useMemo, useRef, useState, type KeyboardEvent} from "react";
import {useTranslation} from "react-i18next";
import {ArrowElbowDownLeft, Check, MagnifyingGlass} from "@phosphor-icons/react";
import {cn} from "@/lib/utils.ts";
import {filterCommands, useA11yCommands} from "@/components/a11y/useA11yCommands.ts";

export type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onOpenPanel: () => void;
};

/**
 * VS Code's command palette, scoped to the accessibility preferences: every entry is namespaced
 * "Accessibility: …", the list narrows as you type, and the whole thing is driven from the
 * keyboard. It shares its command list with the panel (see useA11yCommands), so the two entry
 * points always offer exactly the same controls.
 */
export const CommandPalette = ({open, onClose, onOpenPanel}: CommandPaletteProps) => {
  const {t} = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const commands = useA11yCommands(onOpenPanel);
  const results = useMemo(() => filterCommands(commands, query), [commands, query]);
  const namespace = t("a11y:namespace");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  /* A fresh query starts from the top, and never points past the end of a shrinking list. */
  useEffect(() => setHighlighted(0), [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlighted(0);
    }
  }, [open]);

  /* Keeps the highlighted row visible while arrowing through a list taller than the box. */
  useEffect(() => {
    listRef.current?.children[highlighted]?.scrollIntoView({block: "nearest"});
  }, [highlighted]);

  const run = (index: number) => {
    const command = results[index];
    if (!command) return;
    command.run();
    onClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)) {
      event.preventDefault();
      setHighlighted((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey)) {
      event.preventDefault();
      setHighlighted((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setHighlighted(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setHighlighted(results.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(highlighted);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-label={`${namespace}: ${t("a11y:palette.title")}`}
      className={cn(
        "mx-auto mt-[12vh] mb-auto w-[min(38rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border-0 p-0",
        "bg-surface text-text shadow-[var(--shadow-lg)] backdrop:bg-black/70 backdrop:backdrop-blur-sm",
      )}
    >
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4">
        <MagnifyingGlass size={18} className="shrink-0 text-neutral-500"/>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results[highlighted] ? `${listId}-${results[highlighted].id}` : undefined}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("a11y:palette.placeholder")}
          className="h-14 w-full bg-transparent text-sm text-text outline-none placeholder:text-neutral-600"
        />
      </div>

      <ul ref={listRef} id={listId} role="listbox" aria-label={t("a11y:palette.title")} className="max-h-[46vh] overflow-y-auto p-2">
        {results.map((command, index) => (
          <li
            key={command.id}
            id={`${listId}-${command.id}`}
            role="option"
            aria-selected={index === highlighted}
            /* The pointer only moves the highlight; the click below is what runs the command. */
            onMouseMove={() => setHighlighted(index)}
            onClick={() => run(index)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm",
              index === highlighted ? "bg-accent-900/50 text-text" : "text-neutral-300",
            )}
          >
            <command.icon size={16} className="shrink-0 text-accent-300"/>
            <span className="min-w-0 flex-1 truncate">
              <span className="text-neutral-500">{namespace}: </span>
              {command.group && (
                <>
                  <span>{command.group}</span>
                  <span className="text-neutral-500"> — </span>
                </>
              )}
              <span className="text-text">{command.label}</span>
            </span>
            {command.active && (
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-accent-300">
                <Check size={13} weight="bold"/>
                {t("a11y:palette.active")}
              </span>
            )}
          </li>
        ))}

        {results.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-neutral-500">
            {t("a11y:palette.empty", {query})}
          </li>
        )}
      </ul>

      <div className="flex items-center gap-4 border-t border-neutral-800 px-4 py-2.5 text-[11px] text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <kbd className="rounded-[var(--radius-sm)] border border-neutral-700 px-1.5 py-0.5">↑</kbd>
          <kbd className="rounded-[var(--radius-sm)] border border-neutral-700 px-1.5 py-0.5">↓</kbd>
          {t("a11y:palette.navigate")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="inline-flex items-center rounded-[var(--radius-sm)] border border-neutral-700 px-1.5 py-0.5">
            <ArrowElbowDownLeft size={11}/>
          </kbd>
          {t("a11y:palette.run")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="rounded-[var(--radius-sm)] border border-neutral-700 px-1.5 py-0.5">Esc</kbd>
          {t("a11y:palette.close")}
        </span>
        <span className="ml-auto">{t("a11y:palette.results", {count: results.length})}</span>
      </div>
    </dialog>
  );
};
