
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { ChecklistFormValues } from '@/features/checklists/hooks/useChecklistForm';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MobileChecklistItemProps {
  index: number;
  form: UseFormReturn<ChecklistFormValues>;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  totalItems: number;
}

export const MobileChecklistItem = ({
  index,
  form,
  onRemove,
  onMoveUp,
  onMoveDown,
  totalItems
}: MobileChecklistItemProps) => {
  return (
    <Card className="mb-4 bg-muted/20 border-border/60">
      <CardHeader className="p-4 bg-muted/40 flex flex-row items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
            #{index + 1}
          </span>
          <span className="font-medium text-sm">Hạng mục {index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => onMoveDown(index)}
            disabled={index === totalItems - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove(index)}
            disabled={totalItems <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Maintenance Task */}
        <FormField
          control={form.control}
          name={`items.${index}.maintenanceTask`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                Hạng mục bảo dưỡng <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nội dung hạng mục..."
                  {...field}
                  className={cn(
                    "min-h-[60px] text-sm resize-none focus-visible:ring-1",
                    form.formState.errors.items?.[index]?.maintenanceTask && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Standard */}
          <FormField
            control={form.control}
            name={`items.${index}.judgmentStandard`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Tiêu chuẩn phán định</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tiêu chuẩn..."
                    {...field}
                    className="min-h-[50px] text-sm resize-none focus-visible:ring-1"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Method */}
          <FormField
            control={form.control}
            name={`items.${index}.inspectionMethod`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Phương pháp kiểm tra</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Phương pháp..."
                    {...field}
                    className="min-h-[50px] text-sm resize-none focus-visible:ring-1"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* maintenanceContent */}
          <FormField
            control={form.control}
            name={`items.${index}.maintenanceContent`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Nội dung chi tiết bảo dưỡng</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nội dung chi tiết bảo dưỡng..."
                    {...field}
                    className="min-h-[50px] text-sm resize-none focus-visible:ring-1"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Expected Result */}
          <FormField
            control={form.control}
            name={`items.${index}.expectedResult`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Kết quả mong đợi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Kết quả..."
                    {...field}
                    className="min-h-[50px] text-sm resize-none focus-visible:ring-1"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Configuration Flags - Row Layout on Mobile */}
        <div className="pt-2 border-t border-border/40">
          <span className="text-xs font-semibold uppercase text-muted-foreground mb-3 block">Cấu hình</span>
          <div className="grid grid-cols-3 gap-2">
            <FormField
              control={form.control}
              name={`items.${index}.isRequired`}
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center space-y-1 p-2 rounded border border-border/40 bg-background hover:bg-muted/40 transition-colors">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                  </FormControl>
                  <span className="text-[10px] text-center w-full truncate text-muted-foreground font-medium cursor-default">Bắt buộc</span>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`items.${index}.requiresImage`}
              render={({ field }) => (
                <FormItem className="flex flex-col items-center justify-center space-y-1 p-2 rounded border border-border/40 bg-background hover:bg-muted/40 transition-colors">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                  </FormControl>
                  <span className="text-[10px] text-center w-full truncate text-muted-foreground font-medium cursor-default">Yêu cầu ảnh</span>
                </FormItem>
              )}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
