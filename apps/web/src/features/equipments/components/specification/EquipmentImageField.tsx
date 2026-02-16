import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateEquipmentImage } from '../../handlers/specification.handler';

interface EquipmentImageFieldProps {
    previewUrl?: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    isSubmitting: boolean;
    className?: string;
}

export const EquipmentImageField: React.FC<EquipmentImageFieldProps> = ({
    previewUrl,
    onFileChange,
    fileInputRef,
    isSubmitting,
    className
}) => {
    const handleInternalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateEquipmentImage(file)) {
            onFileChange(e);
        } else if (file) {
            e.target.value = '';
        }
    };

    return (
        <div className={cn("space-y-2 h-full flex flex-col", className)}>
            <Label className="text-sm font-medium">Hình ảnh thiết bị</Label>

            <div
                className={cn(
                    "relative flex-1 flex flex-col items-center justify-center border border-dashed rounded-md transition-all min-h-[300px] bg-muted/20",
                    !previewUrl && !isSubmitting && "cursor-pointer hover:bg-muted/30 hover:border-primary/50",
                    previewUrl && "border-border"
                )}
                onClick={() => !previewUrl && !isSubmitting && fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <div className="absolute inset-0 w-full h-full group p-1">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-sm"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                                disabled={isSubmitting}
                            >
                                <Upload className="h-4 w-4 mr-2" /> Thay đổi
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                    onFileChange({ target: { files: null } } as any);
                                }}
                                disabled={isSubmitting}
                            >
                                <X className="h-4 w-4 mr-2" /> Xóa
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center p-6 space-y-2">
                        <div className="text-muted-foreground/40">
                            <ImageIcon className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Chọn hình ảnh</p>
                            <p className="text-xs text-muted-foreground">Kéo thả hoặc nhấp để tải lên</p>
                        </div>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleInternalFileChange}
                    aria-label="Tải lên hình ảnh thiết bị"
                    title="Tải lên hình ảnh thiết bị"
                    disabled={isSubmitting}
                />
            </div>
        </div>
    );
};
