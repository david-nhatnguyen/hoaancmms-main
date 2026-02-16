import { toast } from 'sonner';

/**
 * Validates the uploaded file for size and type
 * @param file The file to validate
 * @param maxSizeInMB Maximum allowed size in MB
 * @returns boolean true if valid, false otherwise
 */
export const validateEquipmentImage = (
    file: File | null,
    maxSizeInMB: number = 5
): boolean => {
    if (!file) return false;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        toast.error('Định dạng tệp không hợp lệ. Vui lòng sử dụng JPG, PNG hoặc WEBP.');
        return false;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        toast.error(`Dung lượng tệp quá lớn. Tối đa là ${maxSizeInMB}MB.`);
        return false;
    }

    return true;
};

/**
 * Formats dimension string for display/storage
 * @param dimension Raw dimension string
 * @returns Cleaned dimension string
 */
export const formatDimension = (dimension: string): string => {
    return dimension.trim().toUpperCase();
};
