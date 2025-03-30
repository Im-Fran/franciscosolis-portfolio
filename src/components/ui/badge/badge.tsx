import { cn } from "@/lib/utils.ts"
import {BadgeProps, badgeVariants} from "@/components/ui/badge/badge-variants.ts";

export const Badge = ({ className, variant, size, ...props }: BadgeProps) => <div className={cn(badgeVariants({variant, size}), className)} {...props} />
