import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarLogo } from '@/components/layout/navigation/SidebarLogo';
import { NavigationContent } from '@/components/layout/navigation/NavigationContent';
import { useNavigationState } from '@/components/layout/hooks/useNavigationState';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Feature-level Sidebar implementation.
 * Leverages Atomic Design components for consistency and native-like feel.
 */
export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const { pathname } = useNavigationState();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-sidebar flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border shadow-xl",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Branding & Control Molecule */}
        <SidebarLogo isCollapsed={isCollapsed} onToggle={onToggle} />

        {/* Dynamic Navigation Organism */}
        <NavigationContent isCollapsed={isCollapsed} />

        {/* Refined Footer - Following Premium Standards */}
        <div className={cn(
          "p-3 border-t border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm safe-area-bottom",
          isCollapsed ? "flex flex-col items-center" : "px-4"
        )}>
          <NavLink
            to="/system/settings"
            className={cn(
              "group flex items-center transition-all duration-200 outline-none",
              isCollapsed
                ? "justify-center h-10 w-10 rounded-xl"
                : "gap-3 px-3 py-2.5 rounded-lg text-sm",
              pathname === '/system/settings'
                ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-95"
            )}
          >
            <Settings className={cn(
              "shrink-0 transition-transform duration-200 group-hover:rotate-45",
              isCollapsed ? "h-5 w-5" : "h-4 w-4"
            )} />
            {!isCollapsed && <span className="truncate font-medium">Cấu hình hệ thống</span>}
          </NavLink>

          {!isCollapsed && (
            <div className="mt-4 px-3 flex flex-col gap-0.5 opacity-40">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Version 1.2.0</span>
              <span className="text-[9px] font-medium text-sidebar-foreground">Factory Pro Management System</span>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
