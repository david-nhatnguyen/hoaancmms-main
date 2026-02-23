import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Layers, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { PermissionModuleWithCount } from '@/features/roles/api/roles.api';

interface UseModuleColumnsProps {
    onEdit: (module: PermissionModuleWithCount) => void;
    onDelete: (module: PermissionModuleWithCount) => void;
}

export interface UseModuleColumnsReturn {
    columns: (ColumnDef<PermissionModuleWithCount> & {
        key: string;
        render: (item: PermissionModuleWithCount) => React.ReactNode;
        mobilePriority?: 'primary' | 'secondary' | 'metadata';
        width?: string;
        align?: 'left' | 'center' | 'right';
        truncate?: boolean;
        tooltip?: boolean;
    })[];
}

export function useModuleColumns({ onEdit, onDelete }: UseModuleColumnsProps): UseModuleColumnsReturn {
    const columns = useMemo<UseModuleColumnsReturn['columns']>(
        () => [
            {
                id: 'select',
                key: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                ),
                render: () => null,
                enableSorting: false,
                enableHiding: false,
                width: 'w-[40px]',
                size: 40,
                minSize: 40,
                maxSize: 40,
            },
            {
                accessorKey: 'sortOrder',
                key: 'sortOrder',
                header: 'Thứ tự',
                size: 80,
                cell: ({ row }) => (
                    <span className="text-xs text-muted-foreground font-mono">
                        {row.original.sortOrder}
                    </span>
                ),
                render: (mod) => (
                    <span className="text-xs text-muted-foreground font-mono">
                        {mod.sortOrder}
                    </span>
                ),
                mobilePriority: 'metadata',
            },
            {
                accessorKey: 'name',
                key: 'name',
                header: 'Tên module',
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{row.original.name}</span>
                    </div>
                ),
                render: (mod) => (
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{mod.name}</span>
                    </div>
                ),
                mobilePriority: 'primary',
            },
            {
                accessorKey: 'id',
                key: 'id',
                header: 'ID',
                cell: ({ row }) => (
                    <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                        {row.original.id}
                    </code>
                ),
                render: (mod) => (
                    <code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                        {mod.id}
                    </code>
                ),
                mobilePriority: 'secondary',
            },
            {
                accessorKey: 'description',
                key: 'description',
                header: 'Mô tả',
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground max-w-[260px] truncate block">
                        {row.original.description ?? <span className="text-muted-foreground/40">—</span>}
                    </span>
                ),
                render: (mod) => (
                    <span className="text-sm text-muted-foreground max-w-[260px] truncate block">
                        {mod.description ?? <span className="text-muted-foreground/40">—</span>}
                    </span>
                ),
                mobilePriority: 'metadata',
            },
            {
                id: 'usage',
                key: 'usage',
                header: 'Vai trò đang dùng',
                cell: ({ row }) => {
                    const usageCount = row.original._count?.permissions ?? 0;
                    return usageCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {usageCount} vai trò
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground/40">Chưa dùng</span>
                    );
                },
                render: (mod) => {
                    const usageCount = mod._count?.permissions ?? 0;
                    return usageCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {usageCount} vai trò
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground/40">Chưa dùng</span>
                    );
                },
                mobilePriority: 'metadata',
            },
            {
                id: 'actions',
                key: 'actions',
                header: () => <div className="text-right">Thao tác</div>,
                size: 100,
                cell: ({ row }) => {
                    const mod = row.original;
                    const usageCount = mod._count?.permissions ?? 0;
                    return (
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title="Sửa"
                                onClick={() => onEdit(mod)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                title={usageCount > 0 ? 'Đang được dùng bởi vai trò' : 'Xóa module'}
                                disabled={usageCount > 0}
                                onClick={() => onDelete(mod)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                },
                render: () => null,
            },
        ],
        [onEdit, onDelete]
    );

    return { columns };
}
