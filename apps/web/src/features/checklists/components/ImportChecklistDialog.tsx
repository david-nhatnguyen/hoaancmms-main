/**
 * ImportChecklistDialog
 *
 * Thin wrapper around the shared <ImportDialog /> component,
 * pre-configured with Checklist-specific API functions.
 */
import { ImportDialog, type ImportDialogProps } from '@/components/shared/import';
import { checklistTemplatesApi } from '@/features/checklists/api/checklist-templates.api';

type Props = Omit<ImportDialogProps, 'config'>;

export function ImportChecklistDialog({ open, onOpenChange, onUploadStart }: Props) {
    return (
        <ImportDialog
            open={open}
            onOpenChange={onOpenChange}
            onUploadStart={onUploadStart}
            config={{
                entityName: 'Checklist',
                templateFileName: 'checklist_import_template.xlsx',
                importFn: (file) => checklistTemplatesApi.importExcel(file),
                getTemplateFn: () => checklistTemplatesApi.getTemplate(),
            }}
        />
    );
}
