import { useMemo, ReactNode } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Eye, 
  Pencil, 
  Copy, 
  Ban, 
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { 
  ChecklistTemplate, 
  ChecklistStatus, 
  ChecklistCycle,
  CYCLE_LABELS,
  STATUS_LABELS 
} from '../types/checklist.types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { EquipmentQuickView } from '../components/EquipmentQuickView';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface UseChecklistColumnsOptions {
  onView: (template: ChecklistTemplate) => void;
  onEdit: (template: ChecklistTemplate) => void;
  onCopy: (template: ChecklistTemplate) => void;
  onDeactivate: (template: ChecklistTemplate) => void;
  onDelete: (template: ChecklistTemplate) => void;
}

export function useChecklistColumns({
  onView,
  onEdit,
  onCopy,
  onDeactivate,
  onDelete,
}: UseChecklistColumnsOptions) {
  const columns = useMemo<(ColumnDef<ChecklistTemplate> & {
    key: string;
    render: (item: ChecklistTemplate) => ReactNode;
    mobilePriority?: 'primary' | 'secondary' | 'metadata';
    width?: string;
    align?: 'left' | 'center' | 'right';
  })[]>(() => [
    {
      id: "select",
      key: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
    },
    {
      accessorKey: 'code',
      key: 'code',
      header: 'Mã',
      cell: ({ row }) => (
        <Link 
          to={`/checklists/${row.original.id}`}
          className="font-mono font-medium text-primary uppercase hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.getValue('code')}
        </Link>
      ),
      render: (t) => (
        <Link 
          to={`/checklists/${t.id}`}
          className="font-mono font-medium text-primary uppercase"
          onClick={(e) => e.stopPropagation()}
        >
          {t.code}
        </Link>
      ),
      mobilePriority: 'primary',
    },
    {
      accessorKey: 'name',
      key: 'name',
      header: 'Tên checklist',
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[250px]">
          <span className="font-medium truncate" title={row.original.name}>
            {row.original.name}
          </span>
          {row.original.description && (
             <span className="text-[11px] text-muted-foreground truncate" title={row.original.description}>
               {row.original.description}
             </span>
          )}
        </div>
      ),
      render: (t) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {t.name}
          </span>
          {t.description && (
             <span className="text-[11px] text-muted-foreground truncate">
               {t.description}
             </span>
          )}
        </div>
      ),
      mobilePriority: 'secondary',
    },
    {
      id: 'equipment',
      key: 'equipment',
      header: 'Thiết bị áp dụng',
      accessorFn: (row) => row.equipment?.name,
      cell: ({ row }) => {
        const equipment = row.original.equipment;
        if (!equipment) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="max-w-[180px] truncate">
            <EquipmentQuickView equipment={equipment} isCompact showImage={false} />
          </div>
        );
      },
      render: (t) => {
        if (!t.equipment) return <span className="text-muted-foreground">—</span>;
        return <EquipmentQuickView equipment={t.equipment} isCompact showImage={false} />;
      },
    },

    {
      accessorKey: 'department',
      key: 'department',
      header: 'Bộ phận sử dụng',
      cell: ({ row }) => (
        <div 
          className="text-sm truncate max-w-[150px]" 
          title={row.original.department || ''}
        >
          {row.original.department || '—'}
        </div>
      ),
      render: (t) => (
        <span className="text-sm">
          {t.department || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'cycle',
      key: 'cycle',
      header: () => <div className="text-center">Chu kỳ</div>,
      cell: ({ row }) => {
        const cycle = row.getValue('cycle') as ChecklistCycle;
        return (
          <div className="flex justify-center">
            <span className="px-2 py-1 rounded-md bg-secondary text-[11px] font-medium whitespace-nowrap">
              {CYCLE_LABELS[cycle]}
            </span>
          </div>
        );
      },
      render: (t) => (
        <span className="px-2 py-1 rounded-md bg-secondary text-[11px] font-medium whitespace-nowrap">
          {CYCLE_LABELS[t.cycle]}
        </span>
      ),
    },
    {
      accessorKey: 'version',
      key: 'version',
      header: () => <div className="text-center">Phiên bản</div>,
      cell: ({ row }) => (
        <div className="text-center font-mono text-xs text-muted-foreground">
          v{row.getValue('version')}
        </div>
      ),
      render: (t) => (
        <span className="font-mono text-xs text-muted-foreground">
          v{t.version}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      key: 'status',
      header: () => <div className="text-center">Trạng thái</div>,
      cell: ({ row }) => {
        const status = row.getValue('status') as ChecklistStatus;
        const styles = {
          [ChecklistStatus.DRAFT]: 'bg-muted text-muted-foreground',
          [ChecklistStatus.ACTIVE]: 'bg-status-active/20 text-[hsl(var(--status-active))]',
          [ChecklistStatus.INACTIVE]: 'bg-status-inactive/20 text-[hsl(var(--status-inactive))]',
        };
        return (
          <div className="flex justify-center min-w-[80px]">
            <span className={cn('status-badge text-[10px]', styles[status])}>
              {STATUS_LABELS[status]}
            </span>
          </div>
        );
      },
      render: (t) => {
        const styles = {
          [ChecklistStatus.DRAFT]: 'bg-muted text-muted-foreground',
          [ChecklistStatus.ACTIVE]: 'bg-status-active/20 text-[hsl(var(--status-active))]',
          [ChecklistStatus.INACTIVE]: 'bg-status-inactive/20 text-[hsl(var(--status-inactive))]',
        };
        return (
          <span className={cn('status-badge text-[10px]', styles[t.status])}>
            {STATUS_LABELS[t.status]}
          </span>
        );
      },
    },
    {
      id: 'actions',
      key: 'actions',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="text-right" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => onView(template)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy(template)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép
                </DropdownMenuItem>
                {template.status === ChecklistStatus.ACTIVE && (
                  <DropdownMenuItem 
                    onClick={() => onDeactivate(template)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Ngừng sử dụng
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(template)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      render: () => null,
    },
  ], [onView, onEdit, onCopy, onDeactivate, onDelete]);

  return { columns };
}
