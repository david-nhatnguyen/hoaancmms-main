import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MobileDrawer } from './MobileDrawer';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';
import { PageTransition } from './PageTransition';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <AppSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Mobile Drawer for "More" menu */}
      <MobileDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        // Desktop margin for sidebar
        !isMobile && (sidebarCollapsed ? "lg:ml-16" : "lg:ml-64")
      )}>
        {/* Desktop Header */}
        {!isMobile && (
          <AppHeader
            onMenuClick={() => setMobileMenuOpen(true)}
            showMenuButton={false}
          />
        )}

        {/* Mobile Header - App-like with back button */}
        {isMobile && <MobileHeader />}

        {/* Main content with bottom padding for mobile nav */}
        <main className={cn(
          "flex-1 overflow-auto",
          isMobile && "pb-20" // Space for bottom nav
        )}>
          {isMobile ? (
            <PageTransition>
              <Outlet />
            </PageTransition>
          ) : (
            <Outlet />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <BottomNav onMoreClick={() => setMobileMenuOpen(true)} />
        )}
      </div>
    </div>
  );
}
