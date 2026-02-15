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
  renderMobileCard?: (item: T, columns: Column<T>[], isSelected: boolean, toggleSelection: () => void) => ReactNode;
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
  isLoading?: boolean;
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
  mobileCardAction,
  isLoading = false
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
    if (isLoading) {
      return (
        <div className="space-y-4 pt-1 pb-4">
          {[1, 2, 3].map((i) => (
            <div key={`mob-skel-${i}`} className="bg-card rounded-xl border border-border/50 p-5 space-y-4 animate-pulse">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="space-y-1">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="bg-card rounded-xl border border-border/50 p-16 text-center h-[400px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-full bg-muted/30">
               <svg className="h-10 w-10 text-muted-foreground opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
               </svg>
            </div>
            <p className="text-base font-semibold text-foreground/80">{emptyMessage}</p>
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
                  {renderMobileCard(item, columns, selectedIdsSet.has(keyExtractor(item)), () => toggleSelectItem(keyExtractor(item)))}
                </div>
              );
            }

            // Default configuration if renderMobileCard is not provided
            const primaryCol = columns.find(c => c.mobilePriority === 'primary') || columns.find(c => c.key !== 'select') || columns[0];
            const secondaryCol = columns.find(c => c.mobilePriority === 'secondary');
            // Cast strictly to align with previous flexible behavior
            const imageCol = columns.find(c => c.key === 'image' || c.mobilePriority === 'image' as any);
            const qrCol = columns.find(c => c.key === 'qrCode' || c.mobilePriority === 'qr' as any);
            const statusCol = columns.find(c => c.key === 'status' || c.mobilePriority === 'status' as any);
            
            const metadataCols = columns.filter(c => 
              (c.mobilePriority === 'metadata' || (!c.mobilePriority && !c.hiddenOnMobile)) &&
              c !== primaryCol && 
              c !== secondaryCol && 
              c !== imageCol && 
              c !== qrCol && 
              c !== statusCol && 
              c.key !== 'actions' && 
              c.key !== 'select'
            );

            return (
              <div key={keyExtractor(item)} className="animate-in fade-in slide-in-from-top-1 duration-300">
                <MobileCard
                  key={keyExtractor(item)}
                title={primaryCol?.mobileRender?.(item) ?? primaryCol?.render(item)}
                subtitle={secondaryCol ? (secondaryCol.mobileRender?.(item) ?? secondaryCol.render(item)) : undefined}
                status={statusCol?.render(item)}
                image={imageCol?.mobileRender?.(item) ?? imageCol?.render(item)}
                data={metadataCols.map(col => ({
                  label: typeof col.header === 'string' ? col.header : (col.mobileLabel || col.key),
                  value: col.mobileRender?.(item) ?? col.render(item)
                }))}
                actionSlot={qrCol ? (qrCol.mobileRender?.(item) ?? qrCol.render(item)) : undefined}
                footerActions={mobileCardAction?.(item)}
                isSelected={selectedIdsSet.has(keyExtractor(item))}
                onToggleSelection={() => toggleSelectItem(keyExtractor(item))}
                onClick={() => onRowClick?.(item)}
                renderSelection={isSelectable}
              />
              </div>
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
            {isLoading ? (
               // Loading Skeletons for Desktop
               Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={`esk-${i}`} className="border-border/40 h-16">
                  {isSelectable && <TableCell className="w-[40px] px-4"><div className="h-4 w-4 bg-muted rounded animate-pulse" /></TableCell>}
                  {columns.map((_, j) => (
                    <TableCell key={`ecell-${i}-${j}`}>
                      <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (isSelectable ? 1 : 0)} className="h-[400px] text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="p-4 rounded-full bg-muted/40 border border-border/10">
                      <svg className="h-10 w-10 text-muted-foreground opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-foreground/80">{emptyMessage}</p>
                      <p className="text-sm text-muted-foreground">Vui lòng điều chỉnh lại bộ lọc</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "table-row-interactive h-16 group border-border/40 animate-in fade-in slide-in-from-top-1 duration-300",
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
