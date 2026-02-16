import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { factoriesApi } from '@/api/endpoints/factories.api';
import { env } from '@/config/env';
import {
  useEquipmentByCode,
  useCreateEquipment,
  useUpdateEquipment,
} from '@/features/equipments/hooks';

// Validation Schema matches new DTO
export const equipmentFormSchema = z.object({
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

export type EquipmentFormData = z.infer<typeof equipmentFormSchema>;

export const useEquipmentForm = () => {
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
    resolver: zodResolver(equipmentFormSchema) as any,
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
      form.setValue('image', '');
    } else {
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  const onSubmit = (data: EquipmentFormData) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image') return;
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });

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
          onError: (error) => {
            console.error('Update error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thiết bị');
          },
        }
      );
    } else {
      createEquipment.mutate(
        formData as any,
        {
          onSuccess: () => {
            toast.success('Thêm thiết bị thành công');
            navigate('/equipments');
          },
          onError: (error) => {
            console.error('Create error:', error);
            toast.error('Có lỗi xảy ra khi tạo thiết bị');
          },
        }
      );
    }
  };

  return {
    form,
    onSubmit,
    isEditing,
    isLoading: isEditing && isLoadingEquipment,
    isSubmitting,
    isLoadingFactories,
    factoriesList,
    previewUrl,
    handleFileChange,
    fileInputRef,
    navigate,
  };
};
