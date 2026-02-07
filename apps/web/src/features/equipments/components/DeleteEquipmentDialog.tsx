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
import type { Equipment } from "@/api/types/equipment.types";

export interface DeleteEquipmentDialogProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteEquipmentDialog({
  equipment,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteEquipmentDialogProps) {
  if (!equipment) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa Thiết bị?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa thiết bị{' '}
            <span className="font-semibold text-foreground">
              {equipment.code} - {equipment.name}
            </span>
            ?
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
              "Xóa Thiết bị"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
