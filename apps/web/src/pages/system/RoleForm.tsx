import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Shield,
    Check,
    X,
    Info,
    Loader2,
    CheckSquare,
    Square,
    Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    useRole,
    useRoleModules,
    useCreateRole,
    useUpdateRole,
    type PermissionPayload,
    type PermissionModule,
} from '@/features/roles';

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'lock'] as const;
type Action = typeof ACTIONS[number];

// Map UI action names ↔ API field names (canView, canCreate, ...)
const ACTION_TO_API_KEY: Record<Action, keyof Omit<PermissionPayload, 'moduleId'>> = {
    view: 'canView',
    create: 'canCreate',
    edit: 'canEdit',
    delete: 'canDelete',
    export: 'canExport',
    approve: 'canApprove',
    lock: 'canLock',
};

const ACTION_LABELS: Record<Action, string> = {
    view: 'Xem',
    create: 'Tạo',
    edit: 'Sửa',
    delete: 'Xóa',
    export: 'Xuất',
    approve: 'Duyệt',
    lock: 'Khóa',
};

const ACTION_DESCRIPTIONS: Record<Action, string> = {
    view: 'Xem danh sách và chi tiết',
    create: 'Tạo mới bản ghi',
    edit: 'Sửa thông tin',
    delete: 'Xóa bản ghi',
    export: 'Xuất dữ liệu ra file',
    approve: 'Phê duyệt / Áp dụng',
    lock: 'Khóa / Vô hiệu hóa',
};

// Dependency rules: enabling some actions automatically requires 'view'
const ACTION_DEPENDENCIES: Partial<Record<Action, Action[]>> = {
    create: ['view'],
    edit: ['view'],
    delete: ['view'],
    export: ['view'],
    approve: ['view'],
    lock: ['view'],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionMatrix = Record<string, Record<Action, boolean>>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build an empty row (all false) for a module */
function emptyRow(): Record<Action, boolean> {
    return { view: false, create: false, edit: false, delete: false, export: false, approve: false, lock: false };
}

/** Initialise the matrix from the API response (RolePermission[]) */
function initMatrixFromApi(
    modules: PermissionModule[],
    permissions: PermissionPayload[] = [],
): PermissionMatrix {
    const matrix: PermissionMatrix = {};
    modules.forEach((mod) => {
        const perm = permissions.find((p) => p.moduleId === mod.id);
        matrix[mod.id] = {
            view: perm?.canView ?? false,
            create: perm?.canCreate ?? false,
            edit: perm?.canEdit ?? false,
            delete: perm?.canDelete ?? false,
            export: perm?.canExport ?? false,
            approve: perm?.canApprove ?? false,
            lock: perm?.canLock ?? false,
        };
    });
    return matrix;
}

/** Convert the matrix to the payload format expected by the backend */
function matrixToPayload(matrix: PermissionMatrix): PermissionPayload[] {
    return Object.entries(matrix).map(([moduleId, actions]) => ({
        moduleId,
        canView: actions.view,
        canCreate: actions.create,
        canEdit: actions.edit,
        canDelete: actions.delete,
        canExport: actions.export,
        canApprove: actions.approve,
        canLock: actions.lock,
    }));
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function PermCell({
    checked,
    disabled,
    onClick,
}: {
    checked: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150 mx-auto',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                disabled
                    ? 'opacity-30 cursor-not-allowed'
                    : checked
                        ? 'bg-primary/20 hover:bg-primary/30 border border-primary/40'
                        : 'bg-secondary/60 hover:bg-secondary border border-border/50',
            )}
        >
            {checked ? (
                <Check className="h-4 w-4 text-primary" />
            ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground/40" />
            )}
        </button>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RoleFormSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-pulse">
            <div className="h-8 w-40 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
            <div className="h-64 w-full bg-muted rounded" />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RoleForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const isEdit = Boolean(id);

    // ── Data fetching ──────────────────────────────────────────────
    const { data: existingRole, isLoading: isLoadingRole } = useRole(id);
    const { data: modules = [], isLoading: isLoadingModules } = useRoleModules();

    // ── Mutations ──────────────────────────────────────────────────
    const createRole = useCreateRole();
    const updateRole = useUpdateRole(id ?? '');
    const isSaving = createRole.isPending || updateRole.isPending;

    // ── Local form state ───────────────────────────────────────────
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [matrix, setMatrix] = useState<PermissionMatrix>({});
    const [matrixInitialized, setMatrixInitialized] = useState(false);

    // Populate form once we have both the role (edit mode) and modules
    useEffect(() => {
        if (modules.length === 0) return;
        if (isEdit && !existingRole) return; // Still loading existing role

        const permissions = existingRole
            ? existingRole.permissions.map((p) => ({
                moduleId: p.moduleId,
                canView: p.canView,
                canCreate: p.canCreate,
                canEdit: p.canEdit,
                canDelete: p.canDelete,
                canExport: p.canExport,
                canApprove: p.canApprove,
                canLock: p.canLock,
            }))
            : [];

        setName(existingRole?.name ?? '');
        setDescription(existingRole?.description ?? '');
        setMatrix(initMatrixFromApi(modules, permissions));
        setMatrixInitialized(true);
    }, [existingRole, modules, isEdit]);

    // ── Matrix toggles ─────────────────────────────────────────────

    const toggleCell = useCallback((moduleId: string, action: Action) => {
        setMatrix((prev) => {
            const current = prev[moduleId][action];
            const next = !current;
            const updated = { ...prev[moduleId], [action]: next };

            // Auto-enable dependencies (e.g. create → enable view)
            if (next) {
                const deps = ACTION_DEPENDENCIES[action] ?? [];
                deps.forEach((dep) => { updated[dep] = true; });
            }

            // Auto-disable all other actions when disabling 'view'
            if (!next && action === 'view') {
                ACTIONS.forEach((a) => { if (a !== 'view') updated[a] = false; });
            }

            return { ...prev, [moduleId]: updated };
        });
    }, []);

    const toggleModule = useCallback((moduleId: string, checked: boolean) => {
        setMatrix((prev) => {
            const updated: Record<Action, boolean> = {} as Record<Action, boolean>;
            ACTIONS.forEach((a) => { updated[a] = checked; });
            return { ...prev, [moduleId]: updated };
        });
    }, []);

    const toggleAction = useCallback((action: Action, checked: boolean) => {
        setMatrix((prev) => {
            const next = { ...prev };
            modules.forEach((mod) => {
                next[mod.id] = { ...next[mod.id], [action]: checked };
                if (checked && action !== 'view') next[mod.id].view = true;
                if (!checked && action === 'view') {
                    ACTIONS.forEach((a) => { next[mod.id][a] = false; });
                }
            });
            return next;
        });
    }, [modules]);

    // ── Column/row state helpers ───────────────────────────────────

    const getColumnState = (action: Action): 'all' | 'none' | 'partial' => {
        const vals = modules.map((m) => matrix[m.id]?.[action] ?? false);
        if (vals.every(Boolean)) return 'all';
        if (vals.every((v) => !v)) return 'none';
        return 'partial';
    };

    const getRowState = (moduleId: string): 'all' | 'none' | 'partial' => {
        if (!matrix[moduleId]) return 'none';
        const vals = ACTIONS.map((a) => matrix[moduleId][a]);
        if (vals.every(Boolean)) return 'all';
        if (vals.every((v) => !v)) return 'none';
        return 'partial';
    };

    // ── Save handler ───────────────────────────────────────────────

    const handleSave = async () => {
        if (!name.trim()) {
            // Toast shown by form validation below — we import toast via hook's onError
            import('sonner').then(({ toast }) => toast.error('Tên vai trò không được để trống'));
            return;
        }

        const permissions = matrixToPayload(matrix);

        if (isEdit && id) {
            await updateRole.mutateAsync(
                { name: name.trim(), description: description.trim(), permissions },
                { onSuccess: () => navigate('/system/roles') },
            );
        } else {
            await createRole.mutateAsync(
                { name: name.trim(), description: description.trim(), permissions },
                { onSuccess: () => navigate('/system/roles') },
            );
        }
    };

    // ── Derived stats ──────────────────────────────────────────────

    const totalEnabled = Object.values(matrix).reduce(
        (sum, m) => sum + ACTIONS.filter((a) => m[a]).length,
        0,
    );
    const totalPossible = modules.length * ACTIONS.length;

    // ── Loading state ──────────────────────────────────────────────

    if (isLoadingModules || (isEdit && isLoadingRole)) {
        return <RoleFormSkeleton />;
    }

    // ─── Render ────────────────────────────────────────────────────

    return (
        <div
            className={cn(
                'max-w-full overflow-x-hidden',
                isMobile ? 'px-4 py-3' : 'p-6',
            )}
        >
            {/* ── Header ── */}
            < div className="mb-6" >
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
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">HỆ THỐNG</p>
                            <h1 className={cn('font-bold', isMobile ? 'text-lg' : 'page-title')}>
                                {isEdit ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/system/roles')}
                            disabled={isSaving}
                            className="action-btn-secondary"
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving} className="action-btn-primary">
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isEdit ? 'Lưu thay đổi' : 'Tạo vai trò'}
                        </Button>
                    </div>
                </div>
            </div >

            {/* ── Role Info Card ── */}
            < div className="mb-6" >
                <Card className="border border-border/60 shadow-sm bg-card">
                    <CardHeader className="pb-4 border-b border-border/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-primary/10">
                                <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Thông tin vai trò</CardTitle>
                                <p className="text-sm text-muted-foreground mt-0.5">Tên và mô tả nhóm quyền</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">
                                Tên vai trò <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="role-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="VD: Kỹ thuật viên cấp cao"
                                className="h-10"
                                disabled={isEdit && existingRole?.isSystem}
                            />
                            {isEdit && existingRole?.isSystem && (
                                <p className="text-xs text-muted-foreground">
                                    Vai trò hệ thống không thể đổi tên
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role-desc">Mô tả</Label>
                            <Textarea
                                id="role-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả về vai trò và trách nhiệm..."
                                className="h-10 resize-none"
                                rows={1}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div >

            {/* ── Permission Matrix Card ── */}
            < div >
                <Card className="border border-border/60 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="pb-4 border-b border-border/30">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-primary/10">
                                    <Shield className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Ma trận phân quyền</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Chọn quyền cho từng module
                                    </p>
                                </div>
                            </div>

                            {/* Stats badge + quick presets */}
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                                    <span className="text-xs font-semibold text-primary">
                                        {totalEnabled}/{totalPossible} quyền đã bật
                                    </span>
                                </div>
                                {!isMobile && matrixInitialized && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-muted-foreground">Nhanh:</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs px-2"
                                            onClick={() => {
                                                const next: PermissionMatrix = {};
                                                modules.forEach((m) => {
                                                    next[m.id] = { view: true, create: false, edit: false, delete: false, export: false, approve: false, lock: false };
                                                });
                                                setMatrix(next);
                                            }}
                                        >
                                            Chỉ xem
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs px-2"
                                            onClick={() => toggleAction('view', true)}
                                        >
                                            Bật tất cả Xem
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                                            onClick={() => setMatrix(initMatrixFromApi(modules, []))}
                                        >
                                            Xóa tất cả
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    {/* Scrollable permission table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                    <th className="text-left p-3 pl-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-48 min-w-[180px]">
                                        Module
                                    </th>
                                    {ACTIONS.map((action) => {
                                        const state = getColumnState(action);
                                        return (
                                            <th
                                                key={action}
                                                className="text-center p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[64px]"
                                            >
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex flex-col items-center gap-1 cursor-help">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleAction(action, state !== 'all')}
                                                                    className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                                                                    title={`Toggle all ${ACTION_LABELS[action]}`}
                                                                >
                                                                    {state === 'all' ? (
                                                                        <CheckSquare className="h-4 w-4 text-primary" />
                                                                    ) : state === 'partial' ? (
                                                                        <Minus className="h-4 w-4 text-primary/60" />
                                                                    ) : (
                                                                        <Square className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                                <span>{ACTION_LABELS[action]}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">{ACTION_DESCRIPTIONS[action]}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                Nhấn để bật/tắt cột
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map((mod, idx) => {
                                    const rowState = getRowState(mod.id);
                                    return (
                                        <tr
                                            key={mod.id}
                                            className={cn(
                                                'border-b border-border/30 transition-colors hover:bg-muted/20',
                                                idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/10',
                                            )}
                                        >
                                            {/* Module name */}
                                            <td className="p-3 pl-4">
                                                <div className="flex items-center gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleModule(mod.id, rowState !== 'all')}
                                                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                                                    >
                                                        {rowState === 'all' ? (
                                                            <CheckSquare className="h-4 w-4 text-primary" />
                                                        ) : rowState === 'partial' ? (
                                                            <Minus className="h-4 w-4 text-primary/60" />
                                                        ) : (
                                                            <Square className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium leading-none">{mod.name}</p>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                                            {mod.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Permission cells */}
                                            {ACTIONS.map((action) => (
                                                <td key={action} className="p-2 text-center">
                                                    <PermCell
                                                        checked={matrix[mod.id]?.[action] ?? false}
                                                        onClick={() => toggleCell(mod.id, action)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="p-4 bg-muted/20 border-t border-border/30 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary" />
                            </div>
                            <span>Có quyền</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-md bg-secondary/60 border border-border/50 flex items-center justify-center">
                                <X className="h-3 w-3 text-muted-foreground/40" />
                            </div>
                            <span>Không có quyền</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-auto">
                            <Info className="h-3.5 w-3.5" />
                            <span>Bật quyền khác sẽ tự động bật quyền Xem</span>
                        </div>
                    </div>
                </Card>
            </div >

            {/* Bottom action bar for mobile */}
            {
                isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 p-4 flex gap-2 z-50">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate('/system/roles')}
                            disabled={isSaving}
                        >
                            Hủy
                        </Button>
                        <Button
                            className="flex-1 action-btn-primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isEdit ? 'Lưu' : 'Tạo vai trò'}
                        </Button>
                    </div>
                )
            }
        </div >
    );
}
