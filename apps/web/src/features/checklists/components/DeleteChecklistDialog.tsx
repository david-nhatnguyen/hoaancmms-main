import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChecklistTemplate } from '../types/checklist.types';

interface DeleteChecklistDialogProps {
  template: ChecklistTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteChecklistDialog({
  template,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteChecklistDialogProps) {
  const isBulk = template?.id === 'bulk';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBulk ? 'Xóa các checklist đã chọn?' : 'Xóa checklist này?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk 
              ? `Bạn có chắc chắn muốn xóa ${template?.name || 'các checklist'} này không? Hành động này không thể hoàn tác.`
              : `Bạn có chắc chắn muốn xóa checklist "${template?.name}" (${template?.code}) không? Hành động này không thể hoàn tác.`
            }
          </AlertDialogDescription>
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
            {isDeleting ? 'Đang xóa...' : 'Xóa checklist'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
