
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export interface DesktopFilterBarProps {
  desktopFilters?: ReactNode;
  activeFilterTags?: ReactNode;
  activeFiltersCount: number;
  onClearAll: () => void;
}

export function DesktopFilterBar({
  desktopFilters,
  activeFilterTags,
  activeFiltersCount,
  onClearAll
}: DesktopFilterBarProps) {
  return (
    <div className="space-y-3 mb-4">
      {desktopFilters}
      {activeFilterTags && activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Đang lọc:</span>
          {activeFilterTags}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-destructive hover:text-destructive/80 font-medium ml-2 h-6 px-2"
          >
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );
}
