import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  MoreHorizontal,
  MoreVertical
} from 'lucide-react';
import { useMobileCard } from './hooks/use-mobile-card';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export interface MobileCardProps {
  // 1. Identity & Status (Header)
  title: ReactNode;         // e.g., Code (Primary)
  subtitle?: ReactNode;     // e.g., Name (Secondary)
  status?: ReactNode;       // e.g., Badge

  // 2. Visuals (Header/Body)
  image?: string | ReactNode;

  // 3. Content (Body Grid)
  // Generic key-value pairs for flexible layout
  data: Array<{
    label: string;
    value: ReactNode;
    colSpan?: number
  }>;

  // 4. Attachments/Extras
  actionSlot?: ReactNode; // e.g., QR Code area

  // 5. Interaction (Footer)
  footerActions?: ReactNode;

  // 6. State
  onClick?: () => void;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  renderSelection?: boolean;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  status,
  image,
  data,
  actionSlot,
  footerActions,
  onClick,
  isSelected = false,
  onToggleSelection,
  renderSelection,
  className
}: MobileCardProps) {
  const { isSheetOpen, openSheet, closeSheet, handleSelection } = useMobileCard({
    onToggleSelection
  });

  // Helper to render the image prop which can be a URL string or a ReactNode
  const renderImage = () => {
    if (!image) return null;

    if (typeof image === 'string') {
      return (
        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-xl border border-border/40 bg-muted/20 shadow-sm self-start group-hover:scale-[1.02] transition-transform duration-500">
          <img
            src={image}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-xl border border-border/40 bg-muted/20 shadow-sm self-start flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500">
        {image}
      </div>
    );
  };

  return (
    <>
      <div
        onClick={onClick}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
          "bg-card/40 backdrop-blur-sm hover:bg-card active:bg-accent/5",
          isSelected
            ? "border-primary/40 shadow-lg shadow-primary/5 ring-1 ring-primary/20 bg-primary/[0.03]"
            : "border-border/50 hover:border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5",
          onClick && "cursor-pointer",
          className
        )}
      >

        {/* Dedicated Selection Header Section - Optimized for Right-Side touch */}
        {renderSelection && (
          <div
            className={cn(
              "px-2 py-2 flex items-center justify-between border-border/30 transition-all cursor-pointer",
              isSelected ? "bg-primary/[0.04]" : "bg-muted/10 hover:bg-muted/20"
            )}
            onClick={handleSelection}
          >
            <div className={cn(
              "flex items-start gap-2"
            )}>
              {status && (
                <div className="shrink-0 transition-all transform origin-right">
                  {status}
                </div>
              )}
            </div>
            <div className={cn(
              "h-5 w-5 rounded-full border transition-all duration-300 flex items-center justify-center shadow-sm",
              isSelected
                ? "bg-primary border-primary text-primary-foreground scale-100 rotate-0"
                : "border-muted-foreground/20 bg-background rotate-12 scale-90"
            )}>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in-50 duration-200">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

          </div>
        )}

        <div className="p-2 flex flex-col gap-4">
          {/* Header Section: Primary Info + Image */}
          <div className="flex gap-4">
            {/* Main Image Asset */}
            {renderImage()}

            <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
              {/* Top Row: Title */}
              <div className="flex items-start justify-between gap-3">
                <div className="font-bold text-[12px] text-muted-foreground/80 uppercase tracking-[0.1em] truncate">
                  {title}
                </div>
              </div>

              {/* Subtitle: Main Content Headings */}
              {subtitle && (
                <div className="text-base font-bold text-card-foreground leading-tight line-clamp-2 pr-6 tracking-tight">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Metadata + Action Slot Grid */}
          {(data.length > 0 || actionSlot) && (
            <div className="grid grid-cols-[1fr_auto] gap-4 pt-4 border-t border-border/40 border-dashed">

              {/* Key-Value Metadata Grid */}
              {data.length > 0 && (
                <div className={cn(
                  "grid gap-x-6 gap-y-4 min-w-0",
                  data.length > 1 ? "grid-cols-2" : "grid-cols-1"
                )}>
                  {data.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex flex-col gap-1 min-w-0",
                        item.colSpan && `col-span-${item.colSpan}`
                      )}
                    >
                      <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider truncate">
                        {item.label}
                      </span>
                      <div className="text-xs font-semibold text-foreground/90 truncate">
                        {item.value || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Slot (Right side alignment) */}
              {actionSlot && (
                <div className="shrink-0 flex items-end justify-end pl-2">
                  <div className="w-16 h-16 bg-white p-1.5 rounded-xl border border-border shadow-sm group-hover:shadow-md transition-shadow">
                    {actionSlot}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Refined Native-like Action Trigger (Bottom Right) */}
        {footerActions && (
          <div className="absolute bottom-1 right-1 z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openSheet(e as any);
              }}
              aria-label="Tùy chọn thao tác"
              className={cn(
                "p-2 rounded-full flex items-center justify-center transition-all",
                "active:scale-90 text-muted-foreground/40 hover:text-primary bg-transparent border-none"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Logic-Driven Native Action Sheet */}
      <Drawer open={isSheetOpen} onOpenChange={closeSheet}>
        <DrawerContent className="p-0 border-none outline-none max-w-lg mx-auto overflow-hidden rounded-t-[32px]">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-muted/60 mt-4 mb-2" />
          <DrawerHeader className="pb-2 border-b border-border/40 mb-2">
            <DrawerTitle className="text-sm font-bold opacity-60 uppercase tracking-widest text-center">
              Tùy chọn thao tác
            </DrawerTitle>
          </DrawerHeader>
          <div
            className="px-4 pb-12 pt-4"
            onClick={closeSheet} // Auto-close on any action click
          >
            {footerActions}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
