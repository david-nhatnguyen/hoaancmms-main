import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Pencil, 
  Eye, 
  Download, 
  Search,
  Calendar,
  Copy,
  Lock,
  MoreHorizontal,
  CalendarDays,
  CheckCircle2,
  FileText
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
import { PMPlanFilters } from '@/features/filters/PMPlanFilters';
import { pmPlans, PM_STATUS_LABELS, PMPlan } from '@/data/pmPlanData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FilterState {
  month: number[];
  year: number[];
  factory: string[];
  status: string[];
}

export default function PMPlanList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    month: [],
    year: [],
    factory: [],
    status: []
  });

  // Filter plans
  const filteredPlans = useMemo(() => {
    return pmPlans.filter(plan => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          plan.code.toLowerCase().includes(query) ||
          plan.name.toLowerCase().includes(query) ||
          plan.factoryName.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.month.length && !filters.month.includes(plan.month)) return false;
      if (filters.year.length && !filters.year.includes(plan.year)) return false;
      if (filters.factory.length && !filters.factory.includes(plan.factoryId)) return false;
      if (filters.status.length && !filters.status.includes(plan.status)) return false;

      return true;
    });
  }, [searchQuery, filters]);

  const handleCopy = (plan: PMPlan) => {
    toast.success(`Đã sao chép kế hoạch: ${plan.name}`);
    navigate(`/pm-plans/new?copy=${plan.id}`);
  };

  const handleLock = (plan: PMPlan) => {
    toast.success(`Đã khóa kế hoạch: ${plan.code}`);
  };

  const getStatusBadge = (status: PMPlan['status']) => {
    const styles = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-status-active/20 text-[hsl(var(--status-active))]',
      locked: 'bg-status-maintenance/20 text-[hsl(var(--status-maintenance))]'
    };
    return (
      <span className={cn('status-badge', styles[status])}>
        {PM_STATUS_LABELS[status]}
      </span>
    );
  };

  // Stats
  const activeCount = pmPlans.filter(p => p.status === 'active').length;
  const draftCount = pmPlans.filter(p => p.status === 'draft').length;
  const totalEquipment = pmPlans.reduce((acc, p) => acc + p.items.length, 0);

  return (
    <div className="p-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <p className="page-subtitle">KẾ HOẠCH BẢO DƯỠNG</p>
        <div className="flex items-center justify-between">
          <h1 className="page-title">Danh sách Kế hoạch PM</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="action-btn-secondary">
              <Copy className="h-4 w-4" />
              Sao chép tháng trước
            </Button>
            <Button variant="outline" size="sm" className="action-btn-secondary">
              <Download className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button onClick={() => navigate('/pm-plans/new')} className="action-btn-primary">
              <Plus className="h-4 w-4" />
              Tạo kế hoạch
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng kế hoạch</p>
            <p className="text-3xl font-bold">{pmPlans.length}</p>
          </div>
          <div className="stat-card-icon bg-primary/20">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Đang áp dụng</p>
            <p className="text-3xl font-bold text-[hsl(var(--status-active))]">{activeCount}</p>
          </div>
          <div className="stat-card-icon bg-status-active/20">
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-active))]" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bản nháp</p>
            <p className="text-3xl font-bold text-muted-foreground">{draftCount}</p>
          </div>
          <div className="stat-card-icon bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Thiết bị lên lịch</p>
            <p className="text-3xl font-bold text-primary">{totalEquipment}</p>
          </div>
          <div className="stat-card-icon bg-primary/20">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã, tên kế hoạch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-9 h-10"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredPlans.length} kết quả
          </span>
        </div>
        
        <PMPlanFilters 
          filters={filters} 
          onFiltersChange={setFilters} 
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="table-header-cell w-[120px]">Mã</TableHead>
              <TableHead className="table-header-cell">Tên kế hoạch</TableHead>
              <TableHead className="table-header-cell text-center">Tháng/Năm</TableHead>
              <TableHead className="table-header-cell">Nhà máy</TableHead>
              <TableHead className="table-header-cell text-center">Số thiết bị</TableHead>
              <TableHead className="table-header-cell text-center">Trạng thái</TableHead>
              <TableHead className="table-header-cell">Cập nhật</TableHead>
              <TableHead className="table-header-cell text-right w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy kế hoạch nào
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((plan) => (
                <TableRow 
                  key={plan.id} 
                  className="table-row-interactive"
                  onClick={() => navigate(`/pm-plans/${plan.id}`)}
                >
                  <TableCell className="font-mono font-medium text-primary">
                    {plan.code}
                  </TableCell>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                      T{plan.month}/{plan.year}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {plan.factoryName}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {plan.items.length}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(plan.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {plan.updatedAt}
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
                          <DropdownMenuItem onClick={() => navigate(`/pm-plans/${plan.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/pm-plans/${plan.id}/calendar`)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Xem lịch
                          </DropdownMenuItem>
                          {plan.status !== 'locked' && (
                            <DropdownMenuItem onClick={() => navigate(`/pm-plans/${plan.id}/edit`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Sửa
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleCopy(plan)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Sao chép
                          </DropdownMenuItem>
                          {plan.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleLock(plan)}
                              className="text-status-maintenance"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Khóa kế hoạch
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
      </div>
    </div>
  );
}
