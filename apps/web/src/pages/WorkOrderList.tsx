import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  Search,
  ClipboardCheck,
  Eye,
  Play,
  MoreHorizontal,
  Tablet,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkOrderFilters } from '@/features/filters/WorkOrderFilters';
import { WorkOrderCalendar } from '@/features/work-order/WorkOrderCalendar';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { MobileStatsGrid } from '@/components/shared/MobileStatsGrid';
import { 
  workOrders, 
  WO_STATUS_LABELS,
  WorkOrder,
  calculateProgress
} from '@/data/workOrderData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterState {
  factory: string[];
  equipmentGroup: string[];
  status: string[];
  dateRange: string;
}

export default function WorkOrderList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'tablet' | 'calendar'>(isMobile ? 'tablet' : 'list');
  const [filters, setFilters] = useState<FilterState>({
    factory: [],
    equipmentGroup: [],
    status: [],
    dateRange: 'all'
  });

  // Filter work orders
  const filteredOrders = useMemo(() => {
    return workOrders.filter(wo => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          wo.code.toLowerCase().includes(query) ||
          wo.equipmentCode.toLowerCase().includes(query) ||
          wo.equipmentName.toLowerCase().includes(query) ||
          wo.assignee.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.factory.length && !filters.factory.includes(wo.factoryId)) return false;
      if (filters.equipmentGroup.length) {
        const groupId = wo.equipmentGroup === 'Máy ép nhựa' ? 'injection' : 'mold-manufacturing';
        if (!filters.equipmentGroup.includes(groupId)) return false;
      }
      if (filters.status.length && !filters.status.includes(wo.status)) return false;

      return true;
    });
  }, [searchQuery, filters]);

  const getStatusBadge = (status: WorkOrder['status']) => {
    const styles = {
      'new': 'bg-muted text-muted-foreground',
      'in-progress': 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]',
      'completed': 'bg-status-active/20 text-[hsl(var(--status-active))]'
    };
    return (
      <span className={cn('status-badge', styles[status])}>
        {WO_STATUS_LABELS[status]}
      </span>
    );
  };

  // Stats
  const newCount = workOrders.filter(wo => wo.status === 'new').length;
  const inProgressCount = workOrders.filter(wo => wo.status === 'in-progress').length;
  const completedCount = workOrders.filter(wo => wo.status === 'completed').length;

  // Stats data for MobileStatsGrid
  const statsData = [
    {
      label: 'Tổng phiếu',
      value: workOrders.length,
      icon: <ClipboardCheck className="h-5 w-5 text-primary" />,
      iconBgClass: 'bg-primary/20'
    },
    {
      label: 'Mới',
      value: newCount,
      icon: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
      iconBgClass: 'bg-muted',
      valueClass: 'text-muted-foreground'
    },
    {
      label: 'Đang làm',
      value: inProgressCount,
      icon: <Clock className="h-5 w-5 text-[hsl(var(--status-maintenance))]" />,
      iconBgClass: 'bg-status-maintenance/20',
      valueClass: 'text-[hsl(var(--status-maintenance))]'
    },
    ...(!isMobile ? [{
      label: 'Hoàn thành',
      value: completedCount,
      icon: <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-active))]" />,
      iconBgClass: 'bg-status-active/20',
      valueClass: 'text-[hsl(var(--status-active))]'
    }] : [])
  ];

  // View mode toggle component
  const ViewModeToggle = () => (
    <div className={cn(
      "flex items-center border border-border rounded-lg p-0.5 bg-muted/50",
      isMobile && "flex-1 justify-center"
    )}>
      <Button 
        variant="ghost"
        size="sm" 
        onClick={() => setViewMode('list')}
        className={cn(
          "h-8 px-3 rounded-md",
          viewMode === 'list' && "bg-background shadow-sm"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost"
        size="sm" 
        onClick={() => setViewMode('calendar')}
        className={cn(
          "h-8 px-3 rounded-md",
          viewMode === 'calendar' && "bg-background shadow-sm"
        )}
      >
        <CalendarDays className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost"
        size="sm" 
        onClick={() => setViewMode('tablet')}
        className={cn(
          "h-8 px-3 rounded-md",
          viewMode === 'tablet' && "bg-background shadow-sm"
        )}
      >
        <Tablet className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className={cn("animate-fade-in", isMobile ? "p-4" : "p-6")}>
      {/* Page Header */}
      <MobilePageHeader
        subtitle="PHIẾU CÔNG VIỆC"
        title="Danh sách Phiếu Công việc"
        actions={
          <div className="flex items-center gap-2">
            {!isMobile && <ViewModeToggle />}
            {!isMobile && (
              <Button variant="outline" size="sm" className="action-btn-secondary">
                <Download className="h-4 w-4" />
                Xuất Excel
              </Button>
            )}
          </div>
        }
        mobileActions={<ViewModeToggle />}
      />

      {/* Stats Cards */}
      <MobileStatsGrid 
        stats={statsData} 
        columns={{ mobile: 3, tablet: 3, desktop: 4 }} 
      />

      {/* Search + Filters - Hide for calendar view */}
      {viewMode !== 'calendar' && (
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "relative flex-1",
              !isMobile && "max-w-sm"
            )}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã, thiết bị, người thực hiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-9 h-10"
              />
            </div>
            <span className={cn("text-sm text-muted-foreground", isMobile && "hidden")}>
              {filteredOrders.length} phiếu
            </span>
          </div>
          
          {!isMobile && (
            <WorkOrderFilters 
              filters={filters} 
              onFiltersChange={setFilters} 
            />
          )}
        </div>
      )}

      {/* Results count on mobile */}
      {isMobile && viewMode !== 'calendar' && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            {filteredOrders.length} phiếu công việc
          </span>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <WorkOrderCalendar workOrders={workOrders} />
      )}

      {/* Card View (Tablet/Mobile) */}
      {viewMode === 'tablet' && (
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        )}>
          {filteredOrders.map(wo => (
            <div 
              key={wo.id}
              onClick={() => navigate(`/work-orders/${wo.id}/execute`)}
              className="bg-card rounded-xl border border-border/50 p-4 cursor-pointer hover:border-primary/50 active:scale-[0.99] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-primary font-medium text-sm">{wo.code}</span>
                  <p className="font-semibold mt-1 truncate">{wo.equipmentName}</p>
                </div>
                {getStatusBadge(wo.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checklist:</span>
                  <span className="text-right truncate max-w-[60%]">{wo.checklistName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày KH:</span>
                  <span>{new Date(wo.plannedDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người TH:</span>
                  <span>{wo.assignee}</span>
                </div>
              </div>

              {wo.status === 'in-progress' && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Tiến độ</span>
                    <span className="font-medium">{calculateProgress(wo.items)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${calculateProgress(wo.items)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {wo.status === 'new' && (
                  <Button size="sm" className="flex-1 action-btn-primary">
                    <Play className="h-4 w-4" />
                    Bắt đầu
                  </Button>
                )}
                {wo.status === 'in-progress' && (
                  <Button size="sm" className="flex-1 bg-[hsl(var(--status-maintenance))] hover:bg-[hsl(var(--status-maintenance))]/90 text-white">
                    <Play className="h-4 w-4" />
                    Tiếp tục
                  </Button>
                )}
                {wo.status === 'completed' && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-4 w-4" />
                    Xem
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {viewMode === 'list' && (
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          {isMobile ? (
            // Mobile list view - simplified cards
            <div className="divide-y divide-border/50">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Không tìm thấy phiếu công việc nào
                </div>
              ) : (
                filteredOrders.map(wo => (
                  <div 
                    key={wo.id}
                    onClick={() => navigate(`/work-orders/${wo.id}`)}
                    className="p-4 active:bg-table-row-hover cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary font-medium text-sm">{wo.code}</span>
                          {getStatusBadge(wo.status)}
                        </div>
                        <p className="font-medium mt-1 truncate">{wo.equipmentName}</p>
                        <p className="text-sm text-muted-foreground truncate">{wo.checklistName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm">{new Date(wo.plannedDate).toLocaleDateString('vi-VN')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{wo.assignee}</p>
                      </div>
                    </div>
                    {wo.status !== 'new' && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              wo.status === 'completed' ? "bg-status-active" : "bg-primary"
                            )}
                            style={{ width: `${calculateProgress(wo.items)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          {calculateProgress(wo.items)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            // Desktop table
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="table-header-cell w-[140px]">Mã</TableHead>
                  <TableHead className="table-header-cell">Thiết bị</TableHead>
                  <TableHead className="table-header-cell">Checklist</TableHead>
                  <TableHead className="table-header-cell text-center">Ngày KH</TableHead>
                  <TableHead className="table-header-cell">Người TH</TableHead>
                  <TableHead className="table-header-cell text-center">Tiến độ</TableHead>
                  <TableHead className="table-header-cell text-center">Trạng thái</TableHead>
                  <TableHead className="table-header-cell text-right w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      Không tìm thấy phiếu công việc nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((wo) => (
                    <TableRow 
                      key={wo.id} 
                      className="table-row-interactive"
                      onClick={() => navigate(`/work-orders/${wo.id}`)}
                    >
                      <TableCell className="font-mono font-medium text-primary">
                        {wo.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wo.equipmentCode} - {wo.equipmentName}</p>
                          <p className="text-xs text-muted-foreground">{wo.equipmentGroup}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {wo.checklistName}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                          {new Date(wo.plannedDate).toLocaleDateString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {wo.assignee}
                      </TableCell>
                      <TableCell className="text-center">
                        {wo.status !== 'new' ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  wo.status === 'completed' ? "bg-status-active" : "bg-primary"
                                )}
                                style={{ width: `${calculateProgress(wo.items)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium w-8">
                              {calculateProgress(wo.items)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(wo.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end" onClick={e => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem onClick={() => navigate(`/work-orders/${wo.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {wo.status !== 'completed' && (
                                <DropdownMenuItem onClick={() => navigate(`/work-orders/${wo.id}/execute`)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  {wo.status === 'new' ? 'Bắt đầu' : 'Tiếp tục'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
