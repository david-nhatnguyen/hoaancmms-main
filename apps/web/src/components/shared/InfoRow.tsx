import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InfoRowProps {
    label: string;
    value: React.ReactNode;
    icon?: LucideIcon;
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
}

/**
 * InfoRow molecule
 * Standards-compliant way to display a label-value pair.
 * Responsive: Stack vertically on mobile if content is long, but usually side-by-side.
 */
export const InfoRow: React.FC<InfoRowProps> = ({
    label,
    value,
    icon: Icon,
    className,
    labelClassName,
    valueClassName,
}) => {
    return (
        <div className={cn(
            "flex flex-col sm:flex-row sm:items-center py-3 px-4 gap-1 sm:gap-4 transition-colors hover:bg-muted/50",
            className
        )}>
            <div className={cn(
                "flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-full sm:w-32 lg:w-40 shrink-0",
                labelClassName
            )}>
                {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
                {label}
            </div>
            <div className={cn(
                "text-sm font-bold text-foreground truncate min-w-0 flex-1",
                valueClassName
            )}>
                {value || <span className="text-muted-foreground/30 font-normal italic">Chưa cập nhật</span>}
            </div>
        </div>
    );
};
