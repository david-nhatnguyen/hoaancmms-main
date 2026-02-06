import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sticky?: boolean;
  className?: string;
}

/**
 * Search bar component with sticky option for mobile
 * 
 * Features:
 * - Search icon
 * - Clear button (when has value)
 * - Sticky positioning option
 * - Mobile-optimized
 * 
 * @param value - Current search value
 * @param onChange - Change handler
 * @param placeholder - Placeholder text
 * @param sticky - Whether to stick to top on scroll
 * @param className - Additional CSS classes
 * 
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * 
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Tìm nhà máy..."
 *   sticky={isMobile}
 * />
 * ```
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  sticky = false,
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        'relative mb-4',
        sticky &&
          'sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 -mx-4 px-4',
        className
      )}
    >
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      {/* Input */}
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
        aria-label={placeholder}
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Xóa tìm kiếm"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
