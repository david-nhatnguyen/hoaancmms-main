import { describe, it, expect, vi } from 'vitest';
import { validateEquipmentImage, formatDimension } from './specification.handler';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe('specification.handler', () => {
    describe('validateEquipmentImage', () => {
        it('should return false if no file is provided', () => {
            expect(validateEquipmentImage(null)).toBe(false);
        });

        it('should return true for valid images', () => {
            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
            // Mock size as well
            Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
            expect(validateEquipmentImage(file)).toBe(true);
        });

        it('should return false and toast error for invalid types', () => {
            const file = new File([''], 'test.txt', { type: 'text/plain' });
            expect(validateEquipmentImage(file)).toBe(false);
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Định dạng tệp không hợp lệ'));
        });

        it('should return false and toast error for large files', () => {
            const file = new File([''], 'large.jpg', { type: 'image/jpeg' });
            Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 }); // 6MB
            expect(validateEquipmentImage(file, 5)).toBe(false);
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Dung lượng tệp quá lớn'));
        });
    });

    describe('formatDimension', () => {
        it('should trim and uppercase dimension string', () => {
            expect(formatDimension(' 2000x1500x1800 mm ')).toBe('2000X1500X1800 MM');
        });
    });
});
