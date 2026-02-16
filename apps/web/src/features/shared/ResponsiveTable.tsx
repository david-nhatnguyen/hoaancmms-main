import { ReactNode, useState, useMemo, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface Column<T> {
  key: string;
  header: string;
  // For desktop table
  render: (item: T) => ReactNode;
  // For mobile card (optional - if not provided, uses render)
  mobileRender?: (item: T) => ReactNode;
  // Show in mobile card view?
  showOnMobile?: boolean;
  // Column alignment
  align?: 'left' | 'center' | 'right';
  // Column width class
  width?: string;
  // Is this the main/primary column?
  isPrimary?: boolean;
  // Is this the secondary info column?
  isSecondary?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  // Custom card renderer (overrides default card layout)
  renderMobileCard?: (item: T, columns: Column<T>[]) => ReactNode;
  // Pagination
  pageSize?: number;
  showPagination?: boolean;
}

// Mobile Pagination Component
function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1 py-4 px-2">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, idx) => (
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                "h-9 w-9 text-sm font-medium",
                currentPage === page && "bg-primary text-primary-foreground"
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        ))}
      </div>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Không có dữ liệu',
  renderMobileCard,
  pageSize = 10,
  showPagination = true
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);

  // Get paginated data for mobile
  const paginatedData = useMemo(() => {
    if (!isMobile || !showPagination) return data;
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize, isMobile, showPagination]);

  // Reset to page 1 when data changes significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Mobile Card View
  if (isMobile) {
    if (data.length === 0) {
      return (
        <div className="bg-card rounded-xl border border-border/50 p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {/* Results info */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>
              Trang {currentPage}/{totalPages} ({data.length} mục)
            </span>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-3 max-w-full overflow-x-hidden">
          {paginatedData.map((item) => {
            if (renderMobileCard) {
              return (
                <div key={keyExtractor(item)} className="max-w-full overflow-hidden">
                  {renderMobileCard(item, columns)}
                </div>
              );
            }

            // Default card layout
            const primaryCol = columns.find(c => c.isPrimary);
            const secondaryCol = columns.find(c => c.isSecondary);
            const mobileColumns = columns.filter(c => c.showOnMobile !== false && !c.isPrimary && !c.isSecondary);

            return (
              <div
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "bg-card rounded-xl border border-border/50 p-4 transition-all max-w-full overflow-hidden",
                  onRowClick && "cursor-pointer active:scale-[0.99] hover:border-primary/50"
                )}
              >
                {/* Primary & Secondary info */}
                <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {primaryCol && (
                      <div className="font-mono text-primary font-medium text-sm truncate">
                        {primaryCol.mobileRender?.(item) ?? primaryCol.render(item)}
                      </div>
                    )}
                    {secondaryCol && (
                      <div className="font-medium mt-0.5 truncate text-sm">
                        {secondaryCol.mobileRender?.(item) ?? secondaryCol.render(item)}
                      </div>
                    )}
                  </div>
                  {/* Find status/badge column and render on right */}
                  {columns.find(c => c.key === 'status') && (
                    <div className="shrink-0">
                      {columns.find(c => c.key === 'status')?.render(item)}
                    </div>
                  )}
                </div>

                {/* Other columns as key-value pairs */}
                <div className="space-y-1.5 text-sm">
                  {mobileColumns
                    .filter(col => col.key !== 'status' && col.key !== 'actions')
                    .slice(0, 3) // Limit to 3 extra fields on mobile for compact layout
                    .map(col => (
                      <div key={col.key} className="flex items-center justify-between gap-2 min-w-0">
                        <span className="text-muted-foreground shrink-0 text-xs">{col.header}:</span>
                        <span className="text-right truncate text-xs">
                          {col.mobileRender?.(item) ?? col.render(item)}
                        </span>
                      </div>
                    ))
                  }
                </div>

                {/* Actions at bottom */}
                {columns.find(c => c.key === 'actions') && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    {columns.find(c => c.key === 'actions')?.mobileRender?.(item) ??
                      columns.find(c => c.key === 'actions')?.render(item)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Pagination */}
        {showPagination && totalPages > 1 && (
          <MobilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            {columns
              .filter(col => col.key !== 'actions' || true) // Show all columns on desktop
              .map(col => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "table-header-cell",
                    col.width,
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right"
                  )}
                >
                  {col.header}
                </TableHead>
              ))
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "table-row-interactive",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.align === 'center' && "text-center",
                      col.align === 'right' && "text-right"
                    )}
                  >
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
