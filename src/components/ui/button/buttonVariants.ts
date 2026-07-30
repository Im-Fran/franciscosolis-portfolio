import {cva} from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "border border-accent text-accent-300 bg-transparent hover:bg-accent-900/40",
        secondary: "border border-neutral-700 text-neutral-200 bg-transparent hover:bg-neutral-800/60",
        ghost: "border border-transparent text-neutral-200 bg-transparent hover:bg-neutral-800/40",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export {buttonVariants}
