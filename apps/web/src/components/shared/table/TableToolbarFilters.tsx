import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TableToolbarFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function TableToolbarFilters({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  children
}: TableToolbarFiltersProps) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm relative overflow-hidden">
      <div className="flex flex-wrap items-center gap-6">
        {/* Search Input - Smaller Size */}
        <div className="relative w-full max-w-xs group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input pl-10 h-10 bg-secondary/30 border-border/50 transition-all focus:bg-background focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Custom Filters (Children) */}
        <div className="flex items-center gap-6 flex-wrap flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
