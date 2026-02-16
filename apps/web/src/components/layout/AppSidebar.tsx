import { NavLink, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarLogo } from './navigation/SidebarLogo';
import { NavigationContent } from './navigation/NavigationContent';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-sidebar flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarLogo isCollapsed={isCollapsed} onToggle={onToggle} />

        <NavigationContent isCollapsed={isCollapsed} />

        {/* Unified Footer */}
        <div className={cn(
          "p-3 border-t border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm",
          isCollapsed ? "flex flex-col items-center" : "px-4"
        )}>
          <NavLink
            to="/system/settings"
            className={cn(
              "group flex items-center transition-all duration-200 outline-none",
              isCollapsed
                ? "justify-center h-10 w-10 mx-auto rounded-xl"
                : "gap-3 px-3 py-2.5 rounded-lg text-sm",
              location.pathname === '/system/settings'
                ? "bg-primary text-primary-foreground font-medium"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-95"
            )}
          >
            <Settings className={cn(
              "shrink-0 transition-transform duration-200 group-hover:rotate-45",
              isCollapsed ? "h-5 w-5" : "h-4 w-4"
            )} />
            {!isCollapsed && <span className="truncate">Cài đặt hệ thống</span>}
          </NavLink>

          {!isCollapsed && (
            <div className="mt-3 px-3 flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-sidebar-foreground/80 uppercase tracking-[0.1em]">Version 1.2.0</span>
              <span className="text-[9px] text-primary/40 font-medium">© 2024 HOAA SOLUTIONS</span>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
