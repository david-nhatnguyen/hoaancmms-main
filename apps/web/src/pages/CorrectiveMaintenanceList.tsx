import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Search,
  AlertTriangle,
  Eye,
  Wrench,
  Plus,
  Clock,
  XCircle,
  AlertCircle,
  Filter,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ResponsiveTable, Column } from '@/components/shared/ResponsiveTable';
import { MobileStatsGrid, StatItem } from '@/components/shared/MobileStatsGrid';
import { CorrectiveMaintenanceFilters } from '@/features/filters/CorrectiveMaintenanceFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  correctiveMaintenances, 
  CM_STATUS_LABELS,
  SEVERITY_LABELS,
  CorrectiveMaintenance,
  calculateDowntime
} from '@/data/correctiveMaintenanceData';
import { cn } from '@/lib/utils';

interface FilterState {
  factory: string[];
  equipmentGroup: string[];
  machineType: string[];
  status: string[];
  severity: string[];
}

// Chip filter component for mobile sheet
function ChipFilter({ 
  options, 
  selected, 
  onToggle 
}: { 
  options: { value: string; label: string; color?: string }[]; 
  selected: string[]; 
  onToggle: (value: string) => void 
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onToggle(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            selected.includes(opt.value)
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80 text-foreground"
          )}
        >
          {opt.color && (
            <span className={cn("inline-block h-2 w-2 rounded-full mr-1.5", opt.color)} />
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function CorrectiveMaintenanceList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['factory', 'severity', 'status']);
  const [filters, setFilters] = useState<FilterState>({
    factory: [],
    equipmentGroup: [],
    machineType: [],
    status: [],
    severity: []
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      factory: [],
      equipmentGroup: [],
      machineType: [],
      status: [],
      severity: []
    });
  };

  const activeFiltersCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  // Filter data
  const FACTORIES = [
    { value: 'factory-hcm', label: 'Nhà máy HCM' },
    { value: 'factory-hn', label: 'Nhà máy Hà Nội' },
  ];

  const EQUIPMENT_GROUPS = [
    { value: 'injection', label: 'Máy ép nhựa' },
    { value: 'mold-manufacturing', label: 'Gia công khuôn' },
  ];

  const SEVERITIES = [
    { value: 'low', label: 'Nhẹ', color: 'bg-status-active' },
    { value: 'medium', label: 'Trung bình', color: 'bg-status-maintenance' },
    { value: 'high', label: 'Nặng', color: 'bg-destructive' },
  ];

  const STATUSES = [
    { value: 'new', label: 'Mới', color: 'bg-muted' },
    { value: 'in-progress', label: 'Đang xử lý', color: 'bg-status-maintenance' },
    { value: 'completed', label: 'Hoàn thành', color: 'bg-status-active' },
    { value: 'closed', label: 'Đã đóng', color: 'bg-primary' },
  ];

  // Filter corrective maintenances
  const filteredCMs = useMemo(() => {
    return correctiveMaintenances.filter(cm => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          cm.code.toLowerCase().includes(query) ||
          cm.equipmentCode.toLowerCase().includes(query) ||
          cm.equipmentName.toLowerCase().includes(query) ||
          cm.description.toLowerCase().includes(query) ||
          cm.reportedBy.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.factory.length && !filters.factory.includes(cm.factoryId)) return false;
      if (filters.equipmentGroup.length) {
        const groupId = cm.equipmentGroup === 'Máy ép nhựa' ? 'injection' : 'mold-manufacturing';
        if (!filters.equipmentGroup.includes(groupId)) return false;
      }
      if (filters.status.length && !filters.status.includes(cm.status)) return false;
      if (filters.severity.length && !filters.severity.includes(cm.severity)) return false;

      return true;
    });
  }, [searchQuery, filters]);

  const getStatusBadge = (status: CorrectiveMaintenance['status']) => {
    const styles = {
      'new': 'bg-muted text-muted-foreground',
      'in-progress': 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
      'completed': 'bg-status-active/20 text-[hsl(var(--status-active))]',
      'closed': 'bg-primary/20 text-primary'
    };
    return (
      <span className={cn('status-badge', styles[status])}>
        {CM_STATUS_LABELS[status]}
      </span>
    );
  };

  const getSeverityBadge = (severity: CorrectiveMaintenance['severity']) => {
    const styles = {
      'low': 'bg-status-active/20 text-[hsl(var(--status-active))]',
      'medium': 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
      'high': 'bg-destructive/20 text-destructive'
    };
    return (
      <span className={cn('status-badge', styles[severity])}>
        {SEVERITY_LABELS[severity]}
      </span>
    );
  };

  // Stats
  const newCount = correctiveMaintenances.filter(cm => cm.status === 'new').length;
  const inProgressCount = correctiveMaintenances.filter(cm => cm.status === 'in-progress').length;
  const highSeverityCount = correctiveMaintenances.filter(cm => cm.severity === 'high' && cm.status !== 'closed').length;

  const stats: StatItem[] = [
    {
      label: 'Tổng sự cố',
      value: correctiveMaintenances.length,
      icon: <AlertTriangle className="h-4 w-4 text-primary md:h-5 md:w-5" />,
      iconBgClass: 'bg-primary/20'
    },
    {
      label: 'Mới',
      value: newCount,
      icon: <AlertCircle className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />,
      iconBgClass: 'bg-muted',
      valueClass: 'text-muted-foreground'
    },
    {
      label: 'Đang xử lý',
      value: inProgressCount,
      icon: <Clock className="h-4 w-4 text-[hsl(var(--status-maintenance))] md:h-5 md:w-5" />,
      iconBgClass: 'bg-status-maintenance/20',
      valueClass: 'text-[hsl(var(--status-maintenance))]'
    },
    {
      label: 'Sự cố nặng',
      value: highSeverityCount,
      icon: <XCircle className="h-4 w-4 text-destructive md:h-5 md:w-5" />,
      iconBgClass: 'bg-destructive/20',
      valueClass: 'text-destructive',
      cardClass: 'border-destructive/30'
    }
  ];

  // Mobile filter sections
  const filterSections = [
    {
      id: 'factory',
      label: 'Nhà máy',
      activeCount: filters.factory.length,
      content: (
        <ChipFilter
          options={FACTORIES}
          selected={filters.factory}
          onToggle={(value) => toggleFilter('factory', value)}
        />
      )
    },
    {
      id: 'equipmentGroup',
      label: 'Nhóm thiết bị',
      activeCount: filters.equipmentGroup.length,
      content: (
        <ChipFilter
          options={EQUIPMENT_GROUPS}
          selected={filters.equipmentGroup}
          onToggle={(value) => toggleFilter('equipmentGroup', value)}
        />
      )
    },
    {
      id: 'severity',
      label: 'Mức độ',
      activeCount: filters.severity.length,
      content: (
        <ChipFilter
          options={SEVERITIES}
          selected={filters.severity}
          onToggle={(value) => toggleFilter('severity', value)}
        />
      )
    },
    {
      id: 'status',
      label: 'Trạng thái',
      activeCount: filters.status.length,
      content: (
        <ChipFilter
          options={STATUSES}
          selected={filters.status}
          onToggle={(value) => toggleFilter('status', value)}
        />
      )
    }
  ];

  // Columns for ResponsiveTable
  const columns: Column<CorrectiveMaintenance>[] = [
    {
      key: 'code',
      header: 'Mã sự cố',
      mobilePriority: 'primary',
      width: 'w-[140px]',
      render: (cm) => (
        <span className="font-mono font-medium text-destructive">{cm.code}</span>
      )
    },
    {
      key: 'equipment',
      header: 'Thiết bị',
      mobilePriority: 'secondary',
      render: (cm) => (
        <div>
          <p className="font-medium">{cm.equipmentCode} - {cm.equipmentName}</p>
          <p className="text-xs text-muted-foreground">{cm.equipmentGroup}</p>
        </div>
      ),
      mobileRender: (cm) => `${cm.equipmentCode} - ${cm.equipmentName}`
    },
    {
      key: 'machineType',
      header: 'Loại máy',
      hiddenOnMobile: true,
      render: (cm) => <span className="text-sm">{cm.machineType}</span>
    },
    {
      key: 'reportedAt',
      header: 'Thời điểm',
      align: 'center',
      render: (cm) => (
        <div>
          <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium block">
            {new Date(cm.reportedAt).toLocaleDateString('vi-VN')}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5 block">
            {new Date(cm.reportedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
      mobileRender: (cm) => (
        <span className="text-xs">
          {new Date(cm.reportedAt).toLocaleDateString('vi-VN')} {new Date(cm.reportedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    },
    {
      key: 'severity',
      header: 'Mức độ',
      align: 'center',
      render: (cm) => getSeverityBadge(cm.severity)
    },
    {
      key: 'downtime',
      header: 'Downtime',
      align: 'center',
      hiddenOnMobile: true,
      render: (cm) => (
        <span className={cn(
          "text-sm font-medium",
          cm.status === 'closed' ? "text-muted-foreground" : "text-destructive"
        )}>
          {cm.status === 'closed' ? cm.totalDowntime || '-' : calculateDowntime(cm.reportedAt, cm.repairEndTime)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (cm) => getStatusBadge(cm.status)
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      width: 'w-[100px]',
      render: (cm) => (
        <div className="flex items-center justify-end" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem onClick={() => navigate(`/corrective-maintenance/${cm.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              {(cm.status === 'new' || cm.status === 'in-progress') && (
                <DropdownMenuItem onClick={() => navigate(`/corrective-maintenance/${cm.id}`)}>
                  <Wrench className="h-4 w-4 mr-2" />
                  {cm.status === 'new' ? 'Bắt đầu xử lý' : 'Tiếp tục xử lý'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      mobileRender: (cm) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-9"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/corrective-maintenance/${cm.id}`);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Chi tiết
          </Button>
          {(cm.status === 'new' || cm.status === 'in-progress') && (
            <Button 
              size="sm" 
              className="flex-1 h-9"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/corrective-maintenance/${cm.id}`);
              }}
            >
              <Wrench className="h-4 w-4 mr-1" />
              {cm.status === 'new' ? 'Xử lý' : 'Tiếp tục'}
            </Button>
          )}
        </div>
      )
    }
  ];

  // Get label for filter tag
  const getFilterLabel = (key: keyof FilterState, value: string): string => {
    const allOptions = [...FACTORIES, ...EQUIPMENT_GROUPS, ...SEVERITIES, ...STATUSES];
    return allOptions.find(opt => opt.value === value)?.label || value;
  };

  return (
    <div className={cn("animate-fade-in", isMobile ? "p-4 pb-24" : "p-6")}>
      {/* Page Header */}
      <MobilePageHeader
        subtitle="BẢO TRÌ SỰ CỐ"
        title="Danh sách Sự cố & Sửa chữa"
        actions={
          <>
            <Button 
              onClick={() => navigate('/corrective-maintenance/new')}
              className="action-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Báo hỏng thiết bị
            </Button>
            <Button variant="outline" size="sm" className="action-btn-secondary">
              <Download className="h-4 w-4" />
              Xuất Excel
            </Button>
          </>
        }
        mobileActions={
          <Button 
            size="sm"
            onClick={() => navigate('/corrective-maintenance/new')}
            className="h-9"
          >
            <Plus className="h-4 w-4 mr-1" />
            Báo hỏng
          </Button>
        }
      />

      {/* Stats */}
      <MobileStatsGrid stats={stats} className="mb-4 md:mb-6" />

      {/* Search + Filters */}
      {isMobile ? (
        <>
          {/* Mobile: Search + Filter Button */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-9 h-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                "h-10 w-10 shrink-0 relative",
                activeFiltersCount > 0 && "border-primary bg-primary/10"
              )}
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Active filter tags on mobile */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {Object.entries(filters).map(([key, values]) =>
                values.map((value: string) => (
                  <span
                    key={`${key}-${value}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium"
                  >
                    {getFilterLabel(key as keyof FilterState, value)}
                    <button
                      onClick={() => toggleFilter(key as keyof FilterState, value)}
                      className="hover:bg-primary/30 rounded-full p-0.5"
                      aria-label={`Remove filter ${value}`}
                      title={`Remove filter ${value}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-destructive font-medium px-2"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-muted-foreground mb-3">
            {filteredCMs.length} sự cố
          </div>

          {/* Filter Sheet */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
              <SheetHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg">Bộ lọc</SheetTitle>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-destructive hover:text-destructive"
                    >
                      Xóa tất cả ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </SheetHeader>

              <div className="py-4 space-y-2 overflow-y-auto max-h-[calc(80vh-8rem)]">
                {filterSections.map((section) => (
                  <Collapsible
                    key={section.id}
                    open={expandedSections.includes(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{section.label}</span>
                          {section.activeCount > 0 && (
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {section.activeCount}
                            </Badge>
                          )}
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          expandedSections.includes(section.id) && "rotate-180"
                        )} />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3 px-1">
                      {section.content}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>

              <SheetFooter className="pt-4 border-t border-border">
                <Button onClick={() => setIsFilterOpen(false)} className="w-full">
                  Áp dụng bộ lọc
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        /* Desktop filters */
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã, thiết bị, mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-9 h-10"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredCMs.length} sự cố
            </span>
          </div>
          
          <CorrectiveMaintenanceFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
        </div>
      )}

      {/* Table */}
      <ResponsiveTable
        data={filteredCMs}
        columns={columns}
        keyExtractor={(cm) => cm.id}
        onRowClick={(cm) => navigate(`/corrective-maintenance/${cm.id}`)}
        emptyMessage="Không tìm thấy sự cố nào"
      />
    </div>
  );
}
