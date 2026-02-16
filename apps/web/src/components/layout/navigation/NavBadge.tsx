import { cn } from '@/lib/utils';

interface NavBadgeProps {
    count?: number;
    active?: boolean;
    className?: string;
}

export function NavBadge({ count, active, className }: NavBadgeProps) {
    if (!count || count <= 0) return null;

    return (
        <span className={cn(
            "min-w-[18px] h-[18px] px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full animate-pulse shadow-lg transition-all duration-300",
            active
                ? "bg-primary-foreground text-primary shadow-primary-foreground/20"
                : "bg-destructive text-destructive-foreground shadow-destructive/40",
            className
        )}>
            {count > 99 ? '99+' : count}
        </span>
    );
}
