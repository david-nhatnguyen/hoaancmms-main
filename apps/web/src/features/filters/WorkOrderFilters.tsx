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
import { WO_STATUS_LABELS } from '@/data/workOrderData';
import { factories, EQUIPMENT_GROUPS } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface FilterState {
  factory: string[];
  equipmentGroup: string[];
  status: string[];
  dateRange: string;
}

interface WorkOrderFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const STATUS_OPTIONS = [
  { id: 'new', label: 'Mới', color: 'bg-muted-foreground' },
  { id: 'in-progress', label: 'Đang làm', color: 'bg-status-maintenance' },
  { id: 'completed', label: 'Hoàn thành', color: 'bg-status-active' }
];

const DATE_OPTIONS = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: 'Tuần này' },
  { id: 'month', label: 'Tháng này' },
  { id: 'all', label: 'Tất cả' }
];

export function WorkOrderFilters({ filters, onFiltersChange }: WorkOrderFiltersProps) {
  const [factoryOpen, setFactoryOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleFactory = (factoryId: string) => {
    const current = filters.factory;
    const updated = current.includes(factoryId)
      ? current.filter(f => f !== factoryId)
      : [...current, factoryId];
    updateFilter('factory', updated);
  };

  const toggleGroup = (groupId: string) => {
    const current = filters.equipmentGroup;
    const updated = current.includes(groupId)
      ? current.filter(g => g !== groupId)
      : [...current, groupId];
    updateFilter('equipmentGroup', updated);
  };

  const toggleStatus = (status: string) => {
    const current = filters.status;
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    updateFilter('status', updated);
  };

  const removeFilter = (type: keyof FilterState, value: string) => {
    if (type === 'dateRange') {
      updateFilter('dateRange', 'all');
    } else {
      updateFilter(type, (filters[type] as string[]).filter(v => v !== value));
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({ factory: [], equipmentGroup: [], status: [], dateRange: 'all' });
  };

  const hasActiveFilters = filters.factory.length > 0 || filters.equipmentGroup.length > 0 || filters.status.length > 0 || filters.dateRange !== 'all';

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range - Segmented */}
        <div className="flex items-center rounded-lg bg-secondary/50 p-0.5">
          {DATE_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => updateFilter('dateRange', option.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                filters.dateRange === option.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
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

        {/* Equipment Group Selector */}
        <Popover open={groupOpen} onOpenChange={setGroupOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "h-9 border-border bg-secondary/50 hover:bg-secondary",
                filters.equipmentGroup.length > 0 && "border-primary/50 bg-primary/10"
              )}
            >
              Nhóm TB
              {filters.equipmentGroup.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-primary/20 text-primary">
                  {filters.equipmentGroup.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0 bg-popover border-border" align="start">
            <Command className="bg-transparent">
              <CommandList>
                <CommandGroup>
                  {Object.values(EQUIPMENT_GROUPS).map(g => (
                    <CommandItem
                      key={g.id}
                      onSelect={() => toggleGroup(g.id)}
                      className="cursor-pointer"
                    >
                      <div className={cn(
                        "mr-2 h-4 w-4 rounded border border-muted-foreground flex items-center justify-center",
                        filters.equipmentGroup.includes(g.id) && "bg-primary border-primary"
                      )}>
                        {filters.equipmentGroup.includes(g.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      {g.name}
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
          
          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="bg-primary/20 text-primary gap-1 pl-2 pr-1 py-0.5">
              {DATE_OPTIONS.find(d => d.id === filters.dateRange)?.label}
              <button 
                onClick={() => removeFilter('dateRange', '')}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

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

          {filters.equipmentGroup.map(gId => {
            const group = EQUIPMENT_GROUPS[gId as keyof typeof EQUIPMENT_GROUPS];
            return (
              <Badge 
                key={gId} 
                variant="secondary" 
                className="bg-secondary text-foreground gap-1 pl-2 pr-1 py-0.5"
              >
                {group?.name}
                <button 
                  onClick={() => removeFilter('equipmentGroup', gId)}
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
              {WO_STATUS_LABELS[s as keyof typeof WO_STATUS_LABELS]}
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
