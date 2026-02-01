import { useState, ReactNode } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FilterSection {
  id: string;
  label: string;
  content: ReactNode;
  activeCount?: number;
}

interface MobileFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sections: FilterSection[];
  activeFiltersCount: number;
  onClearAll: () => void;
  activeFilterTags?: ReactNode;
  // Desktop filter bar content
  desktopFilters?: ReactNode;
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
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(sections.map(s => s.id));

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  if (isMobile) {
    return (
      <div className="max-w-full overflow-hidden">
        {/* Mobile: Search + Filter Button */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1 min-w-0">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input h-10 pr-8 text-sm w-full"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsOpen(true)}
            className={cn(
              "h-10 w-10 shrink-0 relative",
              activeFiltersCount > 0 && "border-primary bg-primary/10"
            )}
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter tags on mobile - horizontal scroll */}
        {activeFilterTags && activeFiltersCount > 0 && (
          <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <div className="flex items-center gap-1.5 flex-nowrap">
              {activeFilterTags}
              <button
                onClick={onClearAll}
                className="text-xs text-destructive font-medium px-2 whitespace-nowrap shrink-0"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        )}

        {/* Filter Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
            <SheetHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg">Bộ lọc</SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-destructive hover:text-destructive"
                  >
                    Xóa tất cả ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="py-4 space-y-2 overflow-y-auto max-h-[calc(80vh-8rem)]">
              {sections.map((section) => (
                <Collapsible
                  key={section.id}
                  open={expandedSections.includes(section.id)}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{section.label}</span>
                        {section.activeCount && section.activeCount > 0 && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            {section.activeCount}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedSections.includes(section.id) && "rotate-180"
                      )} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 px-1">
                    {section.content}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>

            <SheetFooter className="pt-4 border-t border-border">
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Áp dụng bộ lọc
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop: Show inline filter bar
  return (
    <div className="space-y-3 mb-4">
      {desktopFilters}
      {activeFilterTags && activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Đang lọc:</span>
          {activeFilterTags}
          <button
            onClick={onClearAll}
            className="text-xs text-destructive hover:text-destructive/80 font-medium ml-2"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
