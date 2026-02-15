import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { Loader2 } from 'lucide-react';

interface ResponsiveDataViewProps {
  isLoading: boolean;
  isEmpty: boolean; // True if no data AND no filters
  emptyState: ReactNode; // Component to render when empty
  mobileContent: ReactNode; // The Mobile Table (ResponsiveTable)
  desktopContent: ReactNode; // The Desktop Table (DataTable)
  onRefresh?: () => Promise<void>; // For pull-to-refresh
  mobileFilters?: ReactNode; // Optional mobile filters component implementation
  desktopFilters?: ReactNode; // Optional desktop filter chips
}

export function ResponsiveDataView({
  isLoading,
  isEmpty,
  emptyState,
  mobileContent,
  desktopContent,
  onRefresh,
  mobileFilters,
  desktopFilters
}: ResponsiveDataViewProps) {
  const isMobile = useIsMobile();

  // If empty and not filtered, show empty state
  if (isEmpty && !isLoading) {
    return <div className="animate-in fade-in zoom-in-95 duration-500">{emptyState}</div>;
  }

  if (isMobile) {
    return (
      <>
        {mobileFilters}
        <PullToRefresh
          onRefresh={async () => {
             if(onRefresh) await onRefresh();
          }}
          isPullable={!!onRefresh}
          pullingContent={
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">⬇️ Kéo để làm mới</p>
            </div>
          }
          refreshingContent={
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Đang làm mới...</p>
            </div>
          }
        >
          <div className="pb-20">
            {mobileContent}
          </div>
        </PullToRefresh>
      </>
    );
  }

  // Desktop view
  return (
    <>
      {desktopFilters}
      {desktopContent}
    </>
  );
}
