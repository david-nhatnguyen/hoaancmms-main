import { useNavigationState } from '../hooks/useNavigationState';
import { NavLinkItem } from './NavLinkItem';
import { ExpandableNavItem } from './ExpandableNavItem';
import { cn } from '@/lib/utils';

interface NavigationContentProps {
    isCollapsed?: boolean;
    onItemClick?: () => void;
}

export function NavigationContent({ isCollapsed = false, onItemClick }: NavigationContentProps) {
    const { menuSections, isActive, expandedMenus, toggleMenu } = useNavigationState();

    return (
        <nav className={cn(
            "flex-1 py-3 overflow-y-auto custom-scrollbar transition-all duration-300",
            isCollapsed ? "px-2" : "px-3"
        )}>
            {menuSections.map((section, idx) => (
                <div
                    key={section.title}
                    className={cn(
                        "mb-6",
                        idx > 0 && "pt-4 border-t border-sidebar-border/30"
                    )}
                >
                    {/* Section Header */}
                    {!isCollapsed && (
                        <div className="px-3 mb-3">
                            <span className="text-[10px] font-bold text-sidebar-foreground/80 uppercase tracking-[0.1em]">
                                {section.title}
                            </span>
                        </div>
                    )}

                    {/* Section Items */}
                    <div className="space-y-1">
                        {section.items.map(item => {
                            const active = isActive(item.path);
                            const hasChildren = item.children && item.children.length > 0;

                            if (hasChildren) {
                                return (
                                    <ExpandableNavItem
                                        key={item.label}
                                        label={item.label}
                                        icon={item.icon}
                                        children={item.children!}
                                        isExpanded={expandedMenus.includes(item.label)}
                                        onToggle={() => toggleMenu(item.label)}
                                        isCollapsed={isCollapsed}
                                        onItemClick={onItemClick}
                                    />
                                );
                            }

                            return (
                                <NavLinkItem
                                    key={item.label}
                                    label={item.label}
                                    path={item.path!}
                                    icon={item.icon}
                                    badge={item.badge}
                                    active={active}
                                    isCollapsed={isCollapsed}
                                    onClick={onItemClick}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}
