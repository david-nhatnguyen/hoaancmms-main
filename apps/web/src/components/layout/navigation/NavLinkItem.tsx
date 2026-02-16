import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavBadge } from './NavBadge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavLinkItemProps {
    label: string;
    path: string;
    icon: React.ElementType;
    badge?: number;
    active: boolean;
    isCollapsed?: boolean;
    onClick?: () => void;
}

export function NavLinkItem({
    label,
    path,
    icon: Icon,
    badge,
    active,
    isCollapsed,
    onClick
}: NavLinkItemProps) {

    const content = (
        <NavLink
            to={path}
            onClick={onClick}
            className={cn(
                "group relative flex items-center transition-all duration-200 outline-none",
                isCollapsed
                    ? "justify-center h-10 w-10 mx-auto rounded-xl"
                    : "gap-3 px-3 py-2.5 rounded-lg text-sm",
                active
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-95"
            )}
        >
            <Icon className={cn(
                "shrink-0 transition-transform duration-200 group-hover:scale-110",
                isCollapsed ? "h-5 w-5" : "h-4 w-4"
            )} />

            {!isCollapsed && <span className="truncate flex-1">{label}</span>}

            {badge && badge > 0 && (
                <NavBadge
                    count={badge}
                    active={active}
                    className={cn(isCollapsed && "absolute -top-1 -right-1")}
                />
            )}
        </NavLink>
    );

    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    {content}
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-3">
                    {label}
                    {badge && <NavBadge count={badge} active={false} className="animate-none" />}
                </TooltipContent>
            </Tooltip>
        );
    }

    return content;
}
