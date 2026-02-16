import React from 'react';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface SpecificationInputProps {
    form: UseFormReturn<any>;
    name: string;
    label: string;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
}

export const SpecificationInput: React.FC<SpecificationInputProps> = ({
    form,
    name,
    label,
    placeholder,
    type = 'text',
    disabled,
    className,
    required = false
}) => {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>
                        {label} {required && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                        <Input
                            type={type}
                            placeholder={placeholder}
                            {...field}
                            value={field.value || ''}
                            disabled={disabled}
                            onChange={(e) => {
                                const value = type === 'number' ?
                                    (e.target.value === '' ? null : Number(e.target.value)) :
                                    e.target.value;
                                field.onChange(value);
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
