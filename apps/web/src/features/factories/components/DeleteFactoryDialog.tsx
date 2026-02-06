import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { Factory } from "@/api/types/factory.types";

export interface DeleteFactoryDialogProps {
  factory: Factory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteFactoryDialog({
  factory,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteFactoryDialogProps) {
  if (!factory) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa Nhà máy?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa nhà máy{' '}
            <span className="font-semibold text-foreground">
              {factory.code} - {factory.name}
            </span>
            ?
          </AlertDialogDescription>
          
          {factory.equipmentCount > 0 ? (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 mt-2">
              <p className="font-semibold flex items-center gap-2">
                ⚠️ Cảnh báo
              </p>
              <p className="mt-1">
                Nhà máy này đang có{' '}
                <span className="font-bold">{factory.equipmentCount}</span>{' '}
                thiết bị.
              </p>
              <p className="mt-1">
                Việc xóa nhà máy sẽ làm mất liên kết với các thiết bị này.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">Hành động này không thể hoàn tác.</p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa Nhà máy"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
