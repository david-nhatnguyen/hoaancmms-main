import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Column } from '../ResponsiveTable';

export interface MobileCardProps<T> {
  item: T;
  columns: Column<T>[];
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onClick?: () => void;
  renderSelection?: boolean;
  action?: (item: T) => ReactNode;
}

export function MobileCard<T>({
  item,
  columns,
  isSelected,
  onToggleSelection,
  onClick,
  renderSelection,
  action
}: MobileCardProps<T>) {
  const primaryCol = columns.find(c => c.mobilePriority === 'primary') || columns[0];
  const secondaryCol = columns.find(c => c.mobilePriority === 'secondary');
  const imageCol = columns.find(c => c.key === 'image');
  const qrCol = columns.find(c => c.key === 'qrCode');
  const statusCol = columns.find(c => c.key === 'status');

  const metadataCols = columns.filter(c => 
    (c.mobilePriority === 'metadata' || (!c.mobilePriority && !c.hiddenOnMobile && c !== primaryCol && c !== secondaryCol)) &&
    c.key !== 'actions' && 
    c.key !== 'status' &&
    c.key !== 'image' &&
    c.key !== 'qrCode'
  );

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-0 overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-card hover:bg-accent/[0.02] active:scale-[0.98]",
        isSelected 
          ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20" 
          : "border-border/50 hover:border-primary/30 shadow-sm",
        onClick && "cursor-pointer"
      )}
    >
      {/* Interactive Selection Area (Top Right) */}
      {renderSelection && (
        <div 
          className="absolute top-2 right-2 z-30" 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection?.();
          }}
        >
          <div className={cn(
            "h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center shadow-md backdrop-blur-md",
            isSelected 
              ? "bg-primary border-primary text-primary-foreground scale-110" 
              : "border-white/80 bg-black/10 hover:border-primary/50"
          )}>
            {isSelected ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
              <div className="h-4 w-4 rounded-full border border-white/40" />
            )}
          </div>
        </div>
      )}

      {/* Visual Selection Highlight (Bg glow) */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/[0.04] pointer-events-none" />
      )}

      <div className="p-4 flex flex-col gap-4">
        {/* Header Section: Assets + Primary Info */}
        <div className="flex gap-5">
          {/* Main Image Asset */}
          {imageCol && (
            <div className="shrink-0 w-20 h-20 overflow-hidden rounded-2xl border border-border/50 shadow-sm bg-muted/20">
              {imageCol.mobileRender?.(item) ?? imageCol.render(item)}
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="font-mono text-primary font-bold text-xs tracking-wider uppercase opacity-80">
                {primaryCol.mobileRender?.(item) ?? primaryCol.render(item)}
              </div>
              {statusCol && (
                <div className={cn(
                  "shrink-0 scale-100 origin-right transition-all",
                  renderSelection && "mr-8" // Adjusted for smaller selection button
                )}>
                  {statusCol.render(item)}
                </div>
              )}
            </div>
            
            {secondaryCol && (
              <div className="text-lg font-bold text-foreground leading-tight line-clamp-2">
                {secondaryCol.mobileRender?.(item) ?? secondaryCol.render(item)}
              </div>
            )}
          </div>
        </div>

        {/* Body Section: QR + Metadata Grid */}
        <div className="flex gap-4 pt-3 border-t border-border/40">
           {/* QR Asset Area */}
           {qrCol && (
             <div className="shrink-0 w-20 h-20 bg-white p-2 rounded-2xl border border-border/50 shadow-sm flex items-center justify-center">
                {qrCol.mobileRender?.(item) ?? qrCol.render(item)}
             </div>
           )}

           {/* Grid of Metadata */}
           <div className={cn(
             "grid gap-x-4 gap-y-2 flex-1",
             metadataCols.length > 2 ? "grid-cols-2" : "grid-cols-1"
           )}>
             {metadataCols.map((col) => (
               <div key={col.key} className="flex flex-col min-w-0">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                   {col.mobileLabel || (typeof col.header === 'function' ? col.key : (col.header || col.key))}
                 </span>
                 <div className="text-xs font-semibold text-foreground/80 truncate">
                   {col.mobileRender?.(item) ?? col.render(item)}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Action Area - Full Width */}
      {action && (
        <div className="mt-auto bg-muted/30 border-t border-border/40 p-3">
          {action(item)}
        </div>
      )}
    </div>
  );
}
