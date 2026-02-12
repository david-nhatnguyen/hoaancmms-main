import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, Check, ChevronsUpDown, Cpu, Pencil, Settings2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';
import { factoriesApi } from '@/api/endpoints/factories.api';
import { env } from '@/config/env';
import {
  useEquipmentByCode,
  useCreateEquipment,
  useUpdateEquipment,
  STATUS_OPTIONS,
} from '@/features/equipments/hooks';

// Validation Schema matches new DTO
const equipmentFormSchema = z.object({
  code: z.string().min(1, 'Mã thiết bị không được để trống').max(50),
  name: z.string().min(1, 'Tên thiết bị không được để trống').max(255),
  category: z.string().min(1, 'Chủng loại máy không được để trống').max(255),
  factoryId: z.string().optional().nullable(),
  origin: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  modelYear: z.coerce.number().nullable().optional(),
  image: z.string().nullable().optional().or(z.literal('')),
  dimension: z.string().nullable().optional(),
  quantity: z.coerce.number().min(1, 'Số lượng tối thiểu là 1').default(1),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  notes: z.string().nullable().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

export default function EquipmentForm() {
  const { code } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(code);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries & Mutations
  const { data: equipmentData, isLoading: isLoadingEquipment } = useEquipmentByCode(code || '');
  const equipment = equipmentData?.data;
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();

  // Fetch factories for Combobox
  const { data: factoriesData, isLoading: isLoadingFactories } = useQuery({
    queryKey: ['factories-list'],
    queryFn: () => factoriesApi.getAll({ limit: 100, page: 1 }),
  });

  const factoriesList = factoriesData?.data || [];
  
  const isSubmitting = createEquipment.isPending || updateEquipment.isPending;

  // Form initialization
  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      code: '',
      name: '',
      category: '',
      factoryId: '', 
      origin: '',
      brand: '',
      modelYear: new Date().getFullYear(),
      image: '',
      dimension: '',
      quantity: 1,
      status: 'ACTIVE',
      notes: '',
    },
  });

  useEffect(() => {
    if (isEditing && equipment) {
      form.reset({
        code: equipment.code,
        name: equipment.name,
        category: equipment.category || '',
        factoryId: equipment.factoryId || '',
        origin: equipment.origin || '',
        brand: equipment.brand || '',
        modelYear: equipment.modelYear || new Date().getFullYear(),
        image: equipment.image || '',
        dimension: equipment.dimension || '',
        quantity: equipment.quantity || 1,
        status: equipment.status as any,
        notes: equipment.notes || '',
      });

      // If equipment has an image, set it as preview
      if (equipment.image) {
        let fullUrl = equipment.image;
        if (!fullUrl.startsWith('http')) {
          // Handle double /api issue: if path already starts with /api, remove it since baseUrl will add it
          const cleanPath = fullUrl.startsWith('/api/') ? fullUrl.replace('/api', '') : fullUrl;
          const baseUrl = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL;
          fullUrl = `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
        }
        setPreviewUrl(fullUrl);
      }
    }
  }, [isEditing, equipment, form]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Clear URL fallback in form if a file is chosen
      form.setValue('image', ''); 
    }
  };

  const onSubmit = (data: EquipmentFormData, isCreateNew: boolean = false) => {
    // Construct FormData for physical file upload
    const formData = new FormData();
    
    // Append all form fields except image (we handle image separately)
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image') return; // Skip image here
      
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });

    // Handle image: either the file or the URL string
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else if (data.image) {
      formData.append('image', data.image);
    }
    if (isEditing && equipment?.id) {
      updateEquipment.mutate(
        { id: equipment.id, data: formData as any },
        {
          onSuccess: () => {
             toast.success('Cập nhật thiết bị thành công');
             navigate('/equipments');
          },
          onError: () => toast.error('Có lỗi xảy ra khi cập nhật thiết bị'),
        }
      );
    } else {
      createEquipment.mutate(
        formData as any,
        {
          onSuccess: () => {
             toast.success('Thêm thiết bị thành công');
             if (isCreateNew) {
               form.reset({ ...data, code: '', name: '' });
               setSelectedFile(null);
               setPreviewUrl('');
             } else {
               navigate('/equipments');
             }
          },
          onError: () => toast.error('Có lỗi xảy ra khi tạo thiết bị'),
        }
      );
    }
  };

  if (isEditing && isLoadingEquipment) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-muted/40 pb-20">
      <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
           <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                 <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate('/equipments')}>Thiết bị</span>
                 <span className="mx-2">/</span>
                 <span className="font-medium text-foreground">{isEditing ? equipment?.code || 'Chi tiết' : 'Tạo mới'}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {isEditing ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Quản lý thông tin chi tiết và cấu hình thiết bị.' : 'Thiết lập hồ sơ cho thiết bị sản xuất mới.'}
              </p>
           </div>
           
           <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={() => navigate('/equipments')} className="h-9">
               Hủy bỏ
             </Button>
             <Button size="sm" onClick={form.handleSubmit((data) => onSubmit(data, false))} className="h-9 min-w-[100px]" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2" />}
                {isEditing ? 'Lưu thay đổi' : 'Tạo thiết bị'}
             </Button>
           </div>
        </div>

        <Form {...form}>
          <form className="space-y-8">
            <div className="space-y-8">
              
                {/* SECTION 1: IDENTITY */}
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
                    {/* Row 1: Code & Category */}
                    {/* Code */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã thiết bị <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="VD: EQ-001" className="font-mono" {...field} value={field.value || ''} autoFocus disabled={isSubmitting} />
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

                    {/* Row 2: Name & Status */}
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

                    {/* Row 3: Factory & Quantity */}
                     {/* Factory */}
                     <FormField
                      control={form.control}
                      name="factoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhà máy quản lý</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isSubmitting || isLoadingFactories}
                                >
                                  <span className="truncate">
                                    {field.value
                                      ? factoriesList.find(
                                          (factory) => factory.id === field.value
                                        )?.name
                                      : "Chọn nhà máy"}
                                  </span>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Tìm nhà máy..." />
                                <CommandList>
                                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                  <CommandGroup>
                                    {factoriesList.map((factory) => (
                                      <CommandItem
                                        value={factory.name} 
                                        key={factory.id}
                                        onSelect={() => {
                                          form.setValue("factoryId", factory.id);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            factory.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {factory.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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

                {/* SECTION 2: SPECIFICATIONS (Included Image) */}
                <Card className="border border-border/60 shadow-sm bg-card">
                  <CardHeader className="pb-4 border-b border-border/40">
                     <div className="flex items-center gap-3">
                       <div className="p-2 rounded-md bg-primary/10 text-primary">
                         <Settings2 className="h-5 w-5" />
                       </div>
                       <div className="space-y-0.5">
                         <CardTitle className="text-lg">Thông số kỹ thuật</CardTitle>
                         <p className="text-sm text-muted-foreground">Chi tiết kỹ thuật, nguồn gốc và hình ảnh thiết bị</p>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       
                       {/* LEFT: Fields */}
                       <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Brand */}
                            <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Thương hiệu</FormLabel>
                                <FormControl>
                                  <Input placeholder="VD: Doosan" {...field} value={field.value || ''} disabled={isSubmitting} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Origin */}
                          <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Xuất xứ</FormLabel>
                                <FormControl>
                                  <Input placeholder="VD: Hàn Quốc" {...field} value={field.value || ''} disabled={isSubmitting} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Model Year */}
                          <FormField
                            control={form.control}
                            name="modelYear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Năm sản xuất</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="2024" {...field} value={field.value || ''} disabled={isSubmitting} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Dimension */}
                          <FormField
                            control={form.control}
                            name="dimension"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kích thước (D x R x C)</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input placeholder="VD: 1200 x 800 x 1500" {...field} value={field.value || ''} disabled={isSubmitting} />
                                    <div className="absolute inset-y-0 right-3 flex items-center bg-transparent">
                                        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded">mm</span>
                                    </div>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Notes */}
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Ghi chú kỹ thuật</FormLabel>
                                <FormControl>
                                  <Textarea className="min-h-[100px] resize-y" placeholder="Nhập các ghi chú đặc biệt..." {...field} value={field.value || ''} disabled={isSubmitting} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                       </div>

                       {/* RIGHT: Image */}
                       <div className="lg:col-span-4">
                            <FormField
                              control={form.control}
                              name="image"
                              render={({ field }) => (
                                <FormItem className="h-full">
                                  <FormLabel>Hình ảnh</FormLabel>
                                  <FormControl>
                                    <div className="space-y-4 h-full"> 
                                      <div className="relative w-full aspect-square bg-muted/20 rounded-lg overflow-hidden border-2 border-dashed border-input hover:border-primary/50 transition-all group cursor-pointer flex flex-col items-center justify-center">
                                          <Input 
                                            type="file" 
                                            accept="image/*" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            disabled={isSubmitting}
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                          />
                                          
                                          {previewUrl ? (
                                            <>
                                              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center text-white">
                                                  <Pencil className="h-8 w-8 mb-2" />
                                                  <span className="text-sm font-medium">Thay đổi ảnh</span>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="flex flex-col items-center justify-center p-4 text-center">
                                              <div className="p-4 mb-3 rounded-full bg-background shadow-sm border border-border/50">
                                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                              </div>
                                              <p className="text-sm font-medium">Tải ảnh lên</p>
                                              <p className="text-xs text-muted-foreground mt-1 max-w-[150px]">Kéo thả hoặc click để chọn ảnh (Max 5MB)</p>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                       </div>

                    </div>
                  </CardContent>
                </Card>

            </div>
            
            {/* Mobile Actions (Visible on small screens) */}
             <div className="md:hidden pt-4 pb-8">
                <Button type="submit" size="lg" className="w-full" onClick={form.handleSubmit((data) => onSubmit(data, false))}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Lưu thay đổi' : 'Tạo thiết bị'}
               </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
