import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Cpu, Filter, X, FileSpreadsheet, Download } from 'lucide-react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import PullToRefresh from 'react-simple-pull-to-refresh';

// UI Components
import { Button } from '@/components/ui/button';
import { MobileButton } from '@/components/ui/mobile-button';
import { Badge } from '@/components/ui/badge';
import { MobileFilters } from '@/components/shared/MobileFilters';
import { ChipFilter } from '@/components/shared/filters/ChipFilter';
import { useDebounce } from '@/hooks/use-debounce';
import { MobilePageHeader } from '@/components/shared/MobilePageHeader';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/shared/PageContainer';
import { useIsMobile } from '@/hooks/use-mobile';
import { factoriesApi } from '@/api/endpoints/factories.api';

// Feature Components & Hooks
import {
  useEquipmentColumns,
  useEquipmentStats,
  useEquipments,
  useDeleteEquipment,
  STATUS_OPTIONS,
} from '@/features/equipments/hooks';

import {
  EquipmentStats,
  DeleteEquipmentDialog,
  EquipmentDesktopFilters,
  ImportEquipmentDialog,
  ImportProgress
} from '@/features/equipments/components';

import type { Equipment, EquipmentQueryParams } from '@/api/types/equipment.types';

/**
 * Equipment List Page
 * Follows FactoryList pattern for consistency
 */
export default function EquipmentList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // ============================================================================
  // STATE & HOOKS
  // ============================================================================

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Import Dialog State
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [activeImportId, setActiveImportId] = useState<string | null>(() => {
    const saved = localStorage.getItem('import_id');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    return saved;
  });
  const [activeImportFileName, setActiveImportFileName] = useState<string | null>(() => {
    return localStorage.getItem('import_file_name');
  });

  // Handle cleanup for import
  const handleCloseImport = useCallback(() => {
    setActiveImportId(null);
    setActiveImportFileName(null);
    localStorage.removeItem('import_id');
    localStorage.removeItem('import_file_name');
    localStorage.removeItem('import_duration');
    localStorage.removeItem('import_start_time');
  }, []);

  const handleUploadStart = useCallback((id: string, estimatedDuration?: number, fileName?: string) => {
    if (!id) return;
    
    setActiveImportId(id);
    localStorage.setItem('import_id', id);

    if (fileName) {
      setActiveImportFileName(fileName);
      localStorage.setItem('import_file_name', fileName);
    }

    if (estimatedDuration) {
      localStorage.setItem('import_duration', estimatedDuration.toString());
      localStorage.setItem('import_start_time', Date.now().toString());
    }
  }, []);

  // Sync activeImportId (basic sync only for the ID)
  useEffect(() => {
    if (!activeImportId) {
      localStorage.removeItem('import_id');
      localStorage.removeItem('import_duration');
      localStorage.removeItem('import_start_time');
    }
  }, [activeImportId]);

  // ... (rest of file)



  // Query parameters
  const [params, setParams] = useState<EquipmentQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: [],
    factoryId: undefined, // Filter by factory
  });

  // Sync search with params
  useMemo(() => {
    setParams(prev => {
      if (prev.search === debouncedSearch) return prev;
      return { ...prev, search: debouncedSearch, page: 1 };
    });
  }, [debouncedSearch]);


  // Custom hook for table columns
  const { columns } = useEquipmentColumns({
    onEdit: (eq) => navigate(`/equipments/${eq.id}/edit`),
    onViewDetails: (id) => navigate(`/equipments/${id}`),
    onDelete: (equipment) => setDeletingEquipment(equipment),
  });

  // Custom hook for stats
  const { data: statsData, isLoading: statsLoading } = useEquipmentStats();

  // API hooks
  const { data, isLoading } = useEquipments(params);
  const deleteEquipment = useDeleteEquipment();

  // Fetch factories for filters
  const { data: factoriesData } = useQuery({
    queryKey: ['factories-list'],
    queryFn: () => factoriesApi.getAll({ limit: 100, page: 1 }),
  });
  
  const factoriesList = factoriesData?.data || [];
  const factoryOptions = factoriesList.map(f => ({ value: f.id, label: f.name }));

  // Delete State
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  // ============================================================================
  // FILTER LOGIC
  // ============================================================================

  const toggleStatus = (value: string) => {
    setParams(prev => {
      const current = Array.isArray(prev.status) ? prev.status : [];
      const next = current.includes(value as any)
        ? current.filter(s => s !== value)
        : [...current, value as any];
      return { ...prev, status: next.length > 0 ? next : undefined, page: 1 };
    });
  };

  const toggleFactory = (value: string) => {
      setParams(prev => {
          // Current API supports single factoryId. 
          // If we click the same value, clear it (toggle off). 
          // If different, set it.
          const newVal = prev.factoryId === value ? undefined : value;
          return { ...prev, factoryId: newVal, page: 1 };
      });
  };

  const clearFilters = () => {
    setParams(prev => ({
      ...prev,
      status: undefined,
      factoryId: undefined,
      search: '',
      page: 1
    }));
    setSearchQuery('');
  };

  const activeFiltersCount = 
    (Array.isArray(params.status) ? params.status.length : 0) +
    (params.factoryId ? 1 : 0);

  // Mobile Filter Sections
  const filterSections = [
    {
      id: 'factory',
      label: 'Nhà máy',
      activeCount: params.factoryId ? 1 : 0,
      content: (
         <div className="space-y-2">
           {factoryOptions.map(f => (
             <button
               key={f.value}
               onClick={() => toggleFactory(f.value)}
               className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm ${params.factoryId === f.value ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'}`}
             >
                <div className={`h-4 w-4 rounded border flex items-center justify-center ${params.factoryId === f.value ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                   {params.factoryId === f.value && <div className="h-2 w-2 bg-primary-foreground rounded-full" />}
                </div>
                {f.label}
             </button>
           ))}
         </div>
      )
    },
    {
       id: 'status',
       label: 'Trạng thái',
       activeCount: Array.isArray(params.status) ? params.status.length : 0,
       content: (
         <ChipFilter 
           options={STATUS_OPTIONS} 
           selected={(params.status as string[]) || []} 
           onToggle={toggleStatus} 
         />
       )
     },
  ];

  // Active Filter Tags
  const renderActiveTags = () => {
      const tags = [];
      if (params.factoryId) {
          const label = factoryOptions.find(f => f.value === params.factoryId)?.label;
          tags.push(
            <Badge key="f" variant="secondary" className="gap-1 pl-2 pr-1 py-0.5">
               NM: {label}
               <button onClick={() => toggleFactory(params.factoryId!)} className="ml-1 hover:bg-muted rounded-full p-0.5" aria-label="Remove factory filter"><X className="h-3 w-3" /></button>
            </Badge>
          );
      }
      (params.status || []).forEach(s => {
          const label = STATUS_OPTIONS.find(o => o.value === s)?.label;
          tags.push(
            <Badge key={`s-${s}`} variant="secondary" className="gap-1 pl-2 pr-1 py-0.5">
               {label}
               <button onClick={() => toggleStatus(s)} className="ml-1 hover:bg-muted rounded-full p-0.5" aria-label={`Remove status filter ${label}`}><X className="h-3 w-3" /></button>
            </Badge>
          );
      });
      return tags;
  };


  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['equipments'] });
    await queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };


  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderTableContent = () => {
    if (isLoading) return <TableSkeleton rows={5} />;

    const equipments = data?.data || [];

    if (equipments.length === 0) {
      return (
        <EmptyState
          icon={<Cpu className="h-12 w-12 text-muted-foreground/50" />}
          title={params.search || activeFiltersCount > 0 ? 'Không tìm thấy kết quả' : 'Chưa có thiết bị nào'}
          description={
            params.search || activeFiltersCount > 0
              ? `Không tìm thấy thiết bị phù hợp với bộ lọc`
              : 'Bắt đầu bằng cách thêm thiết bị đầu tiên của bạn'
          }
          action={
            !(params.search || activeFiltersCount > 0)
              ? {
                  label: 'Thêm thiết bị mới',
                  onClick: () => navigate('/equipments/new'),
                  icon: <Plus className="h-4 w-4" />,
                }
              : {
                  label: 'Xóa bộ lọc',
                  onClick: clearFilters,
                  icon: <Filter className="h-4 w-4" />,
              }
          }
        />
      );
    }

    return (
      <ResponsiveTable<Equipment>
        columns={columns}
        data={equipments}
        keyExtractor={(eq) => eq.id}
        onRowClick={(eq) => navigate(`/equipments/${eq.id}`)}
        emptyMessage="Chưa có thiết bị nào"
        pageCount={data?.meta?.totalPages}
        currentPage={params.page}
        showPagination={true}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />
    );
  };

  return (
    <PageContainer>
      {/* Mobile Header */}
      {isMobile && (
        <MobilePageHeader
          title="Thiết bị"
          actions={
            <MobileButton size="sm" onClick={() => navigate('/equipments/new')}>
              <Plus className="h-5 w-5 mr-1.5" />
              Thêm
            </MobileButton>
          }
        />
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="mb-6">
          <p className="page-subtitle">QUẢN LÝ THIẾT BỊ</p>
          <div className="flex items-center justify-between">
            <h1 className="page-title">Danh sách Thiết bị</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="action-btn-secondary" onClick={() => setShowImportDialog(true)}>
                <FileSpreadsheet className="h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm" className="action-btn-secondary">
                <Download className="h-4 w-4" />
                Xuất
              </Button>
              <Button onClick={() => navigate('/equipments/new')} className="action-btn-primary">
                <Plus className="h-4 w-4" />
                Thêm Thiết bị
              </Button>
            </div>
          </div>
        </div>
      )}

      <ImportEquipmentDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog}
        onUploadStart={handleUploadStart}
      />

      {/* Stats Cards */}
      <EquipmentStats stats={statsData} isLoading={statsLoading} />

      {activeImportId && (
        <ImportProgress 
          key={activeImportId}
          jobId={activeImportId} 
          fileName={activeImportFileName || undefined}
          onClose={handleCloseImport} 
        />
      )}

      {/* Filters */}
      <MobileFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm thiết bị..."
        sections={filterSections}
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearFilters}
        activeFilterTags={renderActiveTags()}
        desktopFilters={
          <EquipmentDesktopFilters 
             searchQuery={searchQuery}
             setSearchQuery={setSearchQuery}
             filters={{
                status: params.status || [],
                factory: params.factoryId ? [params.factoryId] : []
             }}
             toggleFilter={(cat, val) => {
                 if (cat === 'status') toggleStatus(val);
                 if (cat === 'factory') toggleFactory(val);
             }}
             factoryOptions={factoryOptions}
          />
        }
      />

       {/* Table with Pull-to-Refresh */}
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

      <DeleteEquipmentDialog
         equipment={deletingEquipment}
         open={!!deletingEquipment}
         onOpenChange={(open) => !open && setDeletingEquipment(null)}
         onConfirm={() => {
             if (deletingEquipment) {
                 deleteEquipment.mutate(deletingEquipment.id, {
                     onSuccess: () => setDeletingEquipment(null)
                 });
             }
         }}
         isDeleting={deleteEquipment.isPending}
      />

    </PageContainer>
  );
}
