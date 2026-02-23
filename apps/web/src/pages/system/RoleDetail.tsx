import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Shield,
  Users,
  Check,
  X,
  Info,
  Search,
  UserPlus,
  Mail,
  Copy,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  useRole,
  useRoleModules,
  useRoleUsers,
  useAssignUserRole,
  useUserSearch,
} from '@/features/roles';

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'lock'] as const;
type Action = typeof ACTIONS[number];

const ACTION_LABELS: Record<Action, string> = {
  view: 'Xem',
  create: 'Tạo',
  edit: 'Sửa',
  delete: 'Xóa',
  export: 'Xuất',
  approve: 'Duyệt',
  lock: 'Khóa',
};

const ACTION_COLORS: Record<Action, string> = {
  view: 'bg-blue-500/20 text-blue-400',
  create: 'bg-emerald-500/20 text-emerald-400',
  edit: 'bg-amber-500/20 text-amber-400',
  delete: 'bg-red-500/20 text-red-400',
  export: 'bg-purple-500/20 text-purple-400',
  approve: 'bg-cyan-500/20 text-cyan-400',
  lock: 'bg-orange-500/20 text-orange-400',
};

// Map API field names → Action keys for reading
const API_KEY_TO_ACTION: Record<string, Action> = {
  canView: 'view',
  canCreate: 'create',
  canEdit: 'edit',
  canDelete: 'delete',
  canExport: 'export',
  canApprove: 'approve',
  canLock: 'lock',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the enabled actions from a permission object */
function getEnabledActions(perm: Record<string, boolean>): Action[] {
  return (Object.entries(perm) as [string, boolean][])
    .filter(([key, val]) => val && key in API_KEY_TO_ACTION)
    .map(([key]) => API_KEY_TO_ACTION[key]);
}

/** Check if a specific action is enabled for a permission */
function isActionEnabled(perm: Record<string, boolean>, action: Action): boolean {
  const apiKey = `can${action.charAt(0).toUpperCase() + action.slice(1)}`;
  return perm[apiKey] === true;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function RoleDetailSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-muted rounded" />
      <div className="h-20 w-full bg-muted rounded" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (<div key={i} className="h-20 bg-muted rounded" />))}
      </div>
      <div className="h-64 w-full bg-muted rounded" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [userSearch, setUserSearch] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [searchForAssign, setSearchForAssign] = useState('');

  // ── Data fetching ────────────────────────────────────────────────
  const { data: role, isLoading: isLoadingRole } = useRole(id);
  const { data: modules = [] } = useRoleModules();
  const { data: roleUsers = [], isLoading: isLoadingUsers } = useRoleUsers(id);
  const { data: searchResults = [], isLoading: isSearching } = useUserSearch(searchForAssign);

  // ── Mutations ────────────────────────────────────────────────────
  const assignUser = useAssignUserRole(id ?? '');

  // ── Loading / not-found states ───────────────────────────────────
  if (isLoadingRole) {
    return <RoleDetailSkeleton />;
  }

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

  // ── Derived values ───────────────────────────────────────────────
  const isAdmin = role.isSystem;

  const filteredUsers = roleUsers.filter(
    (u) =>
      !userSearch ||
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(userSearch.toLowerCase()),
  );

  // Users NOT in this role — from search results
  const unassignedUsers = searchResults.filter(
    (u: any) => u.roleId !== id,
  );

  const totalEnabledPermissions = role.permissions.reduce(
    (sum, p) => sum + getEnabledActions(p as any).length,
    0,
  );

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-full overflow-x-hidden',
        isMobile ? 'px-4 py-3' : 'p-6',
      )}
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/system/roles')}
          className="-ml-2 mb-3 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Quay lại
        </Button>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl', isAdmin ? 'bg-destructive/20' : 'bg-primary/10')}>
              <Shield className={cn('h-6 w-6', isAdmin ? 'text-destructive' : 'text-primary')} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">VAI TRÒ</p>
              <h1 className={cn('font-bold', isMobile ? 'text-lg' : 'page-title')}>{role.name}</h1>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="action-btn-secondary"
              onClick={() => {
                toast.success('Đã sao chép vai trò');
                navigate('/system/roles/new');
              }}
            >
              <Copy className="h-4 w-4" />
              Sao chép
            </Button>
            {!isAdmin && (
              <Button
                onClick={() => navigate(`/system/roles/${id}/edit`)}
                className="action-btn-primary"
                size="sm"
              >
                <Pencil className="h-4 w-4" />
                Chỉnh sửa quyền
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className={cn('grid gap-3 mb-6', isMobile ? 'grid-cols-3' : 'grid-cols-3')}>
        <div className={cn('stat-card flex items-center justify-between', isMobile && 'p-2.5')}>
          <div>
            <p className={cn('text-muted-foreground mb-0.5', isMobile ? 'text-[10px]' : 'text-sm mb-1')}>
              Người dùng
            </p>
            <p className={cn('font-bold', isMobile ? 'text-xl' : 'text-3xl')}>{role.userCount}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        <div className={cn('stat-card flex items-center justify-between', isMobile && 'p-2.5')}>
          <div>
            <p className={cn('text-muted-foreground mb-0.5', isMobile ? 'text-[10px]' : 'text-sm mb-1')}>
              Quyền đã bật
            </p>
            <p className={cn('font-bold text-primary', isMobile ? 'text-xl' : 'text-3xl')}>{totalEnabledPermissions}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        <div className={cn('stat-card flex items-center justify-between', isMobile && 'p-2.5')}>
          <div>
            <p className={cn('text-muted-foreground mb-0.5', isMobile ? 'text-[10px]' : 'text-sm mb-1')}>
              Loại
            </p>
            <span className={cn(
              'status-badge inline-block',
              role.isSystem ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground',
              isMobile ? 'text-[10px]' : '',
            )}>
              {role.isSystem ? 'Hệ thống' : 'Tùy chỉnh'}
            </span>
          </div>
        </div>
      </div>

      <div className={cn('grid gap-6', isMobile ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3')}>
        {/* ── Left: Permission Matrix ── */}
        <div className={cn(isMobile ? '' : 'xl:col-span-2')}>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Ma trận phân quyền</CardTitle>
                      <p className="text-sm text-muted-foreground">Quyền theo từng module</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
                            <Info className="h-3.5 w-3.5" />
                            Toàn quyền
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Admin có tất cả quyền, không thể chỉnh sửa</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardHeader>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left p-3 pl-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[160px]">
                        Module
                      </th>
                      {ACTIONS.map((action) => (
                        <th
                          key={action}
                          className="text-center p-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide min-w-[52px]"
                        >
                          {ACTION_LABELS[action]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {role.permissions.map((perm, idx) => {
                      const enabledActions = getEnabledActions(perm as any);
                      // Find module description from the loaded modules list
                      const modInfo = modules.find((m) => m.id === perm.moduleId);
                      return (
                        <tr
                          key={perm.moduleId}
                          className={cn(
                            'border-b border-border/30 transition-colors hover:bg-muted/20',
                            idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/10',
                          )}
                        >
                          <td className="p-3 pl-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{perm.moduleName}</p>
                                {enabledActions.length > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                    {enabledActions.length}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {perm.moduleDescription ?? modInfo?.description}
                              </p>
                            </div>
                          </td>
                          {ACTIONS.map((action) => (
                            <td key={action} className="p-1.5 text-center">
                              <div className="flex justify-center">
                                {isActionEnabled(perm as any, action) ? (
                                  <div className="h-6 w-6 rounded-full bg-status-active/20 flex items-center justify-center">
                                    <Check className="h-3.5 w-3.5 text-status-active" />
                                  </div>
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-secondary/50 flex items-center justify-center">
                                    <X className="h-3 w-3 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Enabled permissions summary pills */}
              <div className="px-4 py-3 bg-muted/20 border-t border-border/30">
                <div className="flex flex-wrap gap-1.5">
                  {ACTIONS.map((action) => {
                    const count = role.permissions.filter((p) =>
                      isActionEnabled(p as any, action),
                    ).length;
                    if (count === 0) return null;
                    return (
                      <span
                        key={action}
                        className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', ACTION_COLORS[action])}
                      >
                        {ACTION_LABELS[action]}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Right: Users in role ── */}
        <div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardHeader className="pb-4 border-b border-border/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Người dùng</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {isLoadingUsers ? '...' : `${roleUsers.length} người`}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setAssignDialogOpen(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Gán user
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Search */}
                <div className="p-3 border-b border-border/30">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Tìm người dùng..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>

                {/* User list */}
                <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
                  {isLoadingUsers ? (
                    <div className="py-8 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-8 text-center">
                      <Users className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {userSearch ? 'Không tìm thấy' : 'Chưa có người dùng nào'}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/system/users/${user.id}`)}
                      >
                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{user.fullName}</p>
                          {user.email && (
                            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="h-2.5 w-2.5 shrink-0" />
                              {user.email}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            'status-badge text-[10px] shrink-0',
                            user.status === 'ACTIVE'
                              ? 'bg-status-active/20 text-status-active'
                              : 'bg-status-inactive/20 text-status-inactive',
                          )}
                        >
                          {user.status === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Assign User Dialog ── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Gán người dùng vào vai trò
            </DialogTitle>
            <DialogDescription>
              Chọn người dùng để gán vào vai trò <strong>{role.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <Command className="border border-border/50 rounded-lg bg-transparent">
            <CommandInput
              placeholder="Tìm theo tên hoặc email..."
              value={searchForAssign}
              onValueChange={setSearchForAssign}
            />
            <CommandList className="max-h-60">
              {isSearching ? (
                <div className="py-4 flex justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchForAssign.length === 0 ? (
                <CommandEmpty>Nhập tên hoặc email để tìm kiếm</CommandEmpty>
              ) : (
                <>
                  <CommandEmpty>Không tìm thấy người dùng</CommandEmpty>
                  <CommandGroup>
                    {unassignedUsers.map((user: any) => (
                      <CommandItem
                        key={user.id}
                        value={user.id}
                        onSelect={() => {
                          assignUser.mutate({ userId: user.id });
                          setAssignDialogOpen(false);
                          setSearchForAssign('');
                        }}
                        className="gap-3 py-2.5"
                        disabled={assignUser.isPending}
                      >
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-primary">
                            {user.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setSearchForAssign('');
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
