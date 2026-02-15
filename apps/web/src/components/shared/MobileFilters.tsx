
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileFilters, type FilterSection } from './mobile-filters/hooks/useMobileFilters';
import { MobileFilterTrigger } from './mobile-filters/components/MobileFilterTrigger';
import { MobileFilterSheet } from './mobile-filters/components/MobileFilterSheet';
import { DesktopFilterBar } from './mobile-filters/components/DesktopFilterBar';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export interface MobileFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sections: FilterSection[];
  activeFiltersCount: number;
  onClearAll: () => void;
  activeFilterTags?: React.ReactNode;
  desktopFilters?: React.ReactNode;
}

export function MobileFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  sections,
  activeFiltersCount,
  onClearAll,
  activeFilterTags,
  desktopFilters
}: MobileFiltersProps) {
  const isMobile = useIsMobile();
  
  const {
      isOpen,
      setIsOpen,
      expandedSections,
      toggleSection,
  } = useMobileFilters({
      sections, // Initialize expanded sections
  });

  // Mobile View
  if (isMobile) {
    return (
      <div className="max-w-full overflow-hidden">
        {/* Mobile Filter Bar */}
        <div className="flex items-center gap-3 m-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
             <Input
               placeholder={searchPlaceholder}
               value={searchValue}
               onChange={(e) => onSearchChange(e.target.value)}
               className="h-10 pr-9 text-sm w-full bg-background border-input/80 transition-all focus:border-primary"
             />
             {searchValue && (
               <button
                 onClick={() => onSearchChange('')}
                 className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                 aria-label="Xóa tìm kiếm"
                 title="Xóa tìm kiếm"
               >
                 <X className="h-4 w-4 text-muted-foreground" />
               </button>
             )}
          </div>
          
          {/* Filter Trigger Button */}
          <MobileFilterTrigger 
            activeCount={activeFiltersCount} 
            onClick={() => setIsOpen(true)} 
          />
        </div>

        {/* Active Tags Horizonatal Scroll */}
        {activeFilterTags && activeFiltersCount > 0 && (
           <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-2 -mx-2 px-3 no-scrollbar mask-gradient-right">
             <div className="flex items-center gap-2 flex-nowrap">
               {activeFilterTags}
               <button
                 onClick={onClearAll}
                 className="text-xs text-destructive font-medium px-2 whitespace-nowrap shrink-0 h-6 flex items-center bg-destructive/5 rounded-full"
               >
                 Xóa
               </button>
             </div>
           </div>
        )}

        {/* Mobile Filter Sheet (Drawer) */}
        <MobileFilterSheet
           isOpen={isOpen}
           onOpenChange={setIsOpen}
           activeFiltersCount={activeFiltersCount}
           sections={sections}
           onClearAll={onClearAll}
           searchPlaceholder={searchPlaceholder}
           searchValue={searchValue}
           onSearchChange={onSearchChange}
           expandedSections={expandedSections}
           toggleSection={toggleSection}
        />
      </div>
    );
  }

  // Desktop View
  return (
    <DesktopFilterBar
      desktopFilters={desktopFilters}
      activeFilterTags={activeFilterTags}
      activeFiltersCount={activeFiltersCount}
      onClearAll={onClearAll}
    />
  );
}
