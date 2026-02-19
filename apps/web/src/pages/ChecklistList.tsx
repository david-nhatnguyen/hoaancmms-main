import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/lib/image-utils';
import { Eye, Pencil, Trash2, Copy, Power } from 'lucide-react';

import {
  Plus,
  FileSpreadsheet,
  Download,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { RowSelectionState } from '@tanstack/react-table';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { ResponsivePageHeader } from '@/components/shared/layout/ResponsivePageHeader';
import { ResponsiveDataView } from '@/components/shared/layout/ResponsiveDataView';
import { DataTable } from '@/components/shared/table/DataTable';
import { MobileCardActions } from '@/components/shared/table/MobileCardActions';
import { MobileCard } from '@/components/shared/table/MobileCard';
import { BulkActionsToolbar } from '@/components/shared/table/BulkActionsToolbar';

// Feature Components, Hooks & Handlers
import {
  useChecklistTemplates,
  useTemplateActions,
  useChecklistTableState,
  useChecklistColumns,
  useDeleteTemplate,
  useBulkDeleteTemplate,
} from '@/features/checklists/hooks';
import { DeleteChecklistDialog } from '@/features/checklists/components/DeleteChecklistDialog';
import {
  ImportChecklistDialog,
  ImportChecklistProgress,
} from '@/features/checklists/components';



import {
  ChecklistStatus,
  ChecklistCycle,
  CYCLE_LABELS,
  STATUS_LABELS,
  type ChecklistTemplate,
} from '@/features/checklists/types/checklist.types';

const STATUS_OPTIONS = [
  { label: STATUS_LABELS[ChecklistStatus.DRAFT], value: ChecklistStatus.DRAFT },
  { label: STATUS_LABELS[ChecklistStatus.ACTIVE], value: ChecklistStatus.ACTIVE },
  { label: STATUS_LABELS[ChecklistStatus.INACTIVE], value: ChecklistStatus.INACTIVE },
];

const CYCLE_OPTIONS = [
  { label: CYCLE_LABELS[ChecklistCycle.DAILY], value: ChecklistCycle.DAILY },
  { label: CYCLE_LABELS[ChecklistCycle.WEEKLY], value: ChecklistCycle.WEEKLY },
  { label: CYCLE_LABELS[ChecklistCycle.MONTHLY], value: ChecklistCycle.MONTHLY },
  { label: CYCLE_LABELS[ChecklistCycle.QUARTERLY], value: ChecklistCycle.QUARTERLY },
  { label: CYCLE_LABELS[ChecklistCycle.SEMI_ANNUALLY], value: ChecklistCycle.SEMI_ANNUALLY },
  { label: CYCLE_LABELS[ChecklistCycle.YEARLY], value: ChecklistCycle.YEARLY },
];

export default function ChecklistList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

  // Import Dialog State
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [activeImportId, setActiveImportId] = useState<string | null>(null);
  const [activeImportFileName, setActiveImportFileName] = useState<string | null>(null);

  const handleCloseImport = useCallback(() => {
    setActiveImportId(null);
    setActiveImportFileName(null);
    localStorage.removeItem('checklist_import_id');
    localStorage.removeItem('checklist_import_file_name');
    localStorage.removeItem('checklist_import_duration');
    localStorage.removeItem('checklist_import_start_time');
  }, []);

  const handleUploadStart = useCallback(
    (id: string, estimatedDuration?: number, fileName?: string) => {
      if (!id) return;

      // Write to localStorage FIRST so useImportProgress reads correct values
      // when it mounts after activeImportId state is set.
      localStorage.setItem('checklist_import_id', id);
      if (fileName) {
        localStorage.setItem('checklist_import_file_name', fileName);
      }
      if (estimatedDuration) {
        localStorage.setItem('checklist_import_duration', estimatedDuration.toString());
      }
      // Always stamp start time
      localStorage.setItem('checklist_import_start_time', Date.now().toString());

      // Then set state to trigger re-render + mount ImportChecklistProgress
      setActiveImportId(id);
      if (fileName) setActiveImportFileName(fileName);
    },
    []
  );

  const {
    searchQuery,
    setSearchQuery,
    rowSelection,
    setRowSelection,
    selectedIds,
    sorting,
    setSorting,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    params,
    activeFiltersCount,
    resetFilters,
    toggleColumnFilter,
  } = useChecklistTableState();

  // API Hooks
  const { data, isLoading } = useChecklistTemplates(params);
  const { duplicate, deactivate } = useTemplateActions();
  const deleteTemplate = useDeleteTemplate();
  const bulkDeleteTemplate = useBulkDeleteTemplate();

  // Local UI State
  const [deletingTemplate, setDeletingTemplate] = useState<ChecklistTemplate | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const facetedFilters = useMemo(() => [
    {
      column: "cycle",
      title: "Chu kỳ",
      options: CYCLE_OPTIONS,
    },
    {
      column: "status",
      title: "Trạng thái",
      options: STATUS_OPTIONS,
    }
  ], []);

  // Handlers
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeletingTemplate({ id: 'bulk', name: `${selectedIds.length} checklist`, code: 'BULK' } as any);
    setIsBulkDeleting(true);
  };

  // Column Hook
  const { columns } = useChecklistColumns({
    onView: (t) => navigate(`/checklists/${t.id}`),
    onEdit: (t) => navigate(`/checklists/${t.id}/edit`),
    onCopy: (t) => duplicate.mutate(t.id),
    onDeactivate: (t) => deactivate.mutate(t.id),
    onDelete: (t) => setDeletingTemplate(t),
  });


  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
    setRowSelection({});
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  // Stats
  const templates = data?.data || [];
  const activeCount = templates.filter((t) => t.status === ChecklistStatus.ACTIVE).length;
  const draftCount = templates.filter((t) => t.status === ChecklistStatus.DRAFT).length;

  const items = data?.data || [];
  const isFiltered = params.search || activeFiltersCount > 0;



  return (
    <PageContainer>
      <ResponsivePageHeader
        title="Danh sách Checklist Bảo dưỡng"
        subtitle="THƯ VIỆN CHECKLIST"
        mobileActions={
          <MobileButton size="sm" onClick={() => navigate('/checklists/new')}>
            <Plus className="h-5 w-5 mr-1.5" />
            Thêm
          </MobileButton>
        }
        desktopActions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="action-btn-secondary"
              onClick={() => setShowImportDialog(true)}
            >
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
          </>
        }
      />

      <ImportChecklistDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onUploadStart={handleUploadStart}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng cộng</p>
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
            <p className="text-sm text-muted-foreground mb-1">Áp dụng</p>
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

      {activeImportId && (
        <ImportChecklistProgress
          key={activeImportId}
          jobId={activeImportId}
          fileName={activeImportFileName || undefined}
          onClose={handleCloseImport}
        />
      )}

      <ResponsiveDataView
        isLoading={isLoading}
        isEmpty={items.length === 0 && !isFiltered}
        emptyState={
          <EmptyState
            icon={<ClipboardList className="h-12 w-12 text-muted-foreground/50" />}
            title="Chưa có checklist nào"
            description="Bắt đầu bằng cách tạo checklist bảo dưỡng đầu tiên của bạn"
            action={{
              label: 'Tạo checklist',
              onClick: () => navigate('/checklists/new'),
              icon: <Plus className="h-4 w-4" />,
            }}
          />
        }
        onRefresh={handleRefresh}
        mobileFilters={
          <MobileFilters
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Tìm checklist..."
            sections={[
              {
                id: 'cycle',
                label: 'Chu kỳ',
                activeCount: (columnFilters.find(f => f.id === 'cycle')?.value as string[] || []).length,
                content: (
                  <ChipFilter
                    options={CYCLE_OPTIONS}
                    selected={(columnFilters.find(f => f.id === 'cycle')?.value as string[]) || []}
                    onToggle={(val) => toggleColumnFilter('cycle', val)}
                  />
                )
              },
              {
                id: 'status',
                label: 'Trạng thái',
                activeCount: (columnFilters.find(f => f.id === 'status')?.value as string[] || []).length,
                content: (
                  <ChipFilter
                    options={STATUS_OPTIONS}
                    selected={(columnFilters.find(f => f.id === 'status')?.value as string[]) || []}
                    onToggle={(val) => toggleColumnFilter('status', val)}
                  />
                )
              },
            ]}
            activeFiltersCount={activeFiltersCount}
            onClearAll={resetFilters}
            activeFilterTags={null}

            desktopFilters={null}
          />
        }
        desktopFilters={null}

        mobileContent={
          <ResponsiveTable<ChecklistTemplate>
            columns={columns}
            data={items}
            keyExtractor={(t) => t.id}
            emptyMessage={isFiltered ? "Không tìm thấy kết quả phù hợp" : "Chưa có checklist nào"}
            pageCount={data?.meta?.totalPages}
            currentPage={params.page}
            showPagination={true}
            onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
            selectedIds={selectedIds}
            onSelectionChange={(ids) => {
              const nextSelection: RowSelectionState = {};
              ids.forEach(id => nextSelection[id] = true);
              setRowSelection(nextSelection);
            }}
            renderMobileCard={(t, cols, isSelected, toggleSelection) => {
              const codeCol = cols.find(c => c.key === 'code');
              const statusCol = cols.find(c => c.key === 'status');
              const cycleCol = cols.find(c => c.key === 'cycle');
              const versionCol = cols.find(c => c.key === 'version');

              return (
                <MobileCard
                  title={codeCol?.render(t)}
                  subtitle={t.name}
                  status={statusCol?.render(t)}
                  image={getImageUrl(t.equipment?.image ?? undefined)}
                  data={[
                    { label: 'Thiết bị', value: t.equipment?.name },
                    { label: 'Chu kỳ', value: cycleCol?.render(t) },
                    { label: 'Phiên bản', value: versionCol?.render(t) },
                    { label: 'Bộ phận', value: t.department }
                  ]}
                  footerActions={
                    <MobileCardActions actions={[
                      {
                        key: 'view',
                        label: 'Xem chi tiết',
                        variant: 'primary',
                        icon: <Eye className="h-4 w-4" />,
                        onClick: () => navigate(`/checklists/${t.id}`)
                      },
                      {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        variant: 'warning',
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: () => navigate(`/checklists/${t.id}/edit`)
                      },
                      {
                        key: 'copy',
                        label: 'Nhân bản',
                        variant: 'default',
                        icon: <Copy className="h-4 w-4" />,
                        onClick: () => duplicate.mutate(t.id)
                      },
                      {
                        key: 'deactivate',
                        label: t.status === ChecklistStatus.ACTIVE ? 'Tạm ngưng' : 'Kích hoạt',
                        variant: 'secondary',
                        icon: <Power className="h-4 w-4" />,
                        onClick: () => deactivate.mutate(t.id)
                      },
                      {
                        key: 'delete',
                        label: 'Xóa',
                        variant: 'destructive',
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => setDeletingTemplate(t)
                      }
                    ]} />
                  }
                  onClick={() => navigate(`/checklists/${t.id}`)}
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
            data={items}
            pageCount={data?.meta?.totalPages}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={(pageIndex, pageSize) => {
              setPagination({ pageIndex, pageSize });
            }}
            onSortingChange={setSorting}
            sorting={sorting}
            onRowSelectionChange={setRowSelection}
            rowSelection={rowSelection}
            getRowId={(row) => row.id}
            searchColumn="name"
            searchPlaceholder="Tìm kiếm checklist..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            facetedFilters={facetedFilters}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            onFilterReset={resetFilters}
            isLoading={isLoading}
          />
        }
      />
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onClear={() => setRowSelection({})}
        onDelete={handleBulkDelete}
        isDeleting={bulkDeleteTemplate.isPending}
      />

      {/* Deleting Dialog */}
      <DeleteChecklistDialog
        template={deletingTemplate}
        open={!!deletingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTemplate(null);
            setIsBulkDeleting(false);
          }
        }}
        onConfirm={() => {
          if (isBulkDeleting) {
            bulkDeleteTemplate.mutate(selectedIds, {
              onSuccess: () => {
                setDeletingTemplate(null);
                setRowSelection({});
                setIsBulkDeleting(false);
              }
            });
          } else if (deletingTemplate) {
            deleteTemplate.mutate(deletingTemplate.id, {
              onSuccess: () => setDeletingTemplate(null)
            });
          }
        }}
        isDeleting={deleteTemplate.isPending || (isBulkDeleting && bulkDeleteTemplate.isPending)}
      />
    </PageContainer>
  );
}
