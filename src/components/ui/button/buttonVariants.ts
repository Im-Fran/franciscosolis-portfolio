import {cva} from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-indigo-100 hover:bg-indigo-600/90",
        defaultOutline: "border border-indigo-600 dark:border-indigo-400 bg-transparent text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/10",
        destructive: "bg-red-600 text-red-100 hover:bg-red-600/90",
        outline: "border border-neutral-600 dark:border-neutral-400 bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-600/10",
        ghost: "text-neutral-800 dark:text-neutral-100 hover:bg-neutral-500 hover:text-neutral-100 dark:hover:bg-neutral-700",
        secondary: "bg-neutral-600 dark:bg-neutral-400 text-neutral-100 dark:text-neutral-800 hover:bg-neutral-500 dark:hover:bg-neutral-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export {buttonVariants}