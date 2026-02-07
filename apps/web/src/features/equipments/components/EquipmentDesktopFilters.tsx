import { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Filters, STATUS_OPTIONS } from '../hooks/useEquipmentFilters';

// Reusable components within this file to avoid complex imports if they're only used here
interface MultiSelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  searchable = false,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabels = options
    .filter(o => selected.includes(o.value))
    .map(o => o.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 border-border/50 bg-secondary/50 hover:bg-secondary",
            selected.length > 0 && "border-primary/50 bg-primary/10"
          )}
        >
          <span className="text-sm">
            {selected.length === 0
              ? label
              : selected.length === 1
                ? selectedLabels[0]
                : `${label} (${selected.length})`
            }
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-popover border-border z-50" align="start">
        <Command className="bg-transparent">
          {searchable && <CommandInput placeholder={`Tìm ${label.toLowerCase()}...`} className="h-9" />}
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onToggle(option.value)}
                  className="cursor-pointer"
                >
                  <div className={cn(
                    "mr-2 h-4 w-4 rounded border border-primary flex items-center justify-center",
                    selected.includes(option.value) ? "bg-primary" : "bg-transparent"
                  )}>
                    {selected.includes(option.value) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ChipFilter({
  options,
  selected,
  onToggle
}: {
  options: { value: string; label: string; color: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onToggle(option.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            selected.includes(option.value)
              ? `${option.color} text-white border-transparent shadow-sm`
              : "bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface EquipmentDesktopFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filters: Filters;
  toggleFilter: (category: keyof Filters, value: string) => void;
  factoryOptions: { value: string; label: string }[];
}

export function EquipmentDesktopFilters({
  searchQuery,
  setSearchQuery,
  filters,
  toggleFilter,
  factoryOptions
}: EquipmentDesktopFiltersProps) {

  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã, tên, hãng, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input pl-9 h-9"
          />
        </div>

        <div className="h-6 w-px bg-border/50" />

        {/* Factory Dropdown */}
        <MultiSelectDropdown
          label="Nhà máy"
          options={factoryOptions}
          selected={filters.factory}
          onToggle={(value) => toggleFilter('factory', value)}
          searchable
        />

        <div className="h-6 w-px bg-border/50" />

        {/* Status Chips */}
        <ChipFilter
          options={STATUS_OPTIONS}
          selected={filters.status}
          onToggle={(value) => toggleFilter('status', value)}
        />
      </div>
    </div>
  );
}
