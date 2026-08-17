import type {ReactNode} from "react";
import {CheckCircle, Info, WarningCircle} from "@phosphor-icons/react";
import {cn} from "@/lib/utils.ts";

export type AlertTone = "error" | "success" | "info";

const tones: Record<AlertTone, {wrapper: string; icon: ReactNode}> = {
  error: {
    wrapper: "border-red-500/40 bg-red-500/10 text-red-200",
    icon: <WarningCircle size={18} weight="fill"/>,
  },
  success: {
    wrapper: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    icon: <CheckCircle size={18} weight="fill"/>,
  },
  info: {
    wrapper: "border-accent-700/50 bg-accent-900/40 text-accent-200",
    icon: <Info size={18} weight="fill"/>,
  },
};

export type AlertProps = {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
};

export const Alert = ({tone = "info", title, children, className}: AlertProps) => (
  <div
    role={tone === "error" ? "alert" : "status"}
    className={cn(
      "flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm",
      tones[tone].wrapper,
      className,
    )}
  >
    <span className="mt-0.5 shrink-0">{tones[tone].icon}</span>
    <div className="min-w-0 flex-1">
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={cn("text-[13px] leading-relaxed", title && "mt-0.5 opacity-90")}>{children}</div>}
    </div>
  </div>
);
