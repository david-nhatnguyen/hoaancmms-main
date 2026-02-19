import { UseFormReturn } from 'react-hook-form';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoveUp,
  MoveDown,
  Trash2,
  Plus,
  ListTodo
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/shared/table/DataTable';
import { ChecklistFormValues } from '@/features/checklists/hooks/useChecklistForm';
import { useChecklistItemsTable } from '@/features/checklists/hooks/useChecklistItemsTable';
import { MobileChecklistItem } from './MobileChecklistItem';

interface ChecklistItemsTableProps {
  form: UseFormReturn<ChecklistFormValues>;
  fields: any[];
  append: () => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
}

export function ChecklistItemsTable({
  form,
  fields,
  append,
  remove,
  move
}: ChecklistItemsTableProps) {

  const { isMobile, handleRemove } = useChecklistItemsTable(form, remove, move, fields);

  const columns: (ColumnDef<ChecklistFormValues['items'][0]> & { truncate?: boolean })[] = [
    {
      accessorKey: "index",
      header: () => <div className="text-center text-xs tracking-wider w-8">#</div>,
      cell: ({ row }) => <div className="text-center text-muted-foreground w-8">{row.index + 1}</div>,
      size: 40,
      truncate: false
    },
    {
      accessorKey: "maintenanceTask",
      header: () => (
        <div className="min-w-[140px] text-xs tracking-wider">
          Hạng mục bảo dưỡng <span className="text-destructive">*</span>
        </div>
      ),
      cell: ({ row }) => (
        <FormField
          control={form.control}
          name={`items.${row.index}.maintenanceTask`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <Textarea
                  placeholder="Hạng mục"
                  {...field}
                  className={cn(
                    "min-h-[60px] resize-none text-sm",
                    form.formState.errors.items?.[row.index]?.maintenanceTask && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ),
      size: 200,
    },
    {
      accessorKey: "judgmentStandard",
      header: () => <div className="text-xs tracking-wider">Tiêu chuẩn phán định</div>,
      cell: ({ row }) => (
        <FormField
          control={form.control}
          name={`items.${row.index}.judgmentStandard`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <Textarea
                  placeholder="Tiêu chuẩn"
                  {...field}
                  className="min-h-[60px] resize-none text-sm"
                />
              </FormControl>
            </FormItem>
          )}
        />
      ),
      size: 150,
    },
    {
      accessorKey: "inspectionMethod",
      header: () => <div className="text-xs tracking-wider">Phương pháp kiểm tra</div>,
      cell: ({ row }) => (
        <FormField
          control={form.control}
          name={`items.${row.index}.inspectionMethod`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <Textarea
                  placeholder="Phương pháp"
                  {...field}
                  className="min-h-[60px] resize-none text-sm"
                />
              </FormControl>
            </FormItem>
          )}
        />
      ),
      size: 150,
    },
    {
      accessorKey: "maintenanceContent",
      header: () => <div className="text-xs tracking-wider">Nội dung chi tiết bảo dưỡng</div>,
      cell: ({ row }) => (
        <FormField
          control={form.control}
          name={`items.${row.index}.maintenanceContent`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <Textarea
                  placeholder="Nội dung chi tiết bảo dưỡng"
                  {...field}
                  className="min-h-[60px] resize-none text-sm"
                />
              </FormControl>
            </FormItem>
          )}
        />
      ),
      size: 150,
    },
    {
      accessorKey: "expectedResult",
      header: () => <div className="text-xs tracking-wider">Kết quả mong đợi</div>,
      cell: ({ row }) => (
        <FormField
          control={form.control}
          name={`items.${row.index}.expectedResult`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <Textarea
                  placeholder="Kết quả mong đợi"
                  {...field}
                  className="min-h-[60px] resize-none text-sm"
                />
              </FormControl>
            </FormItem>
          )}
        />
      ),
      size: 150,
    },
    // Flags Grouped
    {
      id: 'flags',
      header: () => <div className="text-center text-xs tracking-wider w-[100px]">Cấu hình</div>,
      cell: ({ row }) => (
        <div className="flex flex-col gap-2 py-1">
          <FormField
            control={form.control}
            name={`items.${row.index}.isRequired`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="text-[10px] whitespace-nowrap text-muted-foreground w-16">Bắt buộc</div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`items.${row.index}.requiresImage`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="text-[10px] whitespace-nowrap text-muted-foreground w-16">Yêu cầu ảnh</div>
              </FormItem>
            )}
          />
        </div>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: () => <div className="text-right text-xs tracking-wider w-24">Thao tác</div>,
      cell: ({ row }) => (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className='flex gap-1'>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground group-hover:text-foreground"
              title="Di chuyển lên"
              onClick={() => move(row.index, row.index - 1)}
              disabled={row.index === 0}
            >
              <MoveUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground group-hover:text-foreground"
              title="Di chuyển xuống"
              onClick={() => move(row.index, row.index + 1)}
              disabled={row.index === fields.length - 1}
            >
              <MoveDown className="h-3 w-3" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive mt-1"
            title="Xóa hạng mục này"
            onClick={() => handleRemove(row.index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      truncate: false
    },
  ];

  return (
    <Card className="border border-border/60 shadow-sm bg-card transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40 space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <ListTodo className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <CardTitle className="text-lg">Danh sách hạng mục kiểm tra</CardTitle>
            <p className="text-sm text-muted-foreground">Định nghĩa các nội dung bảo dưỡng cụ thể</p>
          </div>
        </div>
        {!isMobile && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={append}
            className="h-9 transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm hạng mục
          </Button>
        )}
      </CardHeader>
      <CardContent className={isMobile ? "p-0" : "p-2"}>
        {form.formState.errors.items && 'root' in form.formState.errors.items && (
          <div className="m-4 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-2">
            {(form.formState.errors.items as any).root?.message}
          </div>
        )}

        {isMobile ? (
          <div className="p-4 space-y-4">
            {fields.map((field, index) => (
              <MobileChecklistItem
                key={field.id}
                index={index}
                form={form}
                onRemove={remove}
                onMoveUp={(i) => move(i, i - 1)}
                onMoveDown={(i) => move(i, i + 1)}
                totalItems={fields.length}
              />
            ))}
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Chưa có hạng mục nào được thêm
              </div>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <DataTable
              columns={columns}
              data={fields}
              showToolbar={false}
              showPagination={false}
              getRowId={(row) => (row as any).id}
              className="border-none [&_td]:align-top [&_thead]:bg-muted/50"
            />
          </div>
        )}

        <div className="p-4 border-t border-border/40 bg-muted/20 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            className="w-full max-w-sm border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:text-primary h-12"
            onClick={append}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm hạng mục mới
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
