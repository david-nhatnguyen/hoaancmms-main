import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STATUS_OPTIONS } from '@/features/equipments/hooks';
import { FactorySelector } from '@/features/factories/components/FactorySelector';

interface EquipmentIdentitySectionProps {
    form: UseFormReturn<any>;
    isSubmitting: boolean;
    factoriesList: any[];
    isLoadingFactories: boolean;
}

export function EquipmentIdentitySection({
    form,
    isSubmitting,
    factoriesList,
    isLoadingFactories
}: EquipmentIdentitySectionProps) {
    return (
        <Card className="border border-border/60 shadow-sm bg-card">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Cpu className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-lg">Thông tin định danh</CardTitle>
                        <p className="text-sm text-muted-foreground">Các thông tin cơ bản và tình trạng thiết bị</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mã thiết bị <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="VD: EQ-001" className="font-mono" {...field} value={field.value || ''} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category */}
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chủng loại máy <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="VD: Máy phay" {...field} value={field.value || ''} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên thiết bị <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="VD: Máy phay CNC Doosan..." {...field} value={field.value || ''} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Status */}
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Trạng thái</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {STATUS_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <span className={cn("h-2 w-2 rounded-full",
                                                    opt.value === 'ACTIVE' ? "bg-emerald-500" :
                                                        opt.value === 'MAINTENANCE' ? "bg-amber-500" : "bg-slate-300"
                                                )} />
                                                {opt.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Factory */}
                <FormField
                    control={form.control}
                    name="factoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nhà máy quản lý</FormLabel>
                            <FormControl>
                                <FactorySelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    factories={factoriesList}
                                    isLoading={isLoadingFactories}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Quantity */}
                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Số lượng</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min={1}
                                        className="pr-10"
                                        {...field}
                                        value={field.value}
                                        disabled={isSubmitting}
                                    />
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
                                        Cái
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
