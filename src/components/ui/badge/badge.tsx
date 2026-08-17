import { cn } from "@/lib/utils.ts"
import {type BadgeProps, badgeVariants} from "@/components/ui/badge/badge-variants.ts";

export const Badge = ({ className, variant, size, ...props }: BadgeProps) => <span className={cn(badgeVariants({variant, size}), className)} {...props} />
