import { Search, Bell, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function AppHeader({ onMenuClick, showMenuButton }: AppHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className={cn(
      "app-header",
      isMobile && "px-3 h-12"
    )}>
      {/* Mobile Menu Button */}
      {showMenuButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-9 w-9 mr-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Search - Hidden on mobile */}
      <div className={cn(
        "flex-1 max-w-md",
        isMobile && "hidden"
      )}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm máy, linh kiện, lệnh công việc..."
            className="search-input pl-9 h-9"
          />
        </div>
      </div>

      {/* Mobile: Logo/Title in center */}
      {isMobile && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">CM</span>
            </div>
            <span className="font-semibold text-sm">CMMS</span>
          </div>
        </div>
      )}

      {/* Right Actions */}
      <div className={cn(
        "flex items-center gap-1",
        isMobile && "gap-0.5"
      )}>
        {/* Theme Toggle */}
        <ThemeToggle />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative text-muted-foreground hover:text-foreground",
            isMobile && "h-9 w-9"
          )}
        >
          <Bell className={cn("h-5 w-5", isMobile && "h-4 w-4")} />
          <span className={cn(
            "absolute -top-0.5 -right-0.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium",
            isMobile ? "h-4 w-4 text-[8px]" : "h-4 w-4 text-[10px]"
          )}>
            9+
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "flex items-center gap-2 px-2",
                isMobile && "px-1"
              )}
            >
              <div className={cn(
                "rounded-full bg-primary/20 flex items-center justify-center",
                isMobile ? "h-7 w-7" : "h-8 w-8"
              )}>
                <User className={cn("text-primary", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
              </div>
              {!isMobile && (
                <span className="text-sm font-medium hidden sm:inline">Admin</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
            <DropdownMenuItem>Cài đặt</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-destructive">Đăng xuất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
