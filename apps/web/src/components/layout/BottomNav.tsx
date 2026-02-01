import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  Menu 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  matchPaths?: string[];
}

const INCIDENT_COUNT = 3;

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    matchPaths: ['/'],
  },
  {
    label: 'Thiết bị',
    path: '/equipments',
    icon: Cpu,
    matchPaths: ['/equipments', '/factories'],
  },
  {
    label: 'Work Order',
    path: '/work-orders',
    icon: FileText,
    matchPaths: ['/work-orders', '/pm-plans', '/checklists'],
  },
  {
    label: 'Sự cố',
    path: '/corrective-maintenance',
    icon: AlertTriangle,
    badge: INCIDENT_COUNT,
    matchPaths: ['/corrective-maintenance'],
  },
];

interface BottomNavProps {
  onMoreClick: () => void;
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const location = useLocation();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(p => 
        p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
      );
    }
    return location.pathname === item.path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 px-2 transition-colors relative",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-110"
                )} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-medium transition-all",
                active && "text-primary"
              )}>
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </NavLink>
          );
        })}
        
        {/* More menu button */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 px-2 text-muted-foreground transition-colors active:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-1 font-medium">Thêm</span>
        </button>
      </div>
    </nav>
  );
}
