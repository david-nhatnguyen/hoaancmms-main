import { TableToolbarFilters } from '@/components/shared/table/TableToolbarFilters';

interface FilterItem {
  id: string;
  label?: string;
  component: React.ReactNode;
}

interface QuickAccessFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchPlaceholder?: string;
  filters: FilterItem[];
}

export function QuickAccessFilters({
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Tìm kiếm...",
  filters
}: QuickAccessFiltersProps) {

  return (
    <TableToolbarFilters
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={searchPlaceholder}
    >
      {filters.map((filter, index) => (
        <div key={filter.id} className="flex items-center gap-3">
          {index > 0 && <div className="h-6 w-px bg-border/50" />}
          {filter.label && (
             <span className="text-sm font-medium text-muted-foreground">{filter.label}</span>
          )}
          {filter.component}
        </div>
      ))}
    </TableToolbarFilters>
  );
}

