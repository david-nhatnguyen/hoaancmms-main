import { useState } from 'react';
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
  MoreHorizontal,
  Loader2,
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
import { cn } from '@/lib/utils';

// New API imports
import { useChecklistTemplates } from '@/features/checklists/hooks/useChecklistTemplates';
import { useTemplateActions } from '@/features/checklists/hooks/useTemplateActions';
import {
  ChecklistCycle,
  ChecklistStatus,
  CYCLE_LABELS,
  STATUS_LABELS,
  type ChecklistTemplate,
} from '@/features/checklists/types/checklist.types';
import { buildQueryParams } from '@/features/checklists/handlers/templateFilterHandlers';

interface FilterState {
  categories: string[];
  cycle: ChecklistCycle[];
  status: ChecklistStatus[];
}

export default function ChecklistList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    cycle: [],
    status: [],
  });

  // Build and fetch templates with current filters
  const queryParams = buildQueryParams(filters, searchQuery, 1, 100);
  const { data, isLoading, error } = useChecklistTemplates(queryParams);
  const { duplicate, deactivate } = useTemplateActions();

  // Extract templates and stats from API response
  const templates = data?.data || [];
  const activeCount = templates.filter((t) => t.status === ChecklistStatus.ACTIVE).length;
  const draftCount = templates.filter((t) => t.status === ChecklistStatus.DRAFT).length;

  const handleCopy = (template: ChecklistTemplate) => {
    duplicate.mutate(template.id);
  };

  const handleDeactivate = (template: ChecklistTemplate) => {
    deactivate.mutate(template.id);
  };

  const getStatusBadge = (status: ChecklistStatus) => {
    const styles = {
      [ChecklistStatus.DRAFT]: 'bg-muted text-muted-foreground',
      [ChecklistStatus.ACTIVE]: 'bg-status-active/20 text-[hsl(var(--status-active))]',
      [ChecklistStatus.INACTIVE]: 'bg-status-inactive/20 text-[hsl(var(--status-inactive))]',
    };
    return (
      <span className={cn('status-badge', styles[status])}>
        {STATUS_LABELS[status]}
      </span>
    );
  };

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
            <p className="text-3xl font-bold">
              {isLoading ? '-' : templates.length}
            </p>
          </div>
          <div className="stat-card-icon bg-primary/20">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Đang áp dụng</p>
            <p className="text-3xl font-bold text-[hsl(var(--status-active))]">
              {isLoading ? '-' : activeCount}
            </p>
          </div>
          <div className="stat-card-icon bg-status-active/20">
            <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-active))]" />
          </div>
        </div>
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Bản nháp</p>
            <p className="text-3xl font-bold text-muted-foreground">
              {isLoading ? '-' : draftCount}
            </p>
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
            {isLoading ? 'Đang tải...' : `${templates.length} kết quả`}
          </span>
        </div>

        {/* TODO: Add ChecklistFilters component when ready */}
        {/* <ChecklistFilters filters={filters} onFiltersChange={setFilters} /> */}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="table-header-cell w-[120px]">Mã</TableHead>
              <TableHead className="table-header-cell">Tên checklist</TableHead>
              <TableHead className="table-header-cell">Loại thiết bị</TableHead>
              <TableHead className="table-header-cell text-center">Chu kỳ</TableHead>
              <TableHead className="table-header-cell text-center">Phiên bản</TableHead>
              <TableHead className="table-header-cell text-center">Trạng thái</TableHead>
              <TableHead className="table-header-cell">Cập nhật</TableHead>
              <TableHead className="table-header-cell text-right w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <p className="text-destructive">Lỗi tải dữ liệu. Vui lòng thử lại.</p>
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  Không tìm thấy checklist nào
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow
                  key={template.id}
                  className="table-row-interactive"
                  onClick={() => navigate(`/checklists/${template.id}`)}
                >
                  <TableCell className="font-mono font-medium text-primary">
                    {template.code}
                  </TableCell>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {template.equipment?.category || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium">
                      {CYCLE_LABELS[template.cycle]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    v{template.version}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(template.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(template.updatedAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="flex items-center justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem onClick={() => navigate(`/checklists/${template.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/checklists/${template.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Sử
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Sao chép
                          </DropdownMenuItem>
                          {template.status === ChecklistStatus.ACTIVE && (
                            <DropdownMenuItem
                              onClick={() => handleDeactivate(template)}
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
