import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExpandableNavItemProps {
    label: string;
    icon: React.ElementType;
    children: { label: string; path: string }[];
    isExpanded: boolean;
    onToggle: () => void;
    isCollapsed: boolean;
    onItemClick?: () => void;
}

export function ExpandableNavItem({
    label,
    icon: Icon,
    children,
    isExpanded,
    onToggle,
    isCollapsed,
    onItemClick
}: ExpandableNavItemProps) {
    const location = useLocation();
    const hasActiveChild = children.some(child => location.pathname === child.path);

    const trigger = (
        <button
            onClick={isCollapsed ? undefined : onToggle}
            className={cn(
                "group w-full flex items-center transition-all duration-200 outline-none",
                isCollapsed
                    ? "justify-center h-10 w-10 mx-auto rounded-xl"
                    : "gap-3 px-3 py-2.5 rounded-lg text-sm",
                hasActiveChild && !isExpanded && !isCollapsed
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-95"
            )}
        >
            <Icon className={cn(
                "shrink-0 transition-transform duration-200 group-hover:scale-110",
                isCollapsed ? "h-5 w-5" : "h-4 w-4"
            )} />

            {!isCollapsed && (
                <>
                    <span className="flex-1 text-left truncate">{label}</span>
                    {isExpanded
                        ? <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform" />
                        : <ChevronRight className="h-3.5 w-3.5 opacity-60 transition-transform" />
                    }
                </>
            )}
        </button>
    );

    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {trigger}
                </TooltipTrigger>
                <TooltipContent side="right" className="p-1 min-w-[150px]">
                    <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        {label}
                    </div>
                    {children.map(child => (
                        <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={onItemClick}
                            className={cn(
                                "block px-2 py-1.5 rounded-md text-sm transition-colors",
                                location.pathname === child.path
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent"
                            )}
                        >
                            {child.label}
                        </NavLink>
                    ))}
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div className="space-y-0.5">
            {trigger}
            {isExpanded && (
                <div className="ml-5 pl-4 border-l border-sidebar-border/40 space-y-0.5 animate-in slide-in-from-left-2 duration-200">
                    {children.map(child => (
                        <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={onItemClick}
                            className={cn(
                                "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                location.pathname === child.path
                                    ? "bg-sidebar-accent text-primary font-medium"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                            )}
                        >
                            {child.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}
