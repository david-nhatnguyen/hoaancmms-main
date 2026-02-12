import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnFiltersState } from "@tanstack/react-table";

interface DataTableFilterChipsProps {
  filters: ColumnFiltersState;
  onRemove: (id: string, value: any) => void;
  onClearAll: () => void;
  getLabel?: (id: string, value: any) => string;
}

/**
 * Molecule component to display active filters as chips (badges)
 */
export function DataTableFilterChips({
  filters,
  onRemove,
  onClearAll,
  getLabel,
}: DataTableFilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {filters.map((filter) => {
        const values = Array.isArray(filter.value) ? filter.value : [filter.value];
        
        return values.map((val) => (
          <Badge
            key={`${filter.id}-${val}`}
            variant="secondary"
            className="pl-2 pr-1 py-1 gap-1 flex items-center bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <span className="text-xs font-medium">
              {getLabel ? getLabel(filter.id, val) : `${filter.id}: ${val}`}
            </span>
            <button
              onClick={() => onRemove(filter.id, val)}
              className="ml-1 rounded-full p-0.5 hover:bg-primary/20 text-primary/70 hover:text-primary transition-colors"
              aria-label={`Xóa bộ lọc ${val}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ));
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        Xóa tất cả
      </Button>
    </div>
  );
}
