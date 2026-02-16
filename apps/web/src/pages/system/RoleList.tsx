import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Eye,
  Pencil,
  Copy,
  Shield,
  Users,
  ShieldCheck,
  ShieldAlert,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { roles } from '@/data/systemData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Mobile role card component
function RoleCard({
  role,
  onView,
  onEdit,
  onCopy
}: {
  role: typeof roles[0];
  onView: () => void;
  onEdit: () => void;
  onCopy: () => void;
}) {
  return (
    <div
      className="bg-card rounded-xl border border-border/50 p-3"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            role.id === 'admin' ? "bg-destructive/20" : "bg-primary/10"
          )}>
            <Shield className={cn(
              "h-4 w-4",
              role.id === 'admin' ? "text-destructive" : "text-primary"
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{role.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{role.description}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }} className="gap-2">
              <Eye className="h-3.5 w-3.5" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="gap-2"
              disabled={role.id === 'admin'}
            >
              <Pencil className="h-3.5 w-3.5" />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(); }} className="gap-2">
              <Copy className="h-3.5 w-3.5" />
              Sao chép
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-md">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-medium">{role.userCount}</span>
        </div>
        <span className={cn(
          "status-badge text-[10px]",
          role.isSystem
            ? "bg-primary/20 text-primary"
            : "bg-secondary text-muted-foreground"
        )}>
          {role.isSystem ? 'Hệ thống' : 'Tùy chỉnh'}
        </span>
      </div>
    </div>
  );
}

export default function RoleList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const systemRoles = roles.filter(r => r.isSystem);
  const customRoles = roles.filter(r => !r.isSystem);

  return (
    <div className={cn(
      "animate-fade-in max-w-full overflow-x-hidden",
      isMobile ? "px-4 py-3" : "p-6"
    )}>
      {/* Page Header */}
      <div className="mb-4">
        {!isMobile && <p className="page-subtitle">HỆ THỐNG</p>}
        <div className={cn(
          "flex items-center justify-between gap-2",
          isMobile && "flex-wrap"
        )}>
          <h1 className={cn(
            "font-bold",
            isMobile ? "text-base" : "page-title"
          )}>Vai trò & Phân quyền</h1>
          <div className={cn(
            "flex items-center gap-2",
            isMobile && "w-full mt-2"
          )}>
            {!isMobile && (
              <Button variant="outline" size="sm" className="action-btn-secondary">
                <Copy className="h-4 w-4" />
                Sao chép từ vai trò mẫu
              </Button>
            )}
            <Button
              onClick={() => navigate('/system/roles/new')}
              className={cn(
                "action-btn-primary",
                isMobile && "flex-1 h-9"
              )}
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4" />
              <span className={isMobile ? "text-xs" : ""}>Tạo vai trò mới</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={cn(
        "grid gap-3 mb-4",
        isMobile ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      )}>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Tổng</p>
            <p className={cn("font-bold", isMobile ? "text-xl" : "text-3xl")}>{roles.length}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Hệ thống</p>
            <p className={cn("font-bold text-[hsl(var(--status-active))]", isMobile ? "text-xl" : "text-3xl")}>{systemRoles.length}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-status-active/20">
              <ShieldCheck className="h-5 w-5 text-status-active" />
            </div>
          )}
        </div>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Tùy chỉnh</p>
            <p className={cn("font-bold text-[hsl(var(--status-maintenance))]", isMobile ? "text-xl" : "text-3xl")}>{customRoles.length}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-status-maintenance/20">
              <ShieldAlert className="h-5 w-5 text-status-maintenance" />
            </div>
          )}
        </div>
      </div>

      {/* Table / Cards */}
      {isMobile ? (
        <div className="space-y-2">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onView={() => navigate(`/system/roles/${role.id}`)}
              onEdit={() => navigate(`/system/roles/${role.id}/edit`)}
              onCopy={() => { }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="table-header-cell">Tên vai trò</TableHead>
                <TableHead className="table-header-cell">Mô tả</TableHead>
                <TableHead className="table-header-cell text-center">Số người dùng</TableHead>
                <TableHead className="table-header-cell text-center">Loại</TableHead>
                <TableHead className="table-header-cell text-right w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow
                  key={role.id}
                  className="table-row-interactive"
                  onClick={() => navigate(`/system/roles/${role.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        role.id === 'admin' ? "bg-destructive/20" : "bg-primary/10"
                      )}>
                        <Shield className={cn(
                          "h-4 w-4",
                          role.id === 'admin' ? "text-destructive" : "text-primary"
                        )} />
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {role.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-md">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{role.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "status-badge",
                      role.isSystem
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}>
                      {role.isSystem ? 'Hệ thống' : 'Tùy chỉnh'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/system/roles/${role.id}`)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/system/roles/${role.id}/edit`)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Sửa"
                        disabled={role.id === 'admin'}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Sao chép"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Permission Matrix Preview */}
      {!isMobile && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Ma trận phân quyền tổng quan</h2>
          <div className="bg-card rounded-xl border border-border/50 p-4 text-center text-muted-foreground">
            <p>Chọn một vai trò để xem chi tiết ma trận phân quyền</p>
          </div>
        </div>
      )}
    </div>
  );
}
