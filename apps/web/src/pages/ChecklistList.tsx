import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Pencil, 
  Eye, 
  FileSpreadsheet, 
  Download, 
  Search,
  ClipboardList,
  Copy,
  Ban,
  CheckCircle2,
  MoreHorizontal
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
import { ChecklistFilters } from '@/features/filters/ChecklistFilters';
import { 
  checklistTemplates, 
  CYCLE_LABELS, 
  CHECKLIST_STATUS_LABELS,
  ChecklistTemplate 
} from '@/data/checklistData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FilterState {
  machineTypes: string[];
  cycle: string[];
  status: string[];
}

export default function ChecklistList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    machineTypes: [],
    cycle: [],
    status: []
  });

  // Filter checklists
  const filteredChecklists = useMemo(() => {
    return checklistTemplates.filter(cl => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          cl.code.toLowerCase().includes(query) ||
          cl.name.toLowerCase().includes(query) ||
          cl.machineType.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.machineTypes.length && !filters.machineTypes.includes(cl.machineType)) return false;
      if (filters.cycle.length && !filters.cycle.includes(cl.cycle)) return false;
      if (filters.status.length && !filters.status.includes(cl.status)) return false;

      return true;
    });
  }, [searchQuery, filters]);

  const handleCopy = (checklist: ChecklistTemplate) => {
    toast.success(`Đã sao chép checklist: ${checklist.name}`);
    navigate(`/checklists/new?copy=${checklist.id}`);
  };

  const handleDeactivate = (checklist: ChecklistTemplate) => {
    toast.success(`Đã ngừng sử dụng checklist: ${checklist.code}`);
  };

  const getStatusBadge = (status: ChecklistTemplate['status']) => {
    const styles = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-status-active/20 text-[hsl(var(--status-active))]',
      inactive: 'bg-status-inactive/20 text-[hsl(var(--status-inactive))]'
    };
    return (
      <span className={cn('status-badge', styles[status])}>
        {CHECKLIST_STATUS_LABELS[status]}
      </span>
    );
  };

  // Stats
  const activeCount = checklistTemplates.filter(c => c.status === 'active').length;
  const draftCount = checklistTemplates.filter(c => c.status === 'draft').length;

  return (
    <div className="p-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <p className="page-subtitle">THƯ VIỆN CHECKLIST</p>
        <div className="flex items-center justify-between">
          <h1 className="page-title">Danh sách Checklist Bảo dưỡng</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="action-btn-secondary">
              <FileSpreadsheet className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="action-btn-secondary">
              <Download className="h-4 w-4" />
              Xuất
            </Button>
            <Button onClick={() => navigate('/checklists/new')} className="action-btn-primary">
              <Plus className="h-4 w-4" />
              Tạo checklist
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng số checklist</p>
            <p className="text-3xl font-bold">{checklistTemplates.length}</p>
          </div>
          <div className="stat-card-icon bg-primary/20">
            <ClipboardList className="h-5 w-5 text-primary" />
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
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã, tên checklist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input pl-9 h-10"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredChecklists.length} kết quả
          </span>
        </div>
        
        {/* New Filter Bar */}
        <ChecklistFilters 
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
              <TableHead className="table-header-cell">Tên checklist</TableHead>
              <TableHead className="table-header-cell">Loại máy</TableHead>
              <TableHead className="table-header-cell text-center">Chu kỳ</TableHead>
              <TableHead className="table-header-cell text-center">Phiên bản</TableHead>
              <TableHead className="table-header-cell text-center">Trạng thái</TableHead>
              <TableHead className="table-header-cell">Cập nhật</TableHead>
              <TableHead className="table-header-cell text-right w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChecklists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy checklist nào
                </TableCell>
              </TableRow>
            ) : (
              filteredChecklists.map((checklist) => (
                <TableRow 
                  key={checklist.id} 
                  className="table-row-interactive"
                  onClick={() => navigate(`/checklists/${checklist.id}`)}
                >
                  <TableCell className="font-mono font-medium text-primary">
                    {checklist.code}
                  </TableCell>
                  <TableCell className="font-medium">{checklist.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {checklist.machineType}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                      {CYCLE_LABELS[checklist.cycle]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    v{checklist.version}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(checklist.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {checklist.updatedAt}
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
                          <DropdownMenuItem onClick={() => navigate(`/checklists/${checklist.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/checklists/${checklist.id}/edit`)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(checklist)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Sao chép
                          </DropdownMenuItem>
                          {checklist.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleDeactivate(checklist)}
                              className="text-destructive"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ngừng sử dụng
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
