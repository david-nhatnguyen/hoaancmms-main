import { ReactNode, useState, useMemo, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MobileCard } from './table/MobileCard';

export interface Column<T> {
  key: string;
  header?: ReactNode | ((props: any) => ReactNode);
  // For desktop table
  render: (item: T) => ReactNode;
  // For mobile card (optional - if not provided, uses render)
  mobileRender?: (item: T) => ReactNode;
  // Meta-data for mobile
  mobileLabel?: string;
  hiddenOnMobile?: boolean;
  mobilePriority?: 'primary' | 'secondary' | 'metadata';
  // Column alignment
  align?: 'left' | 'center' | 'right';
  // Column width class
  width?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  // Mobile Card Styling
  renderMobileCard?: (item: T, columns: Column<T>[]) => ReactNode;
  mobileCardAction?: (item: T) => ReactNode;
  // Pagination Settings
  pageSize?: number;
  showPagination?: boolean;
  // Controlled Pagination (Server-Side)
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  // Selection
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

// Pagination Component (Shared)
function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
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
    <div className={cn("flex items-center gap-1 py-4 px-2", className)}>
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
              onClick={() => onPageChange(page as number)}
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
  showPagination = true,
  pageCount,
  currentPage: propCurrentPage,
  onPageChange,
  selectedIds,
  onSelectionChange,
  mobileCardAction
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  const [internalPage, setInternalPage] = useState(1);

  // Determine Controlled vs Uncontrolled
  const isControlled = typeof pageCount === 'number';
  const currentPage = isControlled ? (propCurrentPage || 1) : internalPage;
  const totalPages = isControlled ? (pageCount || 1) : Math.ceil(data.length / pageSize);

  const handlePageChange = (page: number) => {
    if (isControlled) {
      onPageChange?.(page);
    } else {
      setInternalPage(page);
    }
  };

  // Selection Logic
  const isSelectable = !!onSelectionChange;
  const selectedIdsSet = useMemo(() => new Set(selectedIds || []), [selectedIds]);

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    const currentIds = items.map(item => keyExtractor(item));
    const allSelectedInView = currentIds.every(id => selectedIdsSet.has(id));

    if (allSelectedInView) {
      onSelectionChange(selectedIds?.filter(id => !currentIds.includes(id)) || []);
    } else {
      const newSelection = Array.from(new Set([...(selectedIds || []), ...currentIds]));
      onSelectionChange(newSelection);
    }
  };

  const toggleSelectItem = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIdsSet.has(id)) {
      onSelectionChange(selectedIds?.filter(sid => sid !== id) || []);
    } else {
      onSelectionChange([...(selectedIds || []), id]);
    }
  };

  // Get items to render
  const items = useMemo(() => {
    // If controlled or hidden pagination, render data as is
    if (isControlled || !showPagination) return data;
    
    // Client-side pagination logic
    const startIndex = (internalPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, isControlled, showPagination, internalPage, pageSize]);

  // Reset internal page if data length changes drastically (only for uncontrolled)
  useEffect(() => {
    if (!isControlled && internalPage > totalPages && totalPages > 0) {
      setInternalPage(1);
    }
  }, [totalPages, internalPage, isControlled]);

  // Mobile Card View
  if (isMobile) {
    if (data.length === 0) {
      return (
        <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-base font-medium">{emptyMessage}</p>
            {emptyMessage.includes('kết quả') && (
              <p className="text-sm text-muted-foreground">Vui lòng điều chỉnh lại bộ lọc</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {/* Results info */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span>
              Trang {currentPage}/{totalPages} ({isControlled ? '...' : data.length} mục)
            </span>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4 max-w-full overflow-x-hidden pt-1 pb-4">
          {items.map((item) => {
            if (renderMobileCard) {
              return (
                <div key={keyExtractor(item)} className="max-w-full overflow-hidden">
                  {renderMobileCard(item, columns)}
                </div>
              );
            }

            return (
              <MobileCard<T>
                key={keyExtractor(item)}
                item={item}
                columns={columns}
                isSelected={selectedIdsSet.has(keyExtractor(item))}
                onToggleSelection={() => toggleSelectItem(keyExtractor(item))}
                onClick={() => onRowClick?.(item)}
                renderSelection={isSelectable}
                action={mobileCardAction}
              />
            );
          })}
        </div>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="justify-center"
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
              {isSelectable && (
                <TableHead className="w-[40px] px-4">
                  <Checkbox 
                    checked={items.length > 0 && items.every(item => selectedIdsSet.has(keyExtractor(item)))}
                    onCheckedChange={toggleSelectAll}
                    className="border-border/50 data-[state=checked]:bg-primary"
                  />
                </TableHead>
              )}
              {columns.map(col => (
                <TableHead 
                  key={col.key} 
                  className={cn(
                    "table-header-cell",
                    col.width,
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right"
                  )}
                >
                  {typeof col.header === 'function' ? (col.mobileLabel || col.key) : (col.header || col.mobileLabel || col.key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "table-row-interactive",
                    onRowClick && "cursor-pointer",
                    selectedIdsSet.has(keyExtractor(item)) && "bg-primary/[0.03] dark:bg-primary/[0.05]"
                  )}
                >
                  {isSelectable && (
                    <TableCell className="w-[40px] px-4" onClick={e => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIdsSet.has(keyExtractor(item))}
                        onCheckedChange={() => toggleSelectItem(keyExtractor(item))}
                        className="border-border/50 data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                  )}
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

      {/* Desktop Pagination */}
      {showPagination && totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="justify-end border-t border-border/50 bg-card/50"
        />
      )}
    </div>
  );
}
