import {cn} from "@/lib/utils.ts";

export type SpinnerProps = {
  size?: number;
  className?: string;
  label?: string;
};

/** Indeterminate progress ring, sized in px so it can sit inside a button or fill a panel. */
export const Spinner = ({size = 18, className, label}: SpinnerProps) => (
  <span
    role="status"
    aria-label={label}
    aria-live="polite"
    className={cn(
      "inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70",
      className,
    )}
    style={{width: size, height: size}}
  />
);
