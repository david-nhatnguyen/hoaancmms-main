import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationContent } from './navigation/NavigationContent';

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const location = useLocation();

  const handleNavigate = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[300px] p-0 bg-sidebar border-sidebar-border flex flex-col"
      >
        <SheetHeader className="h-16 flex flex-row items-center justify-between px-5 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-xs">CM</span>
            </div>
            <div className="flex flex-col">
              <SheetTitle className="font-bold text-sidebar-accent-foreground text-sm tracking-tight">CMMS PRO</SheetTitle>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Asset Management</span>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <NavigationContent isCollapsed={false} onItemClick={handleNavigate} />
        </div>

        <div className="p-4 border-t border-sidebar-border/50 bg-sidebar/50 backdrop-blur-sm safe-area-bottom">
          <NavLink
            to="/system/settings"
            onClick={handleNavigate}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-95 outline-none",
              location.pathname === '/system/settings'
                ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="flex-1 font-medium">Cài đặt hệ thống</span>
          </NavLink>
        </div>
      </SheetContent>
    </Sheet>
  );
}
