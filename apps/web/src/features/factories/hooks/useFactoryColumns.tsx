import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, MapPin, Settings2, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
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
  columns: (ColumnDef<Factory> & {
    key: string;
    render: (item: Factory) => React.ReactNode;
    mobilePriority?: 'primary' | 'secondary' | 'metadata';
    width?: string;
    align?: 'left' | 'center' | 'right';
    truncate?: boolean;
    tooltip?: boolean;
  })[];
}

// ============================================================================
// HOOK
// ============================================================================

// Default handler
const NOOP = () => { };

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
      navigate(`/equipments?factoryId=${id}`);
    });
  }, [onViewEquipments, navigate]);

  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns = useMemo<UseFactoryColumnsReturn['columns']>(() => [
    // Select Column
    {
      id: "select",
      key: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
    // Code Column
    {
      accessorKey: 'code',
      header: "Mã nhà máy",
      size: 120,
      cell: ({ row }) => (
        <span className="font-mono font-medium text-primary">
          {row.original.code}
        </span>
      ),
      // For ResponsiveTable
      key: 'code',
      render: (factory) => (
        <span className="font-mono font-medium text-primary">
          {factory.code}
        </span>
      ),
      mobilePriority: 'primary',
      width: 'w-[120px]',
    },

    // Name Column
    {
      accessorKey: 'name',
      header: "Tên nhà máy",
      size: 200,
      minSize: 150,
      cell: ({ row }) => (
        <span className="font-medium truncate max-w-[200px]" title={row.original.name}>
          {row.original.name}
        </span>
      ),
      // For ResponsiveTable
      key: 'name',
      render: (factory) => (
        <span className="font-medium">{factory.name}</span>
      ),
      mobilePriority: 'secondary',
    },

    // Location Column
    {
      accessorKey: 'location',
      header: "Địa điểm",
      size: 150,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-muted-foreground max-w-[200px]" title={row.original.location || ''}>
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{row.original.location || '-'}</span>
        </div>
      ),
      // For ResponsiveTable
      key: 'location',
      render: (factory) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {factory.location || '-'}
        </div>
      ),
      mobilePriority: 'metadata',
    },

    // Equipment Count Column
    {
      accessorKey: 'equipmentCount',
      header: "Số lượng TB",
      tooltip: false,
      truncate: false,
      size: 100,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          {row.original.equipmentCount}
        </span>
      ),
      // For ResponsiveTable
      key: 'equipmentCount',
      render: (factory) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          {factory.equipmentCount}
        </span>
      ),
      mobilePriority: 'metadata',
      align: 'center',
    },

    // Status Column
    {
      accessorKey: 'status',
      header: "Trạng thái",
      size: 120,
      tooltip: false,
      truncate: false,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      // For ResponsiveTable
      key: 'status',
      render: (factory) => <StatusBadge status={factory.status} />,
      align: 'center',
    },

    {
      id: 'actions',
      key: 'actions',
      truncate: false,
      size: 50,
      cell: ({ row }) => {
        const factory = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewEquipments(factory.id)}>
                <Settings2 className="mr-2 h-4 w-4" /> Xem thiết bị
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(factory)}>
                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(factory)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      render: () => null,
    },
  ], [handleEdit, handleViewEquipments, handleDelete]);

  return { columns };
}
