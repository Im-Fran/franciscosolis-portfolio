import {cva, type VariantProps} from "class-variance-authority";
import type * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] border px-2.5 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        accent: "border-transparent bg-accent-900/60 text-accent-300",
        outline: "border-neutral-700 text-neutral-300 bg-transparent",
        neutral: "border-transparent bg-neutral-800 text-neutral-300",
      },
      size: {
        default: "h-6 text-xs px-2.5",
        sm: "h-5 px-2 text-[11px]",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
)
