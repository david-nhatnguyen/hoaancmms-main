import { X, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterState {
  factory: string[];
  equipmentGroup: string[];
  machineType: string[];
  status: string[];
  severity: string[];
}

interface CorrectiveMaintenanceFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FACTORIES = [
  { id: 'factory-hcm', name: 'Nhà máy HCM' },
  { id: 'factory-hn', name: 'Nhà máy Hà Nội' },
];

const EQUIPMENT_GROUPS = [
  { id: 'injection', name: 'Máy ép nhựa' },
  { id: 'mold-manufacturing', name: 'Máy gia công khuôn & Đo lường' },
];

const MACHINE_TYPES = [
  { id: 'hydraulic-280t', name: 'Hydraulic 280T' },
  { id: 'hydraulic-350t', name: 'Hydraulic 350T' },
  { id: 'cnc-5axis', name: 'CNC 5-axis' },
  { id: 'wire-edm', name: 'Wire EDM' },
  { id: 'bridge-cmm', name: 'Bridge CMM' },
];

const STATUSES = [
  { id: 'new', name: 'Mới', color: 'bg-muted' },
  { id: 'in-progress', name: 'Đang xử lý', color: 'bg-status-maintenance' },
  { id: 'completed', name: 'Hoàn thành', color: 'bg-status-active' },
  { id: 'closed', name: 'Đã đóng', color: 'bg-primary' },
];

const SEVERITIES = [
  { id: 'low', name: 'Nhẹ', color: 'bg-status-active' },
  { id: 'medium', name: 'Trung bình', color: 'bg-status-maintenance' },
  { id: 'high', name: 'Nặng', color: 'bg-destructive' },
];

export function CorrectiveMaintenanceFilters({ filters, onFiltersChange }: CorrectiveMaintenanceFiltersProps) {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (value === 'all') {
      onFiltersChange({ ...filters, [key]: [] });
    } else {
      onFiltersChange({ ...filters, [key]: [value] });
    }
  };

  const removeFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: filters[key].filter(v => v !== value)
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      factory: [],
      equipmentGroup: [],
      machineType: [],
      status: [],
      severity: []
    });
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  const getFilterLabel = (key: keyof FilterState, value: string): string => {
    switch (key) {
      case 'factory':
        return FACTORIES.find(f => f.id === value)?.name || value;
      case 'equipmentGroup':
        return EQUIPMENT_GROUPS.find(g => g.id === value)?.name || value;
      case 'machineType':
        return MACHINE_TYPES.find(t => t.id === value)?.name || value;
      case 'status':
        return STATUSES.find(s => s.id === value)?.name || value;
      case 'severity':
        return SEVERITIES.find(s => s.id === value)?.name || value;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-3">
      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm">Lọc:</span>
        </div>

        <Select
          value={filters.factory[0] || 'all'}
          onValueChange={(v) => handleFilterChange('factory', v)}
        >
          <SelectTrigger className="w-[150px] h-9 bg-secondary/50 border-border/50">
            <SelectValue placeholder="Nhà máy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhà máy</SelectItem>
            {FACTORIES.map(f => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.equipmentGroup[0] || 'all'}
          onValueChange={(v) => handleFilterChange('equipmentGroup', v)}
        >
          <SelectTrigger className="w-[220px] h-9 bg-secondary/50 border-border/50">
            <SelectValue placeholder="Nhóm thiết bị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nhóm</SelectItem>
            {EQUIPMENT_GROUPS.map(g => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.severity[0] || 'all'}
          onValueChange={(v) => handleFilterChange('severity', v)}
        >
          <SelectTrigger className="w-[140px] h-9 bg-secondary/50 border-border/50">
            <SelectValue placeholder="Mức độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả mức độ</SelectItem>
            {SEVERITIES.map(s => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  {s.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status[0] || 'all'}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className="w-[150px] h-9 bg-secondary/50 border-border/50">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {STATUSES.map(s => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  {s.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(filters).map(([key, values]) =>
            values.map((value: string) => (
              <span
                key={`${key}-${value}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
              >
                {getFilterLabel(key as keyof FilterState, value)}
                <button
                  onClick={() => removeFilter(key as keyof FilterState, value)}
                  className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                  title="Xóa lọc"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}
