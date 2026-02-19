/**
 * ImportChecklistProgress
 *
 * Combines the shared useImportProgress hook with the shared ImportProgress
 * component, pre-configured for the Checklist entity.
 */
import { ImportProgress, useImportProgress } from '@/components/shared/import';
import { checklistTemplatesApi } from '@/features/checklists/api/checklist-templates.api';

interface ImportChecklistProgressProps {
    jobId: string;
    fileName?: string;
    onClose: () => void;
}

export function ImportChecklistProgress({
    jobId,
    fileName,
    onClose,
}: ImportChecklistProgressProps) {
    const { progress, history } = useImportProgress({
        jobId,
        getStatus: (id) => checklistTemplatesApi.getImportStatus(id) as any,
        invalidateKeys: ['checklist-templates'],
        storagePrefix: 'checklist_import',
        messages: {
            success: 'Import checklist thành công!',
            warning: (n) => `Hoàn tất: ${n} checklist lỗi`,
        },
    });

    return (
        <ImportProgress
            progress={progress}
            history={history}
            fileName={fileName}
            onClose={onClose}
            importingLabel="Đang nhập checklist"
            successMessage={(total) =>
                `Tuyệt vời! Toàn bộ ${total} checklist đã được nhập thành công.`
            }
        />
    );
}
