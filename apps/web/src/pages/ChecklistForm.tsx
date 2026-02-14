import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ColumnDef,
} from "@tanstack/react-table";
import {
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  ListTodo,
  ClipboardList,

} from 'lucide-react';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {

} from '@/components/ui/popover';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DataTable } from '@/components/shared/table/DataTable';

import { useCreateTemplate } from '@/features/checklists/hooks/useCreateTemplate';
import { useChecklistTemplate } from '@/features/checklists/hooks/useChecklistTemplates';
import {
  ChecklistCycle,
  ChecklistStatus,
  CYCLE_LABELS,
} from '@/features/checklists/types/checklist.types';
import { EquipmentSearchInput } from '@/features/checklists/components';
import { transformFormToDto } from '@/features/checklists/handlers/templateFormHandlers';

// ============================================================================
// SCHEMA
// ============================================================================

const checklistItemSchema = z.object({
  maintenanceTask: z.string().min(1, 'Nội dung bảo dưỡng không được để trống'),
  judgmentStandard: z.string().default(''),
  inspectionMethod: z.string().default(''),
  maintenanceContent: z.string().default(''),
  expectedResult: z.string().default(''),
  isRequired: z.boolean().default(false),
  requiresImage: z.boolean().default(false),
  requiresNote: z.boolean().default(false),
  order: z.number().default(0),
});

const checklistFormSchema = z.object({
  name: z.string().min(1, 'Tên checklist không được để trống'),
  description: z.string().optional(),
  equipmentId: z.string().min(1, 'Vui lòng chọn thiết bị'),
  // We keep the full object for display purposes in the UI
  equipment: z.any().optional(),
  department: z.string().optional(),
  cycle: z.nativeEnum(ChecklistCycle),
  status: z.nativeEnum(ChecklistStatus).default(ChecklistStatus.DRAFT),
  notes: z.string().optional(),
  items: z.array(checklistItemSchema).min(1, 'Checklist phải có ít nhất 1 hạng mục'),
});

type ChecklistFormValues = z.infer<typeof checklistFormSchema>;

const defaultValues: ChecklistFormValues = {
  name: '',
  description: '',
  equipmentId: '',
  equipment: null,
  department: '',
  cycle: ChecklistCycle.MONTHLY,
  status: ChecklistStatus.DRAFT,
  notes: '',
  items: [
    {
      maintenanceTask: '',
      judgmentStandard: '',
      inspectionMethod: '',
      maintenanceContent: '',
      expectedResult: '',
      isRequired: false,
      requiresImage: false,
      requiresNote: false,
      order: 0,
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function ChecklistForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id) && !searchParams.get('copy');
  const isCopying = Boolean(searchParams.get('copy'));

  // Hooks
  const createTemplate = useCreateTemplate();
  const { data: existingTemplate } = useChecklistTemplate(id || '');

  // Form
  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistFormSchema) as any,
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const columns: ColumnDef<ChecklistFormValues['items'][0]>[] = [
    {
      accessorKey: "index",
      header: () => <div className="text-center text-xs tracking-wider w-8">#</div>,
      cell: ({ row }) => <div className="text-center text-muted-foreground w-8">{row.index + 1}</div>,
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
                  placeholder="Nội dung" 
                  {...field} 
                  className={cn(
                    "h-8",
                    form.formState.errors.items?.[row.index]?.maintenanceTask && "border-destructive"
                  )} 
                />
              </FormControl>
            </FormItem>
          )}
        />
      ),
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
                <Textarea placeholder="Tiêu chuẩn" {...field} className="h-8" />
              </FormControl>
            </FormItem>
          )}
        />
      ),
    },
    {
      accessorKey: "inspectionMethod",
      header: () => <div className="text-xs tracking-wider">Phương pháp kiểm tra/ Thao tác</div>,
      cell: ({ row }) => (
        <FormField
          control={form.control}
          name={`items.${row.index}.inspectionMethod`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <Textarea placeholder="Phương pháp" {...field} className="h-8" />
              </FormControl>
            </FormItem>
          )}
        />
      ),
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
                <Textarea placeholder="Chi tiết" {...field} className="h-8" />
              </FormControl>
            </FormItem>
          )}
        />
      ),
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
                <Textarea placeholder="Kết quả mong đợi" {...field} className="h-8" />
              </FormControl>
            </FormItem>
          )}
        />
      ),
    },
    {
      accessorKey: "requiresImage",
      header: () => <div className="text-center text-xs tracking-wider">Yêu cầu ảnh</div>,
      cell: ({ row }) => (
        <FormField
          control={form.control}
          name={`items.${row.index}.requiresImage`}
          render={({ field }) => (
            <FormItem className="flex items-center justify-center space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right text-xs tracking-wider w-24">Thao tác</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => move(row.index, row.index - 1)}
            disabled={row.index === 0}
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => move(row.index, row.index + 1)}
            disabled={row.index === fields.length - 1}
          >
            <MoveDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              if (fields.length > 1) {
                remove(row.index);
              } else {
                toast.error("Phải có ít nhất 1 hạng mục");
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Load existing template data
  useEffect(() => {
    if (existingTemplate) {
      const formData: ChecklistFormValues = {
        name: isCopying ? `${existingTemplate.name} (Copy)` : existingTemplate.name,
        description: existingTemplate.description || '',
        equipmentId: existingTemplate.equipmentId || '',
        equipment: existingTemplate.equipment || null,
        department: existingTemplate.department || '',
        cycle: existingTemplate.cycle,
        status: isCopying ? ChecklistStatus.DRAFT : existingTemplate.status,
        notes: existingTemplate.notes || '',
        items: existingTemplate.items.map((item) => ({
          maintenanceTask: item.maintenanceTask,
          judgmentStandard: item.judgmentStandard || '',
          inspectionMethod: item.inspectionMethod || '',
          maintenanceContent: item.maintenanceContent || '',
          expectedResult: item.expectedResult || '',
          isRequired: item.isRequired,
          requiresImage: item.requiresImage,
          requiresNote: item.requiresNote,
          order: item.order || 0,
        })),
      };

      if (!existingTemplate.items || existingTemplate.items.length === 0) {
        formData.items = defaultValues.items;
      }

      form.reset(formData);
    }
  }, [existingTemplate, isCopying, form]);

  const onSubmit = async (data: ChecklistFormValues) => {
    try {
      // Transform data to match API DTO
      const dto = transformFormToDto(data as any); 
      // Note: transformFormToDto expects strict TemplateFormData, but our zod schema is slightly looser (optional strings vs empty strings).
      // We might need to ensure the transformation handles empty strings correctly.
      // The validation is already done by Zod.
      
      await createTemplate.mutateAsync(dto);
      toast.success(isEditing ? 'Cập nhật checklist thành công' : 'Tạo checklist thành công');
      navigate('/checklists');
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Có lỗi xảy ra khi lưu checklist');
    }
  };

  const handlePreview = () => {
    toast.info('Tính năng xem trước đang được phát triển');
  };

  const handleAddItem = () => {
    append({
      maintenanceTask: '',
      judgmentStandard: '',
      inspectionMethod: '',
      maintenanceContent: '',
      expectedResult: '',
      isRequired: false,
      requiresImage: false,
      requiresNote: false,
      order: 0,
    });
  };

  return (
    <div className="min-h-screen bg-muted/40 pb-20">
      <div className="mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        {/* Breadcrumb & Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate('/checklists')}>Thư viện checklist</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-foreground">
                {isEditing ? 'Chỉnh sửa' : isCopying ? 'Sao chép' : 'Tạo mới'}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isEditing
                ? 'Chỉnh sửa Checklist'
                : isCopying
                ? 'Sao chép Checklist'
                : 'Tạo Checklist mới'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing 
                ? 'Cấu hình chi tiết các hạng mục kiểm tra và bảo dưỡng.' 
                : 'Thiết lập quy trình kiểm tra định kỳ cho thiết bị.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="h-9"
            >
              <Eye className="h-4 w-4 mr-2" />
              Xem trước
            </Button>
            <Button
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createTemplate.isPending}
              className="h-9 min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {createTemplate.isPending ? 'Đang lưu...' : 'Lưu checklist'}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="border border-border/60 shadow-sm bg-card">
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
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
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
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bộ phận sử dụng</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Bộ phận sản xuất" {...field} />
                      </FormControl>
                      <FormDescription>
                        Bộ phận hoặc phòng ban sử dụng checklist này
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả chi tiết về checklist này..." 
                        rows={2} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equipment Search - REQUIRED */}
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
                      <FormDescription>
                        Tìm kiếm theo mã hoặc tên thiết bị
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cycle */}
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
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú bổ sung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ghi chú khác..." 
                        rows={2} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Checklist Items */}
          <Card className="border border-border/60 shadow-sm bg-card">
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="h-9"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm hạng mục
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {form.formState.errors.items && 'root' in form.formState.errors.items && (
                 <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive font-medium">
                    {(form.formState.errors.items as any).root?.message}
                 </div>
              )}
              <div className="w-full">
                <DataTable
                  columns={columns}
                  data={fields}
                  showToolbar={false}
                  showPagination={false}
                  getRowId={(row) => (row as any).id}
                  className="[&_td]:px-2 [&_th]:px-2 [&_td]:py-2"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  </div>
  );
}
