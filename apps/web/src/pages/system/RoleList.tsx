import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Copy, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";

import { PageContainer } from "@/components/shared/PageContainer";
import { ResponsivePageHeader } from "@/components/shared/layout/ResponsivePageHeader";
import { ResponsiveDataView } from "@/components/shared/layout/ResponsiveDataView";
import { EmptyState } from "@/components/shared/EmptyState";
import { ResponsiveTable } from "@/components/shared/ResponsiveTable";
import { DataTable } from "@/components/shared/table/DataTable";
import { MobileCard } from "@/components/shared/table/MobileCard";
import { MobileCardActions } from "@/components/shared/table/MobileCardActions";
import { MobileButton } from "@/components/ui/mobile-button";

import { useRoles } from "@/features/roles/hooks/useRoles";
import { useRoleTableState } from "@/features/roles/hooks/useRoleTableState";
import { useRoleColumns } from "@/features/roles/hooks/useRoleColumns";
import type { Role } from "@/features/roles/types/role.types";
import { RoleStats } from "@/features/roles/components/RoleStats";

export default function RoleList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    searchQuery,
    setSearchQuery,
    rowSelection,
    setRowSelection,
    selectedIds,
    pagination,
    setPagination,
  } = useRoleTableState();

  const { data: roles = [], isLoading } = useRoles();

  const { columns } = useRoleColumns({
    onView: (id: string) => navigate(`/system/roles/${id}`),
    onEdit: (id: string) => navigate(`/system/roles/${id}/edit`),
    onCopy: () => {
      // Handle copy logic if needed, maybe a toast or modal
    },
  });

  // Compute basic stats similarly to how the API would
  const systemRoles = roles.filter((r) => r.isSystem);
  const customRoles = roles.filter((r) => !r.isSystem);

  return (
    <PageContainer>
      {/* ── Page Header ── */}
      <ResponsivePageHeader
        title="Vai trò & Phân quyền"
        subtitle="HỆ THỐNG"
        mobileActions={
          <MobileButton size="sm" onClick={() => navigate("/system/roles/new")}>
            <Plus className="h-5 w-5 mr-1.5" />
            Thêm
          </MobileButton>
        }
        desktopActions={
          <>
            <Button variant="outline" className="action-btn-secondary">
              <Copy className="h-4 w-4" />
              Sao chép mẫu
            </Button>
            <Button onClick={() => navigate("/system/roles/new")} className="action-btn-primary">
              <Plus className="h-4 w-4" />
              Tạo vai trò mới
            </Button>
          </>
        }
      />

      {/* ── Stats ── */}
      <RoleStats
        total={roles.length}
        system={systemRoles.length}
        custom={customRoles.length}
        isLoading={isLoading}
      />

      {/* ── Content ── */}
      <ResponsiveDataView
        isLoading={isLoading}
        isEmpty={roles.length === 0}
        onRefresh={async () => {
          await queryClient.invalidateQueries({ queryKey: ["roles"] });
          if (window.navigator.vibrate) window.navigator.vibrate(10);
        }}
        emptyState={
          <EmptyState
            icon={<Shield className="h-12 w-12 text-muted-foreground/50" />}
            title="Chưa có vai trò nào"
            description="Bắt đầu bằng cách thêm vai trò mới."
            action={{
              label: "Tạo vai trò",
              onClick: () => navigate("/system/roles/new"),
              icon: <Plus className="h-4 w-4" />,
            }}
          />
        }
        mobileFilters={null}
        desktopFilters={null}
        mobileContent={
          <ResponsiveTable<Role>
            columns={columns}
            data={roles}
            keyExtractor={(r: Role) => r.id}
            emptyMessage="Không tìm thấy vai trò nào."
            pageCount={1}
            currentPage={pagination.pageIndex + 1}
            showPagination={false}
            selectedIds={selectedIds}
            onSelectionChange={(ids) => {
              const newSelection: RowSelectionState = {};
              ids.forEach((id) => (newSelection[id] = true));
              setRowSelection(newSelection);
            }}
            renderMobileCard={(role, cols, isSelected, toggleSelection) => {
              const nameCol = cols.find((c) => c.key === "name");
              const systemOrCustom = role.isSystem ? "Hệ thống" : "Tùy chỉnh";
              const count = (role as any).userCount ?? 0;

              return (
                <MobileCard
                  title={nameCol ? nameCol.render(role) : role.name}
                  subtitle={role.description ?? ""}
                  data={[
                    { label: "Loại", value: systemOrCustom },
                    { label: "Số N.dùng", value: String(count) },
                  ]}
                  footerActions={
                    <MobileCardActions
                      actions={[
                        {
                          key: "view",
                          label: "Xem",
                          variant: "outline",
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => navigate(`/system/roles/${role.id}`),
                        },
                        {
                          key: "edit",
                          label: "Sửa",
                          variant: "warning",
                          disabled: role.isSystem || role.id === "admin",
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => navigate(`/system/roles/${role.id}/edit`),
                        },
                      ]}
                    />
                  }
                  isSelected={isSelected}
                  onToggleSelection={toggleSelection}
                  renderSelection={false} // Selection might not be needed for single Role view if no bulk actions
                />
              );
            }}
            isLoading={isLoading}
          />
        }
        desktopContent={
          <DataTable
            columns={columns}
            data={roles}
            pageCount={1}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={(pageIndex, pageSize) => setPagination({ pageIndex, pageSize })}
            onRowSelectionChange={setRowSelection}
            rowSelection={rowSelection}
            getRowId={(row: Role) => row.id}
            searchColumn="name"
            searchPlaceholder="Tìm kiếm vai trò..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={isLoading}
          />
        }
      />

      {/* Permission Matrix Preview */}
      <div className="mt-8 hidden sm:block">
        <h2 className="text-lg font-semibold mb-4 text-foreground/90">
          Ma trận phân quyền tổng quan
        </h2>
        <div className="bg-card rounded-xl border border-border/60 p-6 text-center text-muted-foreground shadow-sm">
          <p>
            Chọn hoặc tìm kiếm một vai trò để tiến hành xem chi tiết ma trận phân quyền hệ thống
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
