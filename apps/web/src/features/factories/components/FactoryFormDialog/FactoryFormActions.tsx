
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface FactoryFormActionsProps {
    onSave: () => void;
    onCancel?: () => void;
    isSaving: boolean;
    canSubmit: boolean;
    isEditMode: boolean;
    className?: string;
    isMobile?: boolean;
}

/**
 * Action buttons for the factory form
 */
export function FactoryFormActions({
    onSave,
    onCancel,
    isSaving,
    canSubmit,
    isEditMode,
    className,
    isMobile
}: FactoryFormActionsProps) {
    return (
        <div className={cn(
            "flex gap-3",
            isMobile ? "w-full pt-4 pb-2" : "mt-6",
            className
        )}>
            {onCancel && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSaving}
                    className={cn(isMobile ? "flex-1 h-12 text-base font-medium" : "flex-1")}
                >
                    Hủy
                </Button>
            )}
            <Button
                type="button"
                onClick={onSave}
                disabled={!canSubmit || isSaving}
                className={cn(
                    isMobile ? "flex-2 h-12 text-base font-medium shadow-lg px-8" : "flex-1",
                    "transition-all active:scale-95"
                )}
            >
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                    </>
                ) : (
                    isEditMode ? 'Lưu thay đổi' : 'Thêm nhà máy'
                )}
            </Button>
        </div>
    );
}
