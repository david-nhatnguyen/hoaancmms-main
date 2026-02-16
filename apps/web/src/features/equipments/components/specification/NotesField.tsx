import React from 'react';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface NotesFieldProps {
    form: UseFormReturn<any>;
    name: string;
    label: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const NotesField: React.FC<NotesFieldProps> = ({
    form,
    name,
    label,
    placeholder,
    disabled = false,
    className
}) => {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder={placeholder}
                            className="min-h-[100px] resize-none"
                            {...field}
                            value={field.value || ''}
                            disabled={disabled}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
