import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileSpreadsheet,
  Download,
  ClipboardList,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { RowSelectionState } from '@tanstack/react-table';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import { DataTable } from '@/components/shared/table/DataTable';
import { MobileCardActions } from '@/components/shared/table/MobileCardActions';
import { DataTableFilterChips } from '@/components/shared/table/DataTableFilterChips';
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
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

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

  const getFilterLabel = useCallback((id: string, value: any) => {
    if (id === 'status') {
      return Array.isArray(value) 
        ? value.map(v => STATUS_OPTIONS.find(o => o.value === v)?.label).join(', ')
        : STATUS_OPTIONS.find(o => o.value === value)?.label || value;
    }
    if (id === 'cycle') {
      return Array.isArray(value) 
        ? value.map(v => CYCLE_OPTIONS.find(o => o.value === v)?.label).join(', ')
        : CYCLE_OPTIONS.find(o => o.value === value)?.label || value;
    }
    return value;
  }, []);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
    setRowSelection({});
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  // Stats
  const templates = data?.data || [];
  const activeCount = templates.filter((t) => t.status === ChecklistStatus.ACTIVE).length;
  const draftCount = templates.filter((t) => t.status === ChecklistStatus.DRAFT).length;

  const renderTableContent = () => {
    if (isLoading) return <TableSkeleton rows={5} />;

    const items = data?.data || [];
    const isFiltered = params.search || activeFiltersCount > 0;

    if (items.length === 0 && !isFiltered) {
      return (
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
      );
    }

    if (isMobile) {
      return (
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
          mobileCardAction={(t) => (
             <MobileCardActions 
                 onView={() => navigate(`/checklists/${t.id}`)}
                 onEdit={() => navigate(`/checklists/${t.id}/edit`)}
                 onDelete={() => setDeletingTemplate(t)}
             />
          )}
        />
      );
    }

    return (
      <>
        <DataTableFilterChips 
          filters={columnFilters}
          onRemove={toggleColumnFilter}
          onClearAll={resetFilters}
          getLabel={getFilterLabel}
        />
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
          facetedFilters={[
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
          ]}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          onFilterReset={resetFilters}
        />
      </>
    );
  };

  return (
    <PageContainer>
      {/* Page Header */}
      {isMobile ? (
        <MobilePageHeader
          title="Thư viện Checklist"
          actions={
            <MobileButton size="sm" onClick={() => navigate('/checklists/new')}>
              <Plus className="h-5 w-5 mr-1.5" />
              Thêm
            </MobileButton>
          }
        />
      ) : (
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
      )}

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

      {/* Mobile Filters */}
      {isMobile && (
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
          activeFilterTags={
            <DataTableFilterChips 
               filters={columnFilters}
               onRemove={toggleColumnFilter}
               onClearAll={resetFilters}
               getLabel={getFilterLabel}
            />
          }
          desktopFilters={null}
        />
      )}

      {/* Bulk Actions */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onClear={() => setRowSelection({})}
        onDelete={handleBulkDelete}
        isDeleting={bulkDeleteTemplate.isPending}
      />

      {/* Main Content */}
      {isMobile ? (
        <PullToRefresh
          onRefresh={handleRefresh}
          isPullable={!isLoading}
          pullingContent={
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">⬇️ Kéo để làm mới</p>
            </div>
          }
          refreshingContent={
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Đang làm mới...</p>
            </div>
          }
        >
          <div className="pb-20">
            {renderTableContent()}
          </div>
        </PullToRefresh>
      ) : (
        renderTableContent()
      )}

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
