import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {ArrowLeft, GlobeSimple} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button/button.tsx";
import {useLanguageToggle} from "@/hooks/useLanguageToggle.ts";

type LegalTab = "terms" | "privacy";
type Clause = { title: string; body: string };
type TerminalPhase = "typing-clear" | "loading-clear" | "typing-command" | "loading-command" | "streaming" | "loaded";
type CommittedRun = { lines: string[] };
type PreviousBlock = { firstLines: string[]; truncatedChars: number };

const tabs: LegalTab[] = ["terms", "privacy"];

const tabIds: Record<LegalTab, string> = {
  terms: "terms-of-service",
  privacy: "privacy-policy",
};

const CLEAR_CMD = "clear";
const TYPE_CHAR_MS = 35;
const CLAUSE_REVEAL_MS = 90;
const randomLoadMs = () => 300 + Math.random() * 400;
const randomTruncateExtraMs = () => 400 + Math.random() * 200;

const buildTranscriptLines = (command: string, updated: string, clauses: Clause[]): string[] => {
  const lines = [`$ ${CLEAR_CMD}`, `$ ${command}`, updated];
  clauses.forEach((clause) => {
    lines.push(clause.title);
    lines.push(clause.body);
  });
  return lines;
};

const toPreviousBlock = ({lines}: CommittedRun): PreviousBlock => {
  const firstLines = lines.slice(0, 4);
  const truncatedChars = lines.slice(4).reduce((sum, line) => sum + line.length, 0);
  return {firstLines, truncatedChars};
};

export const Legal = () => {
  const {t, i18n} = useTranslation();
  const {language, toggleLanguage} = useLanguageToggle();
  const [activeTab, setActiveTab] = useState<LegalTab>("terms");
  const [phase, setPhase] = useState<TerminalPhase>("loaded");
  const [clearChars, setClearChars] = useState(CLEAR_CMD.length);
  const [commandChars, setCommandChars] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [previousRun, setPreviousRun] = useState<PreviousBlock | null>(null);
  const committedRun = useRef<CommittedRun | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({width: 0, height: 0});

  const command = t(`legal:commands.${activeTab}`);
  const clauses = t(`legal:${activeTab}.clauses`, {returnObjects: true}) as unknown as Clause[];
  const updated = t(`legal:${activeTab}.updated`);
  const termUser = language === "es" ? "visitante" : "visitor";

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height)});
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, delay: number) => {
      timers.push(setTimeout(fn, delay));
    };

    setPreviousRun(committedRun.current ? toPreviousBlock(committedRun.current) : null);
    setPhase("typing-clear");
    setClearChars(0);
    setCommandChars(0);
    setRevealedCount(0);

    const clearTypedAt = CLEAR_CMD.length * TYPE_CHAR_MS;
    for (let i = 1; i <= CLEAR_CMD.length; i++) {
      schedule(() => setClearChars(i), i * TYPE_CHAR_MS);
    }
    schedule(() => setPhase("loading-clear"), clearTypedAt);

    const commandStartAt = clearTypedAt + randomLoadMs() + (committedRun.current ? randomTruncateExtraMs() : 0);
    schedule(() => {
      setPhase("typing-command");
      setPreviousRun(null);
    }, commandStartAt);
    for (let i = 1; i <= command.length; i++) {
      schedule(() => setCommandChars(i), commandStartAt + i * TYPE_CHAR_MS);
    }

    const commandTypedAt = commandStartAt + command.length * TYPE_CHAR_MS;
    schedule(() => setPhase("loading-command"), commandTypedAt);

    const streamStartAt = commandTypedAt + randomLoadMs();
    schedule(() => setPhase("streaming"), streamStartAt);
    for (let i = 1; i <= clauses.length; i++) {
      schedule(() => setRevealedCount(i), streamStartAt + i * CLAUSE_REVEAL_MS);
    }
    schedule(() => setPhase("loaded"), streamStartAt + clauses.length * CLAUSE_REVEAL_MS + 50);

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, i18n.language, command]);

  useEffect(() => {
    if (phase === "loaded") {
      committedRun.current = {lines: buildTranscriptLines(command, updated, clauses)};
    }
  }, [phase, command, updated, clauses]);

  const revealedClauses = phase === "loaded" ? clauses : clauses.slice(0, revealedCount);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 pt-32 pb-24 max-w-3xl">
        <div className="flex items-center justify-between mb-10">
          <Button asChild variant="ghost" size="sm" data-fs-hover>
            <Link to="/">
              <ArrowLeft size={16}/>
              {t("legal:back")}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleLanguage} data-fs-hover>
            <GlobeSimple size={16}/>
            {language === "es" ? "EN" : "ES"}
          </Button>
        </div>

        <p className="text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
          {t("legal:kicker")}
        </p>
        <h1 className="text-[clamp(32px,5.5vw,56px)] text-text mb-8">
          {t("legal:title")}
        </h1>

        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              data-fs-hover
            >
              {t(`legal:tabs.${tab}`)}
            </Button>
          ))}
        </div>

        <div className="rounded-[var(--radius-md)] border border-neutral-800 bg-surface overflow-hidden">
          <div className="relative flex items-center gap-2 px-4 py-3 bg-neutral-900/70 border-b border-neutral-800">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]"/>
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"/>
              <span className="w-3 h-3 rounded-full bg-[#27c93f]"/>
            </div>
            <p className="flex-1 min-w-0 truncate px-2 text-center text-[10px] sm:text-[11px] text-neutral-500 pointer-events-none select-none">
              {termUser}@franciscosolis.cl — zsh — {size.width}x{size.height}
            </p>
            <div className="w-[52px] shrink-0" aria-hidden="true"/>
          </div>

          <div ref={terminalRef} className="p-4 sm:p-6 font-mono text-xs sm:text-sm min-h-[420px]">
            {previousRun && (
              <div className="opacity-40 text-neutral-600 mb-4 space-y-0.5">
                {previousRun.firstLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                <p>[+{previousRun.truncatedChars} truncated]</p>
              </div>
            )}

            <p className="text-neutral-500 mb-4">
              $ {CLEAR_CMD.slice(0, clearChars)}
              {phase === "typing-clear" && <span className="ml-0.5 animate-pulse">▍</span>}
            </p>
            {phase !== "typing-clear" && (
              <p className="text-accent-300 mb-6">
                $ {command.slice(0, phase === "loading-clear" ? 0 : commandChars)}
                {phase === "typing-command" && <span className="ml-0.5 animate-pulse">▍</span>}
              </p>
            )}

            {(phase === "streaming" || phase === "loaded") && (
              <article id={tabIds[activeTab]} className="font-sans space-y-6 text-neutral-300">
                <p className="text-neutral-500 text-xs uppercase tracking-[0.08em]">{updated}</p>
                {revealedClauses.map((clause) => (
                  <div key={clause.title}>
                    <h2 className="text-text text-base sm:text-lg mb-2">{clause.title}</h2>
                    <p className="leading-[1.6]">{clause.body}</p>
                  </div>
                ))}
              </article>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
