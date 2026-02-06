import { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CYCLE_LABELS, CHECKLIST_STATUS_LABELS } from '@/data/checklistData';
import { EQUIPMENT_GROUPS, MACHINE_TYPES } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FilterState {
  machineTypes: string[];
  cycle: string[];
  status: string[];
}

interface ChecklistFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const CYCLE_OPTIONS = Object.entries(CYCLE_LABELS).map(([key, label]) => ({ id: key, label }));
const STATUS_OPTIONS = [
  { id: 'active', label: 'Áp dụng', color: 'bg-status-active' },
  { id: 'draft', label: 'Nháp', color: 'bg-muted-foreground' },
  { id: 'inactive', label: 'Ngừng SD', color: 'bg-status-inactive' }
];

export function ChecklistFilters({ filters, onFiltersChange }: ChecklistFiltersProps) {
  const [machineTypeOpen, setMachineTypeOpen] = useState(false);

  // Get all machine types from all groups
  const allMachineTypes = Object.values(MACHINE_TYPES).flat();

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleMachineType = (type: string) => {
    const current = filters.machineTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    updateFilter('machineTypes', updated);
  };

  const toggleCycle = (cycle: string) => {
    const current = filters.cycle;
    const updated = current.includes(cycle)
      ? current.filter(c => c !== cycle)
      : [...current, cycle];
    updateFilter('cycle', updated);
  };

  const toggleStatus = (status: string) => {
    const current = filters.status;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateFilter('status', updated);
  };

  const removeFilter = (type: 'machineTypes' | 'cycle' | 'status', value: string) => {
    updateFilter(type, filters[type].filter(v => v !== value));
  };

  const clearAllFilters = () => {
    onFiltersChange({ machineTypes: [], cycle: [], status: [] });
  };

  const hasActiveFilters = filters.machineTypes.length > 0 || filters.cycle.length > 0 || filters.status.length > 0;

  const getFilterLabel = (type: 'machineTypes' | 'cycle' | 'status', value: string) => {
    if (type === 'cycle') return CYCLE_LABELS[value as keyof typeof CYCLE_LABELS];
    if (type === 'status') return CHECKLIST_STATUS_LABELS[value as keyof typeof CHECKLIST_STATUS_LABELS];
    return value;
  };

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Machine Type - Searchable Multi-select */}
        <Popover open={machineTypeOpen} onOpenChange={setMachineTypeOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-9 border-border bg-secondary/50 hover:bg-secondary",
                filters.machineTypes.length > 0 && "border-primary/50 bg-primary/10"
              )}
            >
              Loại máy
              {filters.machineTypes.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-primary/20 text-primary">
                  {filters.machineTypes.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 bg-popover border-border" align="start">
            <Command className="bg-transparent">
              <CommandInput placeholder="Tìm loại máy..." className="border-none" />
              <CommandList>
                <CommandEmpty>Không tìm thấy</CommandEmpty>
                {Object.entries(MACHINE_TYPES).map(([groupId, types]) => (
                  <CommandGroup 
                    key={groupId} 
                    heading={EQUIPMENT_GROUPS[groupId as keyof typeof EQUIPMENT_GROUPS]?.name}
                    className="text-muted-foreground"
                  >
                    {types.map(type => (
                      <CommandItem
                        key={type}
                        onSelect={() => toggleMachineType(type)}
                        className="cursor-pointer"
                      >
                        <div className={cn(
                          "mr-2 h-4 w-4 rounded border border-muted-foreground flex items-center justify-center",
                          filters.machineTypes.includes(type) && "bg-primary border-primary"
                        )}>
                          {filters.machineTypes.includes(type) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        {type}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Cycle - Segmented Buttons */}
        <div className="flex items-center rounded-lg bg-secondary/50 p-0.5">
          {CYCLE_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => toggleCycle(option.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                filters.cycle.includes(option.id)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Status - Colored Chips */}
        <div className="flex items-center gap-1">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => toggleStatus(option.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all border",
                filters.status.includes(option.id)
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:border-muted-foreground"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", option.color)} />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Đang lọc:</span>
          
          {filters.machineTypes.map(type => (
            <Badge 
              key={type} 
              variant="secondary" 
              className="bg-secondary text-foreground gap-1 pl-2 pr-1 py-0.5"
            >
              {type}
              <button 
                onClick={() => removeFilter('machineTypes', type)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.cycle.map(c => (
            <Badge 
              key={c} 
              variant="secondary" 
              className="bg-primary/20 text-primary gap-1 pl-2 pr-1 py-0.5"
            >
              {getFilterLabel('cycle', c)}
              <button 
                onClick={() => removeFilter('cycle', c)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.status.map(s => (
            <Badge 
              key={s} 
              variant="secondary" 
              className="bg-secondary text-foreground gap-1 pl-2 pr-1 py-0.5"
            >
              {getFilterLabel('status', s)}
              <button 
                onClick={() => removeFilter('status', s)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Xóa tất cả
          </Button>
        </div>
      )}
    </div>
  );
}
