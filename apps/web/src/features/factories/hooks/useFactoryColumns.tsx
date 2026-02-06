import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Eye, MapPin, Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Column } from '@/components/shared/ResponsiveTable';
import type { Factory } from '@/api/types/factory.types';

// ============================================================================
// TYPES
// ============================================================================

export interface UseFactoryColumnsOptions {
  onEdit?: (factory: Factory) => void;
  onViewEquipments?: (factoryId: string) => void;
  onDelete?: (factory: Factory) => void;
}

export interface UseFactoryColumnsReturn {
  columns: Column<Factory>[];
}

// ============================================================================
// HOOK
// ============================================================================

// Default handler
const NOOP = () => {};

/**
 * Custom hook for factory table column definitions
 * 
 * @param options - Callbacks for column actions
 * @returns Table column configuration
 * 
 * @example
 * ```tsx
 * const { columns } = useFactoryColumns({
 *   onEdit: (factory) => openEditDialog(factory),
 *   onViewEquipments: (id) => navigate(`/equipments?factory=${id}`)
 * });
 * 
 * <ResponsiveTable columns={columns} data={factories} />
 * ```
 */
export function useFactoryColumns(
  options: UseFactoryColumnsOptions = {}
): UseFactoryColumnsReturn {
  const { onEdit, onViewEquipments, onDelete } = options;
  const navigate = useNavigate();

  // Default handlers
  const handleEdit = onEdit || NOOP;
  const handleDelete = onDelete || NOOP;
  
  // Create stable default view handler if one isn't provided
  // We cannot use useMemo effectively here because we can't conditionally call hooks.
  // But we can depend on "navigate".
  // Best approach: Define the default logic inside the actions render or memoize properly.
  // However, simplest fix for Lint is to make the dependency stable.
  
  const handleViewEquipments = useMemo(() => {
    return onViewEquipments || ((id: string) => {
       navigate(`/equipments?factory=${id}`);
    });
  }, [onViewEquipments, navigate]);

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns = useMemo<Column<Factory>[]>(() => [
    // Code Column
    {
      key: 'code',
      header: 'Mã nhà máy',
      isPrimary: true,
      width: 'w-[120px]',
      render: (factory) => (
        <span className="font-mono font-medium text-primary">
          {factory.code}
        </span>
      ),
    },

    // Name Column
    {
      key: 'name',
      header: 'Tên nhà máy',
      isSecondary: true,
      render: (factory) => (
        <span className="font-medium">{factory.name}</span>
      ),
    },

    // Location Column
    {
      key: 'location',
      header: 'Địa điểm',
      render: (factory) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {factory.location || '-'}
        </div>
      ),
      mobileRender: (factory) => factory.location || '-',
    },

    // Equipment Count Column
    {
      key: 'equipmentCount',
      header: 'Số lượng TB',
      align: 'center',
      render: (factory) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          {factory.equipmentCount}
        </span>
      ),
      mobileRender: (factory) => factory.equipmentCount,
    },

    // Status Column
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (factory) => <StatusBadge status={factory.status} />,
      mobileRender: (factory) => <StatusBadge status={factory.status} />,
    },

    // Actions Column
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (factory) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(factory);
            }}
            className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-500 rounded-full transition-colors"
            title="Sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(factory);
            }}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      mobileRender: (factory) => (
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewEquipments(factory.id);
            }}
            className="w-full flex items-center justify-center gap-2 border-primary/20 text-primary hover:bg-primary/5 dark:border-primary/30"
          >
            <Eye className="h-4 w-4" />
            <span>Xem TB</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(factory);
            }}
            className="w-full flex items-center justify-center gap-2 border-orange-500/20 text-orange-600 hover:bg-orange-500/5 dark:text-orange-400 dark:border-orange-500/30"
          >
            <Pencil className="h-4 w-4" />
            <span>Sửa</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(factory);
            }}
            className="w-full flex items-center justify-center gap-2 border-destructive/20 text-destructive hover:bg-destructive/5 dark:border-destructive/30"
          >
            <Trash2 className="h-4 w-4" />
            <span>Xóa</span>
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleViewEquipments, handleDelete]);

  return { columns };
}
