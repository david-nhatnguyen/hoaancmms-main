import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Atomic Components (Molecules)
import { EquipmentImageField } from './specification/EquipmentImageField';
import { SpecificationInput } from './specification/SpecificationInput';
import { NotesField } from './specification/NotesField';

interface EquipmentSpecificationSectionProps {
    form: UseFormReturn<any>;
    isSubmitting: boolean;
    previewUrl?: string | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export function EquipmentSpecificationSection({
    form,
    isSubmitting,
    previewUrl,
    handleFileChange,
    fileInputRef
}: EquipmentSpecificationSectionProps) {
    return (
        <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Settings2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-lg">Thông số kỹ thuật & Hình ảnh</CardTitle>
                        <p className="text-sm text-muted-foreground">Chi tiết kỹ thuật và hình ảnh minh họa thiết bị</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column: Form Fields */}
                    <div className="md:col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SpecificationInput
                            form={form}
                            name="brand"
                            label="Hãng sản xuất"
                            placeholder="VD: Doosan, Fanuc..."
                            disabled={isSubmitting}
                        />

                        <SpecificationInput
                            form={form}
                            name="origin"
                            label="Xuất xứ"
                            placeholder="VD: Nhật Bản, Hàn Quốc..."
                            disabled={isSubmitting}
                        />

                        <SpecificationInput
                            form={form}
                            name="modelYear"
                            label="Năm sản xuất"
                            placeholder="VD: 2024"
                            type="number"
                            disabled={isSubmitting}
                        />

                        <SpecificationInput
                            form={form}
                            name="dimension"
                            label="Kích thước (D x R x C)"
                            placeholder="VD: 2000x1500x1800 mm"
                            disabled={isSubmitting}
                        />

                        {/* Notes - Full Width on md */}
                        <NotesField
                            form={form}
                            name="notes"
                            label="Ghi chú & Lưu ý vận hành"
                            placeholder="Nhập các lưu ý đặc biệt về thiết bị..."
                            disabled={isSubmitting}
                            className="md:col-span-2"
                        />
                    </div>

                    {/* Right Column: Image Upload */}
                    <div className="md:col-span-12 lg:col-span-4">
                        <EquipmentImageField
                            previewUrl={previewUrl}
                            onFileChange={handleFileChange}
                            fileInputRef={fileInputRef}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
