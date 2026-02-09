import { TableToolbarFilters } from '@/components/shared/table/TableToolbarFilters';

interface FilterItem {
  key: string;
  component: React.ReactNode;
  label?: string; // Optional label for grouping/visual separation
}

interface DynamicDesktopFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterItems: FilterItem[];
}

export function DynamicDesktopFilters({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filterItems,
}: DynamicDesktopFiltersProps) {
  return (
    <TableToolbarFilters
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
    >
      {filterItems.map((item, index) => (
        <div key={item.key} className="flex items-center gap-3">
          {index > 0 && <div className="h-6 w-px bg-border/50" />}
          {item.label && (
            <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
          )}
          {item.component}
        </div>
      ))}
    </TableToolbarFilters>
  );
}
