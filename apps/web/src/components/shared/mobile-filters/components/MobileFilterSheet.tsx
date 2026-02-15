import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FilterSection } from './FilterSection';

export interface MobileFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeFiltersCount: number;
  sections: Array<{
    id: string;
    label: string;
    content: ReactNode;
    activeCount?: number;
  }>;
  onClearAll: () => void;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  expandedSections: string[];
  toggleSection: (id: string) => void;
}

export function MobileFilterSheet({
  isOpen,
  onOpenChange,
  activeFiltersCount,
  sections,
  onClearAll,
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  expandedSections,
  toggleSection
}: MobileFilterSheetProps) {
  
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[60]" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[92%] mt-24 fixed bottom-0 left-0 right-0 z-[60] focus:outline-none">
          {/* Handle */}
          <div className="p-4 bg-background rounded-t-[10px] flex-1 flex flex-col overflow-hidden relative">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-1 h-9">
              <Drawer.Title className="text-xl font-bold tracking-tight flex items-center">
                Bộ lọc
                <span className={cn(
                  "ml-2 text-primary text-sm font-normal transition-all duration-300",
                  activeFiltersCount > 0 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none"
                )}>
                  ({activeFiltersCount})
                </span>
              </Drawer.Title>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className={cn(
                  "text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2 transition-all duration-300",
                  activeFiltersCount > 0 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
                )}
              >
                Xóa tất cả
              </Button>
            </div>

            {/* Search (Sticky optional, here just top of content) */}
            <div className="relative mb-6">
               <Input
                 placeholder={searchPlaceholder}
                 value={searchValue}
                 onChange={(e) => onSearchChange(e.target.value)}
                 className="h-11 pl-4 pr-10 text-base bg-muted/30 border-muted-foreground/20"
               />
               {searchValue && (
                 <button
                   onClick={() => onSearchChange('')}
                   className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full text-muted-foreground"
                   aria-label="Xóa tìm kiếm"
                 >
                   <X className="h-4 w-4" />
                 </button>
               )}
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-28">
              {sections.map((section) => (
                <FilterSection
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  content={section.content}
                  activeCount={section.activeCount}
                  isOpen={expandedSections.includes(section.id)}
                  onToggle={toggleSection}
                />
              ))}
              
              {sections.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    Không có bộ lọc nào available.
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Button 
                className="w-full h-12 text-base font-medium shadow-lg" 
                onClick={() => onOpenChange(false)}
              >
                Áp dụng bộ lọc
              </Button>
            </div>
            
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
