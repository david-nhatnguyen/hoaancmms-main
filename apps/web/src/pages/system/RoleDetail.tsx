import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Shield,
  Users,
  Check,
  X,
  Info
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { roles, PERMISSION_MODULES, ACTION_LABELS } from '@/data/systemData';
import { cn } from '@/lib/utils';

const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'lock'] as const;

export default function RoleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const role = roles.find(r => r.id === id);

  if (!role) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy vai trò</p>
        <Button variant="outline" onClick={() => navigate('/system/roles')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const isAdmin = role.id === 'admin';

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/system/roles')}
          className="mb-3 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              isAdmin ? "bg-destructive/20" : "bg-primary/10"
            )}>
              <Shield className={cn(
                "h-6 w-6",
                isAdmin ? "text-destructive" : "text-primary"
              )} />
            </div>
            <div>
              <h1 className="page-title">{role.name}</h1>
              <p className="text-muted-foreground">{role.description}</p>
            </div>
          </div>
          {!isAdmin && (
            <Button onClick={() => navigate(`/system/roles/${id}/edit`)} className="action-btn-primary">
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>
      </div>

      {/* Role Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Số người dùng</p>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold">{role.userCount}</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Loại vai trò</p>
          <span className={cn(
            "status-badge",
            role.isSystem
              ? "bg-primary/20 text-primary"
              : "bg-secondary text-muted-foreground"
          )}>
            {role.isSystem ? 'Vai trò hệ thống' : 'Vai trò tùy chỉnh'}
          </span>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4">
          <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
          <span className="status-badge bg-status-active/20 text-[hsl(var(--status-active))]">
            Đang hoạt động
          </span>
        </div>
      </div>

      {/* Quick Presets */}
      {!isAdmin && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Áp dụng nhanh:</span>
          <Button variant="outline" size="sm">Chế độ chỉ xem</Button>
          <Button variant="outline" size="sm">Kỹ thuật viên hiện trường</Button>
          <Button variant="outline" size="sm">Quản lý bảo trì</Button>
        </div>
      )}

      {/* Permission Matrix */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Ma trận phân quyền
          </h2>
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5" />
                    Vai trò Admin có toàn quyền
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Vai trò Quản trị hệ thống không thể chỉnh sửa quyền</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="table-header-cell w-[200px]">Module</TableHead>
              {ACTIONS.map(action => (
                <TableHead key={action} className="table-header-cell text-center w-[80px]">
                  {ACTION_LABELS[action]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {role.permissions.map((perm) => (
              <TableRow key={perm.moduleId} className="border-border/50">
                <TableCell>
                  <div>
                    <p className="font-medium">{perm.moduleName}</p>
                    <p className="text-xs text-muted-foreground">
                      {PERMISSION_MODULES.find(m => m.id === perm.moduleId)?.description}
                    </p>
                  </div>
                </TableCell>
                {ACTIONS.map(action => (
                  <TableCell key={action} className="text-center">
                    <div className="flex justify-center">
                      {perm.actions[action] ? (
                        <div className="h-6 w-6 rounded-full bg-status-active/20 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-status-active" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Users with this role */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Người dùng có vai trò này</h2>
        <div className="bg-card rounded-xl border border-border/50 p-6 text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{role.userCount} người dùng</p>
          <Button variant="link" onClick={() => navigate(`/system/users?role=${role.id}`)} className="mt-2">
            Xem danh sách
          </Button>
        </div>
      </div>
    </div>
  );
}
