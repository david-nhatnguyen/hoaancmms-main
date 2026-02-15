
import { UseFormReturn } from 'react-hook-form';
import { ClipboardList } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EquipmentSearchInput } from '@/features/checklists/components/EquipmentSearchInput';
import { ChecklistCycle, ChecklistStatus, CYCLE_LABELS, STATUS_LABELS } from '@/features/checklists/types/checklist.types';
import { ChecklistFormValues } from '@/features/checklists/hooks/useChecklistForm';

interface ChecklistGeneralInfoProps {
  form: UseFormReturn<ChecklistFormValues>;
}


export function ChecklistGeneralInfo({ form }: ChecklistGeneralInfoProps) {
  return (
    <Card className="border border-border/60 shadow-sm bg-card transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
            <p className="text-sm text-muted-foreground">Các thông tin chung và bối cảnh lập checklist</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Zone 1: Identity */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-8">
                <FormLabel>
                  Tên checklist <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="VD: Injection Machine – Bảo dưỡng 6 tháng" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-4">
                <FormLabel>
                  Trạng thái <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ChecklistStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Zone 2: Scope & Context (Asymmetric Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Main Entity: Equipment (8 cols) */}
          <div className="col-span-1 md:col-span-8">
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Thiết bị áp dụng <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <EquipmentSearchInput
                      value={field.value}
                      onChange={(equipment) => {
                        field.onChange(equipment);
                        form.setValue('equipmentId', equipment?.id || '');
                        if (equipment?.id) {
                          form.clearErrors('equipmentId');
                        }
                      }}
                      required
                      error={form.formState.errors.equipmentId?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Metadata Stack: Cycle & Department (4 cols) */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
            <FormField
              control={form.control}
              name="cycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Chu kỳ bảo dưỡng <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chu kỳ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ChecklistCycle).map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {CYCLE_LABELS[cycle]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bộ phận sử dụng</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Bộ phận sản xuất" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Zone 3: Details */}
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Mô tả chi tiết về quy trình checklist này..." 
                    rows={2} 
                    {...field} 
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú bổ sung</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Lưu ý đặc biệt khi thực hiện..." 
                    rows={2} 
                    {...field} 
                     className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

      </CardContent>
    </Card>
  );
}

