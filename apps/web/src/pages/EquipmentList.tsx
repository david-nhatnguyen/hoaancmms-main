import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Pencil, 
  Eye, 
  FileSpreadsheet, 
  Download, 
  Search,
  Cpu,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronDown,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityIndicator } from '@/components/shared/PriorityIndicator';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { MobileStatsGrid } from '@/components/shared/MobileStatsGrid';
import { ResponsiveTable, Column } from '@/components/shared/ResponsiveTable';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { 
  equipments as initialEquipments, 
  factories, 
  EQUIPMENT_GROUPS,
  Equipment
} from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Filters {
  factory: string[];
  group: string[];
  status: string[];
  priority: string[];
}

// Filter options
const STATUS_OPTIONS = [
  { value: 'active', label: 'Hoạt động', color: 'bg-status-active' },
  { value: 'maintenance', label: 'Bảo trì', color: 'bg-status-maintenance' },
  { value: 'inactive', label: 'Ngừng hoạt động', color: 'bg-status-inactive' }
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'Cao', color: 'bg-destructive' },
  { value: 'medium', label: 'Trung bình', color: 'bg-status-maintenance' },
  { value: 'low', label: 'Thấp', color: 'bg-muted-foreground' }
];

// Multi-select dropdown component
interface MultiSelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
  icon?: React.ReactNode;
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  searchable = false,
  icon
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
          {icon}
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

// Chip filter component
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

export default function EquipmentList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const preselectedFactory = searchParams.get('factory');

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    factory: preselectedFactory ? [preselectedFactory] : [],
    group: [],
    status: [],
    priority: []
  });

  // Filter equipments
  const filteredEquipments = useMemo(() => {
    return initialEquipments.filter(eq => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          eq.code.toLowerCase().includes(query) ||
          eq.name.toLowerCase().includes(query) ||
          eq.manufacturer.toLowerCase().includes(query) ||
          eq.model.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.factory.length && !filters.factory.includes(eq.factoryId)) return false;
      if (filters.group.length && !filters.group.includes(eq.groupId)) return false;
      if (filters.status.length && !filters.status.includes(eq.status)) return false;
      if (filters.priority.length && !filters.priority.includes(eq.priority)) return false;

      return true;
    });
  }, [searchQuery, filters]);

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const removeFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].filter(v => v !== value)
    }));
  };

  const clearFilters = () => {
    setFilters({
      factory: [],
      group: [],
      status: [],
      priority: []
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);
  const activeFiltersCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  // Get active filter labels for display
  const getActiveFilterTags = () => {
    const tags: { category: keyof Filters; value: string; label: string }[] = [];
    
    filters.factory.forEach(f => {
      const factory = factories.find(fac => fac.id === f);
      if (factory) tags.push({ category: 'factory', value: f, label: factory.name });
    });
    
    filters.group.forEach(g => {
      const group = EQUIPMENT_GROUPS[g];
      if (group) tags.push({ category: 'group', value: g, label: group.name });
    });
    
    filters.status.forEach(s => {
      const status = STATUS_OPTIONS.find(st => st.value === s);
      if (status) tags.push({ category: 'status', value: s, label: status.label });
    });
    
    filters.priority.forEach(p => {
      const priority = PRIORITY_OPTIONS.find(pr => pr.value === p);
      if (priority) tags.push({ category: 'priority', value: p, label: priority.label });
    });
    
    return tags;
  };

  const viewEquipment = (id: string) => {
    navigate(`/equipments/${id}`);
  };

  // Stats
  const activeCount = initialEquipments.filter(e => e.status === 'active').length;
  const maintenanceCount = initialEquipments.filter(e => e.status === 'maintenance').length;
  const inactiveCount = initialEquipments.filter(e => e.status === 'inactive').length;

  // Factory and Group options for dropdown
  const factoryOptions = factories.map(f => ({ value: f.id, label: f.name }));
  const groupOptions = Object.values(EQUIPMENT_GROUPS).map(g => ({ value: g.id, label: g.name }));

  const activeFilterTags = getActiveFilterTags();

  // Table columns definition
  const columns: Column<Equipment>[] = [
    {
      key: 'code',
      header: 'Mã TB',
      isPrimary: true,
      width: 'w-[100px]',
      render: (eq) => <span className="font-mono font-medium text-primary">{eq.code}</span>
    },
    {
      key: 'name',
      header: 'Tên thiết bị',
      isSecondary: true,
      render: (eq) => <span className="font-medium">{eq.name}</span>
    },
    {
      key: 'group',
      header: 'Nhóm TB',
      render: (eq) => <span className="text-sm text-muted-foreground">{EQUIPMENT_GROUPS[eq.groupId]?.name}</span>
    },
    {
      key: 'factory',
      header: 'Nhà máy',
      render: (eq) => <span className="text-sm">{eq.factoryName}</span>
    },
    {
      key: 'manufacturer',
      header: 'Hãng / Model',
      showOnMobile: false,
      render: (eq) => <span className="text-sm text-muted-foreground">{eq.manufacturer} / {eq.model}</span>
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (eq) => <StatusBadge status={eq.status} />
    },
    {
      key: 'priority',
      header: 'Mức độ',
      align: 'center',
      showOnMobile: false,
      render: (eq) => <PriorityIndicator priority={eq.priority} showLabel={false} />
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      width: 'w-[100px]',
      render: (eq) => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => viewEquipment(eq.id)}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/equipments/${eq.id}/edit`)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
      mobileRender: (eq) => (
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              viewEquipment(eq.id);
            }}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Xem
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/equipments/${eq.id}/edit`);
            }}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Sửa
          </Button>
        </div>
      )
    }
  ];

  // Stats data
  const statsData = [
    {
      label: 'Tổng số thiết bị',
      value: initialEquipments.length,
      icon: <Cpu className="h-5 w-5 text-primary" />,
      iconBgClass: 'bg-primary/20'
    },
    {
      label: 'Hoạt động tốt',
      value: activeCount,
      icon: <CheckCircle className="h-5 w-5 text-status-active" />,
      iconBgClass: 'bg-status-active/20',
      valueClass: 'text-[hsl(var(--status-active))]'
    },
    {
      label: 'Đang bảo trì',
      value: maintenanceCount,
      icon: <AlertTriangle className="h-5 w-5 text-[hsl(var(--status-maintenance))]" />,
      iconBgClass: 'bg-status-maintenance/20',
      valueClass: 'text-[hsl(var(--status-maintenance))]'
    },
    {
      label: 'Ngừng hoạt động',
      value: inactiveCount,
      icon: <Cpu className="h-5 w-5 text-status-inactive" />,
      iconBgClass: 'bg-status-inactive/20',
      valueClass: 'text-[hsl(var(--status-inactive))]'
    }
  ];

  // Desktop filter content
  const desktopFilters = (
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

        {/* Equipment Group Dropdown */}
        <MultiSelectDropdown
          label="Nhóm thiết bị"
          options={groupOptions}
          selected={filters.group}
          onToggle={(value) => toggleFilter('group', value)}
        />

        <div className="h-6 w-px bg-border/50" />

        {/* Status Chips */}
        <ChipFilter
          options={STATUS_OPTIONS}
          selected={filters.status}
          onToggle={(value) => toggleFilter('status', value)}
        />

        <div className="h-6 w-px bg-border/50" />

        {/* Priority Chips */}
        <ChipFilter
          options={PRIORITY_OPTIONS}
          selected={filters.priority}
          onToggle={(value) => toggleFilter('priority', value)}
        />
      </div>
    </div>
  );

  // Active filter tags JSX
  const filterTagsContent = activeFilterTags.map((tag, idx) => (
    <Badge 
      key={`${tag.category}-${tag.value}-${idx}`}
      variant="secondary"
      className="bg-secondary text-foreground gap-1 pl-2 pr-1 py-0.5"
    >
      {tag.label}
      <button 
        onClick={() => removeFilter(tag.category, tag.value)} 
        className="ml-1 hover:bg-muted rounded-full p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  ));

  // Mobile filter sections
  const filterSections = [
    {
      id: 'factory',
      label: 'Nhà máy',
      activeCount: filters.factory.length,
      content: (
        <div className="space-y-2">
          {factoryOptions.map(f => (
            <button
              key={f.value}
              onClick={() => toggleFilter('factory', f.value)}
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-lg text-sm",
                filters.factory.includes(f.value) 
                  ? "bg-primary/20 text-primary" 
                  : "hover:bg-secondary"
              )}
            >
              <div className={cn(
                "h-4 w-4 rounded border flex items-center justify-center",
                filters.factory.includes(f.value) ? "bg-primary border-primary" : "border-muted-foreground"
              )}>
                {filters.factory.includes(f.value) && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              {f.label}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'group',
      label: 'Nhóm thiết bị',
      activeCount: filters.group.length,
      content: (
        <div className="space-y-2">
          {groupOptions.map(g => (
            <button
              key={g.value}
              onClick={() => toggleFilter('group', g.value)}
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-lg text-sm",
                filters.group.includes(g.value) 
                  ? "bg-primary/20 text-primary" 
                  : "hover:bg-secondary"
              )}
            >
              <div className={cn(
                "h-4 w-4 rounded border flex items-center justify-center",
                filters.group.includes(g.value) ? "bg-primary border-primary" : "border-muted-foreground"
              )}>
                {filters.group.includes(g.value) && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              {g.label}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'status',
      label: 'Trạng thái',
      activeCount: filters.status.length,
      content: (
        <ChipFilter
          options={STATUS_OPTIONS}
          selected={filters.status}
          onToggle={(value) => toggleFilter('status', value)}
        />
      )
    },
    {
      id: 'priority',
      label: 'Mức độ ưu tiên',
      activeCount: filters.priority.length,
      content: (
        <ChipFilter
          options={PRIORITY_OPTIONS}
          selected={filters.priority}
          onToggle={(value) => toggleFilter('priority', value)}
        />
      )
    }
  ];

  return (
    <div className={cn(
      "animate-fade-in",
      isMobile 
        ? "px-4 py-3 max-w-full overflow-x-hidden" 
        : "p-6"
    )}>
      {/* Page Header */}
      <MobilePageHeader
        subtitle="QUẢN LÝ TÀI SẢN"
        title="Danh sách Thiết bị"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="action-btn-secondary hidden md:flex">
              <FileSpreadsheet className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="action-btn-secondary hidden md:flex">
              <Download className="h-4 w-4" />
              Xuất
            </Button>
            <Button 
              onClick={() => navigate('/equipments/new')} 
              className="action-btn-primary" 
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4" />
              {!isMobile && "Thêm thiết bị"}
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <MobileStatsGrid stats={statsData} />

      {/* Filters */}
      <MobileFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm kiếm thiết bị..."
        sections={filterSections}
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearFilters}
        activeFilterTags={filterTagsContent}
        desktopFilters={desktopFilters}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          Hiển thị <span className="font-semibold text-foreground">{filteredEquipments.length}</span> thiết bị
        </span>
      </div>

      {/* Table/Cards */}
      <ResponsiveTable
        data={filteredEquipments}
        columns={columns}
        keyExtractor={(eq) => eq.id}
        onRowClick={(eq) => viewEquipment(eq.id)}
        emptyMessage="Không tìm thấy thiết bị nào"
      />
    </div>
  );
}
