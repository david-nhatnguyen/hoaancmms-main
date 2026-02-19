/**
 * Equipment ImportProgress
 *
 * Combines the shared useImportProgress hook with the shared ImportProgress
 * component, pre-configured for the equipment entity.
 */
import { ImportProgress, useImportProgress } from '@/components/shared/import';
import { equipmentsApi } from '@/api/endpoints/equipments.api';

interface EquipmentImportProgressProps {
  jobId: string;
  fileName?: string;
  onClose: () => void;
}

export function EquipmentImportProgress({
  jobId,
  fileName,
  onClose,
}: EquipmentImportProgressProps) {
  const { progress, history } = useImportProgress({
    jobId,
    getStatus: (id) => equipmentsApi.getImportStatus(id) as any,
    invalidateKeys: ['equipments', 'equipment-stats'],
    storagePrefix: 'equipment_import',
    messages: {
      success: 'Import thiết bị thành công!',
      warning: (n) => `Hoàn tất: ${n} thiết bị lỗi`,
    },
  });

  return (
    <ImportProgress
      progress={progress}
      history={history}
      fileName={fileName}
      onClose={onClose}
      importingLabel="Đang nhập thiết bị"
      successMessage={(total) => `Tuyệt vời! Toàn bộ ${total} thiết bị đã được nhập thành công.`}
    />
  );
}
