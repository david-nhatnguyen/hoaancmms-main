import { useState } from 'react';
import { X, ChevronDown, Check, Calendar } from 'lucide-react';
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
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { PM_STATUS_LABELS, MONTHS } from '@/data/pmPlanData';
import { factories } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FilterState {
  month: number[];
  year: number[];
  factory: string[];
  status: string[];
}

interface PMPlanFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1].map(y => ({ value: y, label: y.toString() }));

const STATUS_OPTIONS = [
  { id: 'active', label: 'Áp dụng', color: 'bg-status-active' },
  { id: 'draft', label: 'Nháp', color: 'bg-muted-foreground' },
  { id: 'locked', label: 'Đã khóa', color: 'bg-status-maintenance' }
];

export function PMPlanFilters({ filters, onFiltersChange }: PMPlanFiltersProps) {
  const [monthOpen, setMonthOpen] = useState(false);
  const [factoryOpen, setFactoryOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleMonth = (month: number) => {
    const current = filters.month;
    const updated = current.includes(month)
      ? current.filter(m => m !== month)
      : [...current, month];
    updateFilter('month', updated);
  };

  const toggleYear = (year: number) => {
    const current = filters.year;
    const updated = current.includes(year)
      ? current.filter(y => y !== year)
      : [...current, year];
    updateFilter('year', updated);
  };

  const toggleFactory = (factoryId: string) => {
    const current = filters.factory;
    const updated = current.includes(factoryId)
      ? current.filter(f => f !== factoryId)
      : [...current, factoryId];
    updateFilter('factory', updated);
  };

  const toggleStatus = (status: string) => {
    const current = filters.status;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateFilter('status', updated);
  };

  const removeFilter = (type: keyof FilterState, value: string | number) => {
    updateFilter(type, (filters[type] as (string | number)[]).filter(v => v !== value) as FilterState[typeof type]);
  };

  const clearAllFilters = () => {
    onFiltersChange({ month: [], year: [], factory: [], status: [] });
  };

  const hasActiveFilters = filters.month.length > 0 || filters.year.length > 0 || filters.factory.length > 0 || filters.status.length > 0;

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Month Selector */}
        <Popover open={monthOpen} onOpenChange={setMonthOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-9 border-border bg-secondary/50 hover:bg-secondary",
                filters.month.length > 0 && "border-primary/50 bg-primary/10"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Tháng
              {filters.month.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-primary/20 text-primary">
                  {filters.month.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-popover border-border" align="start">
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map(m => (
                <button
                  key={m.value}
                  onClick={() => toggleMonth(m.value)}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded-md transition-all",
                    filters.month.includes(m.value)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  T{m.value}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Year - Segmented Buttons */}
        <div className="flex items-center rounded-lg bg-secondary/50 p-0.5">
          {YEARS.map(y => (
            <button
              key={y.value}
              onClick={() => toggleYear(y.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                filters.year.includes(y.value)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {y.label}
            </button>
          ))}
        </div>

        {/* Factory Selector */}
        <Popover open={factoryOpen} onOpenChange={setFactoryOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-9 border-border bg-secondary/50 hover:bg-secondary",
                filters.factory.length > 0 && "border-primary/50 bg-primary/10"
              )}
            >
              Nhà máy
              {filters.factory.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-primary/20 text-primary">
                  {filters.factory.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0 bg-popover border-border" align="start">
            <Command className="bg-transparent">
              <CommandList>
                <CommandEmpty>Không tìm thấy</CommandEmpty>
                <CommandGroup>
                  {factories.map(f => (
                    <CommandItem
                      key={f.id}
                      onSelect={() => toggleFactory(f.id)}
                      className="cursor-pointer"
                    >
                      <div className={cn(
                        "mr-2 h-4 w-4 rounded border border-muted-foreground flex items-center justify-center",
                        filters.factory.includes(f.id) && "bg-primary border-primary"
                      )}>
                        {filters.factory.includes(f.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      {f.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
          
          {filters.month.map(m => (
            <Badge 
              key={`month-${m}`} 
              variant="secondary" 
              className="bg-primary/20 text-primary gap-1 pl-2 pr-1 py-0.5"
            >
              Tháng {m}
              <button 
                onClick={() => removeFilter('month', m)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.year.map(y => (
            <Badge 
              key={`year-${y}`} 
              variant="secondary" 
              className="bg-secondary text-foreground gap-1 pl-2 pr-1 py-0.5"
            >
              {y}
              <button 
                onClick={() => removeFilter('year', y)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.factory.map(fId => {
            const factory = factories.find(f => f.id === fId);
            return (
              <Badge 
                key={fId} 
                variant="secondary" 
                className="bg-secondary text-foreground gap-1 pl-2 pr-1 py-0.5"
              >
                {factory?.name}
                <button 
                  onClick={() => removeFilter('factory', fId)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {filters.status.map(s => (
            <Badge 
              key={s} 
              variant="secondary" 
              className="bg-secondary text-foreground gap-1 pl-2 pr-1 py-0.5"
            >
              {PM_STATUS_LABELS[s as keyof typeof PM_STATUS_LABELS]}
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
