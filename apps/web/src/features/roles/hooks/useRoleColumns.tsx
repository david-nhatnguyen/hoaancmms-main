import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Copy, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/features/roles/types/role.types";
import { Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface UseRoleColumnsProps {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onCopy: (id: string) => void;
}

export interface UseRoleColumnsReturn {
  columns: (ColumnDef<Role> & {
    key: string;
    render: (item: Role) => React.ReactNode;
    mobilePriority?: "primary" | "secondary" | "metadata";
    width?: string;
    align?: "left" | "center" | "right";
    truncate?: boolean;
    tooltip?: boolean;
  })[];
}

export function useRoleColumns({
  onView,
  onEdit,
  onCopy,
}: UseRoleColumnsProps): UseRoleColumnsReturn {
  const columns = useMemo<UseRoleColumnsReturn["columns"]>(
    () => [
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
        enableSorting: false,
        enableHiding: false,
        width: "w-[40px]",
        align: "center",
        render: () => null,
      },
      {
        accessorKey: "name",
        key: "name",
        header: "Tên vai trò",
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  role.id === "admin" ? "bg-destructive/20" : "bg-primary/10",
                )}
              >
                <Shield
                  className={cn(
                    "h-4 w-4",
                    role.id === "admin" ? "text-destructive" : "text-primary",
                  )}
                />
              </div>
              <span className="font-medium">{role.name}</span>
            </div>
          );
        },
        render: (role) => (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                role.id === "admin" ? "bg-destructive/20" : "bg-primary/10",
              )}
            >
              <Shield
                className={cn("h-4 w-4", role.id === "admin" ? "text-destructive" : "text-primary")}
              />
            </div>
            <span className="font-medium">{role.name}</span>
          </div>
        ),
        mobilePriority: "primary",
        width: "w-[200px]",
      },
      {
        accessorKey: "description",
        key: "description",
        header: "Mô tả",
        cell: ({ row }) => {
          return (
            <span className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description || "-"}
            </span>
          );
        },
        render: (role) => (
          <span className="text-sm text-muted-foreground line-clamp-1">
            {role.description || "-"}
          </span>
        ),
        mobilePriority: "secondary",
        truncate: true,
      },
      {
        id: "userCount",
        key: "userCount",
        header: () => <div className="text-center">Người dùng</div>,
        align: "center",
        cell: ({ row }) => {
          const count = (row.original as any).userCount ?? 0;
          return (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-md">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{count}</span>
              </div>
            </div>
          );
        },
        render: (role) => {
          const count = (role as any).userCount ?? 0;
          return (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-md justify-center">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{count}</span>
            </div>
          );
        },
        mobilePriority: "metadata",
        width: "w-[120px]",
      },
      {
        accessorKey: "isSystem",
        key: "isSystem",
        header: () => <div className="text-center">Loại</div>,
        align: "center",
        cell: ({ row }) => {
          const isSystem = row.original.isSystem;
          return (
            <div className="flex justify-center w-full">
              <span
                className={cn(
                  "status-badge",
                  isSystem ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                {isSystem ? "Hệ thống" : "Tùy chỉnh"}
              </span>
            </div>
          );
        },
        render: (role) => {
          return (
            <span
              className={cn(
                "status-badge",
                role.isSystem ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground",
              )}
            >
              {role.isSystem ? "Hệ thống" : "Tùy chỉnh"}
            </span>
          );
        },
        mobilePriority: "metadata",
        width: "w-[120px]",
      },
      {
        id: "actions",
        key: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        align: "right",
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div
              className="flex items-center justify-end gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onView(role.id)}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(role.id)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Sửa"
                disabled={role.isSystem || role.id === "admin"}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCopy(role.id)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Sao chép"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          );
        },
        render: () => null, // Used row buttons on desktop, mobile uses Actions
        width: "w-[140px]",
      },
    ],
    [onView, onEdit, onCopy],
  );

  return { columns };
}
