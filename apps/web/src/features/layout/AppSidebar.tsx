import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Factory,
  Cpu,
  ClipboardList,
  Wrench,
  AlertTriangle,
  BarChart3,
  Settings,
  FileText,
  LayoutDashboard,
  Users,
  Shield,
  ScrollText,
  Cog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: { label: string; path: string }[];
  badge?: number; // Notification badge count
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Mock: số sự cố chưa xử lý (trong thực tế sẽ lấy từ API/state)
const INCIDENT_COUNT = 3;

const menuSections: MenuSection[] = [
  {
    title: 'DASHBOARD',
    items: [
      {
        label: 'Dashboard & KPI',
        path: '/',
        icon: LayoutDashboard,
      }
    ]
  },
  {
    title: 'TÀI SẢN',
    items: [
      {
        label: 'Nhà máy',
        path: '/factories',
        icon: Factory,
      },
      {
        label: 'Thiết bị',
        path: '/equipments',
        icon: Cpu,
      }
    ]
  },
  {
    title: 'BẢO DƯỠNG',
    items: [
      {
        label: 'Thư viện Checklist',
        path: '/checklists',
        icon: ClipboardList,
      },
      {
        label: 'Kế hoạch PM',
        path: '/pm-plans',
        icon: Wrench,
      },
      {
        label: 'Work Orders',
        path: '/work-orders',
        icon: FileText,
      }
    ]
  },
  {
    title: 'GIÁM SÁT',
    items: [
      {
        label: 'Bảo trì sự cố',
        path: '/corrective-maintenance',
        icon: AlertTriangle,
        badge: INCIDENT_COUNT, // Số sự cố cần xử lý
      }
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      {
        label: 'Người dùng',
        path: '/system/users',
        icon: Users,
      },
      {
        label: 'Vai trò & Phân quyền',
        path: '/system/roles',
        icon: Shield,
      },
      {
        label: 'Nhật ký hệ thống',
        path: '/system/logs',
        icon: ScrollText,
      },
      {
        label: 'Cài đặt chung',
        path: '/system/settings',
        icon: Cog,
      }
    ]
  }
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const isActive = (path?: string) => path && location.pathname.startsWith(path);

  return (
    <TooltipProvider delayDuration={0}>
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-sidebar flex flex-col transition-all duration-300 border-r border-sidebar-border",
          isCollapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">CM</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sidebar-accent-foreground text-sm truncate">CMMS</span>
                <span className="text-[10px] text-primary font-medium">Factory Pro</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {menuSections.map((section, sectionIdx) => (
            <div key={section.title} className={cn("mb-4", sectionIdx > 0 && "pt-3 border-t border-sidebar-border/50")}>
              {/* Section Title */}
              {!isCollapsed && (
                <div className="px-2 mb-2">
                  <span className="text-[10px] font-semibold text-sidebar-foreground/50 tracking-wider">
                    {section.title}
                  </span>
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = isActive(item.path);
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedMenus.includes(item.label);

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger asChild>
                          <NavLink
                            to={item.path || '#'}
                            className={cn(
                              "relative flex items-center justify-center h-10 w-full rounded-lg transition-all duration-200",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            {/* Badge khi collapsed */}
                            {item.badge && item.badge > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full animate-pulse shadow-lg shadow-destructive/50">
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            )}
                          </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
                          <span className="flex items-center gap-2">
                            {item.label}
                            {item.badge && item.badge > 0 && (
                              <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  if (hasChildren) {
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200",
                            active 
                              ? "bg-primary text-primary-foreground font-medium" 
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {isExpanded 
                            ? <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                            : <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                          }
                        </button>
                        {isExpanded && (
                          <div className="mt-0.5 ml-4 pl-3 border-l border-sidebar-border/40 space-y-0.5">
                            {item.children!.map(child => (
                              <NavLink
                                key={child.path}
                                to={child.path}
                                className={cn(
                                  "block px-2.5 py-1.5 rounded-lg text-sm transition-all duration-200",
                                  location.pathname === child.path
                                    ? "bg-sidebar-accent text-primary font-medium"
                                    : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
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

                  return (
                    <NavLink
                      key={item.label}
                      to={item.path || '#'}
                      className={cn(
                        "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200",
                        active
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate flex-1">{item.label}</span>
                      {/* Badge với animation nhấp nháy */}
                      {item.badge && item.badge > 0 && (
                        <span className={cn(
                          "min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full animate-pulse shadow-lg",
                          active 
                            ? "bg-primary-foreground text-primary" 
                            : "bg-destructive text-destructive-foreground shadow-destructive/50"
                        )}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-sidebar-border">
            <NavLink
              to="/settings"
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200",
                location.pathname === '/settings'
                  ? "bg-sidebar-accent text-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Cài đặt</span>
            </NavLink>
            <div className="mt-3 px-2.5 text-[10px] text-sidebar-foreground/40">
              Asset Master v1.0
            </div>
          </div>
        )}

        {/* Collapsed Footer */}
        {isCollapsed && (
          <div className="p-2 border-t border-sidebar-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  className={cn(
                    "flex items-center justify-center h-10 w-full rounded-lg transition-all duration-200",
                    location.pathname === '/settings'
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Settings className="h-5 w-5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
                Cài đặt
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
