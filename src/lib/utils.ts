import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string and resolves Tailwind CSS conflicts.
 *
 * @param inputs - Class names or conditional class name objects
 * @returns Merged class string with resolved Tailwind conflicts
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))