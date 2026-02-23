import { useState } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Layers,
    Loader2,
    AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';

import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { DataTable } from '@/components/shared/table/DataTable';
import { MobileCard } from '@/components/shared/table/MobileCard';
import { MobileCardActions } from '@/components/shared/table/MobileCardActions';
import { BulkActionsToolbar } from '@/components/shared/table/BulkActionsToolbar';
import { MobileButton } from '@/components/ui/mobile-button';

import { PageContainer } from '@/components/shared/PageContainer';
import { ResponsivePageHeader } from '@/components/shared/layout/ResponsivePageHeader';
import { ResponsiveDataView } from '@/components/shared/layout/ResponsiveDataView';
import { EmptyState } from '@/components/shared/EmptyState';
import { useRoleModules } from '@/features/roles/hooks/useRoleModules';
import { useCreateModule } from '@/features/roles/hooks/useCreateModule';
import { useUpdateModule } from '@/features/roles/hooks/useUpdateModule';
import { useDeleteModule } from '@/features/roles/hooks/useDeleteModule';
import { useModuleTableState } from '@/features/roles/hooks/useModuleTableState';
import { useModuleColumns } from '@/features/roles/hooks/useModuleColumns';
import type { PermissionModuleWithCount } from '@/features/roles/api/roles.api';
import { ModuleDialog, type ModuleFormData } from '@/features/roles/components/ModuleDialog';


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PermissionModuleList() {
    const queryClient = useQueryClient();

    const {
        searchQuery,
        setSearchQuery,
        rowSelection,
        setRowSelection,
        selectedIds,
        pagination,
        setPagination,
    } = useModuleTableState();

    const { data: modules = [], isLoading } = useRoleModules();
    const createModule = useCreateModule();
    const updateModule = useUpdateModule();
    const deleteModule = useDeleteModule();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<PermissionModuleWithCount | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PermissionModuleWithCount | null>(null);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const openCreate = () => {
        setEditingModule(null);
        setDialogOpen(true);
    };

    const openEdit = (mod: PermissionModuleWithCount) => {
        setEditingModule(mod);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingModule(null);
    };

    const { columns } = useModuleColumns({
        onEdit: openEdit,
        onDelete: setDeleteTarget,
    });

    const handleSubmit = async (data: ModuleFormData) => {
        const sortOrder = data.sortOrder ? Number(data.sortOrder) : undefined;
        if (editingModule) {
            await updateModule.mutateAsync(
                { id: editingModule.id, payload: { name: data.name, description: data.description || undefined, sortOrder } },
                { onSuccess: closeDialog },
            );
        } else {
            await createModule.mutateAsync(
                { id: data.id, name: data.name, description: data.description || undefined, sortOrder },
                { onSuccess: closeDialog },
            );
        }
    };

    const handleDelete = async () => {
        if (isBulkDeleting) {
            // Note: Currently we only map deletion 1 by 1 as deleteModule takes a single string ID
            // In a real bulk setup backed by API, we should use a mutate bulk delete query
            // However, loop deleting is ok for small batches if backend doesn't support bulk.
            // Let's iterate using Promise.all for simple mock
            try {
                await Promise.all(selectedIds.map(id => deleteModule.mutateAsync(id)));
                setRowSelection({});
                setDeleteTarget(null);
                setIsBulkDeleting(false);
            } catch (error) {
                console.error("Bulk delete failed", error);
            }
        } else if (deleteTarget) {
            await deleteModule.mutateAsync(deleteTarget.id, {
                onSuccess: () => {
                    setDeleteTarget(null);
                    setIsBulkDeleting(false);
                },
            });
        }
    };

    const handleBulkDelete = () => {
        setIsBulkDeleting(true);
        // We use boolean true flag essentially for dialog state
        // If we strictly want to pass a module for standard delete modal, we set a mock
        setDeleteTarget({ id: 'bulk', name: `${selectedIds.length} module đã chọn`, description: '', sortOrder: 0 });
    };

    const isSaving = createModule.isPending || updateModule.isPending;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <PageContainer>
            {/* ── Page Header ── */}
            <ResponsivePageHeader
                title="Modules phân quyền"
                subtitle="HỆ THỐNG"
                mobileActions={
                    <MobileButton size="sm" onClick={openCreate}>
                        <Plus className="h-5 w-5 mr-1.5" />
                        Thêm
                    </MobileButton>
                }
                desktopActions={
                    <Button onClick={openCreate} className="action-btn-primary">
                        <Plus className="h-4 w-4" />
                        Tạo module mới
                    </Button>
                }
            />

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="stat-card flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">
                            Tổng modules
                        </p>
                        <p className="text-3xl font-bold">
                            {isLoading ? '—' : modules.length}
                        </p>
                    </div>
                    <div className="stat-card-icon bg-primary/20">
                        <Layers className="h-5 w-5 text-primary" />
                    </div>
                </div>
                <div className="stat-card flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">
                            Đang sử dụng
                        </p>
                        <p className="text-3xl font-bold text-primary">
                            {isLoading ? '—' : modules && modules.filter((m) => (m._count?.permissions ?? 0) > 0).length}
                        </p>
                    </div>
                    <div className="stat-card-icon bg-primary/20">
                        <Layers className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <ResponsiveDataView
                isLoading={isLoading}
                isEmpty={modules.length === 0}
                onRefresh={async () => {
                    await queryClient.invalidateQueries({ queryKey: ['role-modules'] });
                    if (window.navigator.vibrate) window.navigator.vibrate(10);
                }}
                emptyState={
                    <EmptyState
                        icon={<Layers className="h-12 w-12 text-muted-foreground/50" />}
                        title="Chưa có module nào"
                        description="Bắt đầu bằng cách tạo module đầu tiên của bạn"
                        action={{
                            label: 'Tạo module đầu tiên',
                            onClick: openCreate,
                            icon: <Plus className="h-4 w-4" />,
                        }}
                    />
                }
                mobileFilters={null}
                desktopFilters={null}
                mobileContent={
                    <ResponsiveTable<PermissionModuleWithCount>
                        columns={columns}
                        data={modules}
                        keyExtractor={(mod) => mod.id}
                        emptyMessage="Chưa có module nào"
                        pageCount={1}
                        currentPage={pagination.pageIndex + 1}
                        showPagination={false}
                        selectedIds={selectedIds}
                        onSelectionChange={(ids) => {
                            const newSelection: RowSelectionState = {};
                            ids.forEach(id => newSelection[id] = true);
                            setRowSelection(newSelection);
                        }}
                        renderMobileCard={(mod, cols, isSelected, toggleSelection) => {
                            const nameCol = cols.find(c => c.key === 'name');
                            const usageCount = mod._count?.permissions ?? 0;

                            return (
                                <MobileCard
                                    title={nameCol?.render(mod)}
                                    subtitle={mod.description ?? ''}
                                    data={[
                                        { label: 'Thứ tự', value: mod.sortOrder },
                                        { label: 'Vai trò đ.dùng', value: `${usageCount} ` }
                                    ]}
                                    footerActions={
                                        <MobileCardActions actions={[
                                            {
                                                key: 'edit',
                                                label: 'Sửa',
                                                variant: 'warning',
                                                icon: <Pencil className="h-4 w-4" />,
                                                onClick: () => openEdit(mod)
                                            },
                                            {
                                                key: 'delete',
                                                label: 'Xóa',
                                                variant: 'destructive',
                                                disabled: usageCount > 0,
                                                icon: <Trash2 className="h-4 w-4" />,
                                                onClick: () => setDeleteTarget(mod)
                                            }
                                        ]} />
                                    }
                                    isSelected={isSelected}
                                    onToggleSelection={toggleSelection}
                                    renderSelection={true}
                                />
                            );
                        }}
                        isLoading={isLoading}
                    />
                }
                desktopContent={
                    <DataTable
                        columns={columns}
                        data={modules}
                        pageCount={1}
                        pageIndex={pagination.pageIndex}
                        pageSize={pagination.pageSize}
                        onPaginationChange={(pageIndex, pageSize) => setPagination({ pageIndex, pageSize })}
                        onRowSelectionChange={setRowSelection}
                        rowSelection={rowSelection}
                        getRowId={(row) => row.id}
                        searchColumn="name"
                        searchPlaceholder="Tìm kiếm module..."
                        searchValue={searchQuery}
                        onSearchChange={setSearchQuery}
                        isLoading={isLoading}
                    />
                }
            />

            {/* Bulk Actions */}
            <BulkActionsToolbar
                selectedCount={selectedIds.length}
                onClear={() => setRowSelection({})}
                onDelete={handleBulkDelete}
                isDeleting={deleteModule.isPending}
            />

            {/* ── Info note ── */}
            {!isLoading && modules.length > 0 && (
                <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground animate-in fade-in duration-500 delay-200">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500/70" />
                    <span>
                        Module đang được dùng bởi ít nhất một vai trò không thể xóa.
                        Gỡ quyền khỏi tất cả vai trò trước khi xóa module.
                    </span>
                </div>
            )}

            {/* ── Create / Edit Dialog ── */}
            <ModuleDialog
                open={dialogOpen}
                onClose={closeDialog}
                editingModule={editingModule}
                onSubmit={handleSubmit}
                isSaving={isSaving}
            />

            {/* ── Delete Confirmation ── */}
            <AlertDialog open={Boolean(deleteTarget) || isBulkDeleting} onOpenChange={(v) => {
                if (!v) {
                    setDeleteTarget(null);
                    setIsBulkDeleting(false);
                }
            }}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            {isBulkDeleting ? 'Xóa nhiều module?' : 'Xóa module?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa {isBulkDeleting ? 'các' : ''} module{' '}
                            <strong>"{deleteTarget?.name}"</strong>? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteModule.isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteModule.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Xóa module
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}
