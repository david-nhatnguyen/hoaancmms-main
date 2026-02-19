/**
 * ImportEquipmentDialog
 *
 * Thin wrapper around the shared <ImportDialog /> component,
 * pre-configured with Equipment-specific API functions.
 */
import { ImportDialog, type ImportDialogProps } from '@/components/shared/import';
import { equipmentsApi } from '@/api/endpoints/equipments.api';

type Props = Omit<ImportDialogProps, 'config'>;

export function ImportEquipmentDialog({ open, onOpenChange, onUploadStart }: Props) {
  return (
    <ImportDialog
      open={open}
      onOpenChange={onOpenChange}
      onUploadStart={onUploadStart}
      config={{
        entityName: 'Thiết bị',
        templateFileName: 'equipment_import_template.xlsx',
        importFn: (file) => equipmentsApi.importExcel(file),
        getTemplateFn: () => equipmentsApi.getTemplate(),
      }}
    />
  );
}
