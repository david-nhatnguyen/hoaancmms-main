import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Bell, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';

// Page title mapping
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/factories': 'Nhà máy',
  '/equipments': 'Thiết bị',
  '/equipments/new': 'Thêm thiết bị',
  '/checklists': 'Checklist',
  '/checklists/new': 'Tạo Checklist',
  '/pm-plans': 'Kế hoạch PM',
  '/pm-plans/new': 'Tạo kế hoạch PM',
  '/work-orders': 'Work Orders',
  '/corrective-maintenance': 'Sự cố & Sửa chữa',
  '/corrective-maintenance/new': 'Báo cáo sự cố',
  '/system/users': 'Người dùng',
  '/system/roles': 'Vai trò',
  '/system/logs': 'Nhật ký',
  '/system/settings': 'Cài đặt',
};

// Pages that should show back button
const getCanGoBack = (pathname: string): boolean => {
  // Root level pages don't show back button
  const rootPages = ['/', '/factories', '/equipments', '/checklists', '/pm-plans', '/work-orders', '/corrective-maintenance'];
  
  // Check if current path is a detail/edit/new page
  const isDetailPage = pathname.match(/\/[^/]+\/(\d+|new|edit)/);
  const isSystemSubPage = pathname.startsWith('/system/');
  
  return !rootPages.includes(pathname) || !!isDetailPage || isSystemSubPage;
};

const getPageTitle = (pathname: string): string => {
  // Direct match
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }
  
  // Check for dynamic routes
  if (pathname.match(/\/equipments\/\d+\/edit/)) return 'Sửa thiết bị';
  if (pathname.match(/\/equipments\/\d+/)) return 'Chi tiết thiết bị';
  if (pathname.match(/\/checklists\/\d+\/edit/)) return 'Sửa Checklist';
  if (pathname.match(/\/checklists\/\d+/)) return 'Chi tiết Checklist';
  if (pathname.match(/\/pm-plans\/\d+\/edit/)) return 'Sửa kế hoạch';
  if (pathname.match(/\/pm-plans\/\d+\/calendar/)) return 'Lịch PM';
  if (pathname.match(/\/pm-plans\/\d+/)) return 'Chi tiết PM';
  if (pathname.match(/\/work-orders\/\d+\/execute/)) return 'Thực hiện WO';
  if (pathname.match(/\/work-orders\/\d+/)) return 'Chi tiết WO';
  if (pathname.match(/\/corrective-maintenance\/\d+/)) return 'Chi tiết sự cố';
  if (pathname.match(/\/system\/roles\/\d+/)) return 'Chi tiết vai trò';
  
  return 'CMMS';
};

export function MobileHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const canGoBack = getCanGoBack(location.pathname);
  const pageTitle = getPageTitle(location.pathname);
  const isRootPage = location.pathname === '/';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-40 h-12 bg-card border-b border-border flex items-center px-2 safe-area-top">
      {/* Left section */}
      <div className="w-12 flex items-center justify-start">
        {canGoBack ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-9 w-9 -ml-1"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center ml-1">
            <span className="text-primary-foreground font-bold text-xs">CM</span>
          </div>
        )}
      </div>

      {/* Center - Title */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <h1 className={cn(
          "font-semibold truncate",
          isRootPage ? "text-base" : "text-sm"
        )}>
          {pageTitle}
        </h1>
      </div>

      {/* Right section */}
      <div className="w-12 flex items-center justify-end gap-0.5">
        <ThemeToggle />
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  );
}
