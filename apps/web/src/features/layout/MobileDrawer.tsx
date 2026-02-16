import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Factory,
  Cpu,
  ClipboardList,
  Wrench,
  AlertTriangle,
  Settings,
  FileText,
  LayoutDashboard,
  Users,
  Shield,
  ScrollText,
  Cog
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface MenuItem {
  label: string;
  path?: string;
  icon: React.ElementType;
  children?: { label: string; path: string }[];
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

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
        badge: INCIDENT_COUNT,
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

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
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

  const handleNavigate = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[280px] p-0 bg-sidebar border-sidebar-border"
      >
        <SheetHeader className="h-14 flex flex-row items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">CM</span>
            </div>
            <div className="flex flex-col">
              <SheetTitle className="font-semibold text-sidebar-accent-foreground text-sm">CMMS</SheetTitle>
              <span className="text-[10px] text-primary font-medium">Factory Pro</span>
            </div>
          </div>
        </SheetHeader>

        <nav className="flex-1 py-3 px-3 overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          {menuSections.map((section, sectionIdx) => (
            <div key={section.title} className={cn("mb-4", sectionIdx > 0 && "pt-3 border-t border-sidebar-border/50")}>
              <div className="px-2 mb-2">
                <span className="text-[10px] font-semibold text-sidebar-foreground/50 tracking-wider">
                  {section.title}
                </span>
              </div>

              <div className="space-y-1">
                {section.items.map(item => {
                  const active = isActive(item.path);
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedMenus.includes(item.label);

                  if (hasChildren) {
                    return (
                      <div key={item.label}>
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                            active
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {isExpanded
                            ? <ChevronDown className="h-4 w-4 opacity-60" />
                            : <ChevronRight className="h-4 w-4 opacity-60" />
                          }
                        </button>
                        {isExpanded && (
                          <div className="mt-1 ml-5 pl-4 border-l border-sidebar-border/40 space-y-1">
                            {item.children!.map(child => (
                              <NavLink
                                key={child.path}
                                to={child.path}
                                onClick={handleNavigate}
                                className={cn(
                                  "block px-3 py-2 rounded-lg text-sm transition-all duration-200",
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
                      onClick={handleNavigate}
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                        active
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
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
        <div className="p-3 border-t border-sidebar-border">
          <NavLink
            to="/settings"
            onClick={handleNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
              location.pathname === '/settings'
                ? "bg-sidebar-accent text-primary font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span>Cài đặt</span>
          </NavLink>
          <div className="mt-3 px-3 text-[10px] text-sidebar-foreground/40">
            Asset Master v1.0
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
