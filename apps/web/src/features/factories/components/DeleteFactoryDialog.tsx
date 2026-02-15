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
            {factory.id === 'bulk' ? (
              <>Bạn có chắc chắn muốn xóa <span className="font-semibold text-foreground">{factory.name}</span>?</>
            ) : (
              <>
                Bạn có chắc chắn muốn xóa nhà máy{' '}
                <span className="font-semibold text-foreground">
                  {factory.code} - {factory.name}
                </span>
                ?
              </>
            )}
          </AlertDialogDescription>
           <p className="text-sm text-muted-foreground mt-2">Hành động này không thể hoàn tác.</p>
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
