import { useState, useEffect } from "react";
import { Layers, Save, Loader2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PermissionModuleWithCount } from "@/features/roles/api/roles.api";

export interface ModuleFormData {
  id: string;
  name: string;
  description: string;
  sortOrder: string;
}

const EMPTY_FORM: ModuleFormData = { id: "", name: "", description: "", sortOrder: "" };

interface ModuleDialogProps {
  open: boolean;
  onClose: () => void;
  editingModule: PermissionModuleWithCount | null;
  onSubmit: (data: ModuleFormData) => void;
  isSaving: boolean;
}

export function ModuleDialog({
  open,
  onClose,
  editingModule,
  onSubmit,
  isSaving,
}: ModuleDialogProps) {
  const isEdit = Boolean(editingModule);
  const [form, setForm] = useState<ModuleFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ModuleFormData>>({});

  // Re-populate when open or editingModule changes
  useEffect(() => {
    if (open) {
      if (editingModule) {
        setForm({
          id: editingModule.id,
          name: editingModule.name,
          description: editingModule.description ?? "",
          sortOrder: String(editingModule.sortOrder),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, editingModule]);

  const validate = (): boolean => {
    const errs: Partial<ModuleFormData> = {};
    if (!form.id.trim()) errs.id = "Bắt buộc nhập ID";
    else if (!/^[a-z0-9-]+$/.test(form.id)) errs.id = "Chỉ dùng chữ thường, số và dấu gạch ngang";
    if (!form.name.trim()) errs.name = "Bắt buộc nhập tên";
    if (form.sortOrder && isNaN(Number(form.sortOrder))) errs.sortOrder = "Phải là số";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const update = (field: keyof ModuleFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            {isEdit ? "Chỉnh sửa Module" : "Tạo Module mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật tên, mô tả hoặc thứ tự hiển thị"
              : "Module là một nhóm chức năng để gán quyền cho vai trò"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* ID — readonly in edit mode */}
          <div className="space-y-1.5">
            <Label htmlFor="mod-id">
              ID (định danh) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mod-id"
              value={form.id}
              onChange={(e) => update("id", e.target.value.toLowerCase())}
              placeholder="vd: asset, work-order"
              className={cn("font-mono h-9", errors.id && "border-destructive")}
              disabled={isEdit}
            />
            {errors.id && <p className="text-xs text-destructive">{errors.id}</p>}
            {!isEdit && (
              <p className="text-[11px] text-muted-foreground">
                Chỉ dùng chữ thường, số và dấu <code>-</code>. Không thể thay đổi sau khi tạo.
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="mod-name">
              Tên hiển thị <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mod-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="vd: Quản lý tài sản"
              className={cn("h-9", errors.name && "border-destructive")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="mod-desc">Mô tả</Label>
            <Textarea
              id="mod-desc"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Mô tả ngắn về module này..."
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <Label htmlFor="mod-order" className="flex items-center gap-1.5">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              Thứ tự hiển thị
            </Label>
            <Input
              id="mod-order"
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", e.target.value)}
              placeholder="Tự động nếu để trống"
              className={cn("h-9 w-32", errors.sortOrder && "border-destructive")}
            />
            {errors.sortOrder && <p className="text-xs text-destructive">{errors.sortOrder}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving} className="action-btn-primary">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEdit ? "Lưu thay đổi" : "Tạo module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
