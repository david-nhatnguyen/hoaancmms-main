
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FactoryFormFieldProps {
    id: string;
    label: string;
    error?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * Reusable form field wrapper with label and error message
 */
export function FactoryFormField({
    id,
    label,
    error,
    required,
    children,
    className
}: FactoryFormFieldProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Label 
                htmlFor={id} 
                className={cn(
                    "text-sm font-medium transition-colors",
                    error && "text-destructive"
                )}
            >
                {label} {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && (
                <p className="text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
}
