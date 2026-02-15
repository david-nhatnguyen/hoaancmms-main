
import { z } from 'zod';

export const factoryFormSchema = z.object({
    code: z.string()
        .min(1, 'Mã nhà máy không được để trống')
        .max(50, 'Mã nhà máy không được quá 50 ký tự'),
    name: z.string()
        .min(1, 'Tên nhà máy không được để trống')
        .max(255, 'Tên nhà máy không được quá 255 ký tự'),
    location: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type FactoryFormData = z.infer<typeof factoryFormSchema>;

export interface FactoryFormErrors {
    code?: string;
    name?: string;
    location?: string;
    status?: string;
}

/**
 * Validates factory form data and returns errors if any
 * @param data - Form data to validate
 * @returns Object containing error messages for each field
 */
export const validateFactoryForm = (data: FactoryFormData): FactoryFormErrors => {
    try {
        factoryFormSchema.parse(data);
        return {};
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: FactoryFormErrors = {};
            error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof FactoryFormErrors;
                errors[field] = issue.message;
            });
            return errors;
        }
        return {};
    }
};

/**
 * Trims whitespace from factory form data
 * @param data - Raw form data
 * @returns Cleaned form data
 */
export const sanitizeFactoryData = (data: FactoryFormData): FactoryFormData => {
    return {
        ...data,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        location: data.location?.trim() || '',
    };
};
