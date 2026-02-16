import { PageContainer } from '@/components/shared/PageContainer';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

// Atomic Components
import { EquipmentFormHeader } from '@/features/equipments/components/EquipmentFormHeader';
import { EquipmentIdentitySection } from '@/features/equipments/components/EquipmentIdentitySection';
import { EquipmentSpecificationSection } from '@/features/equipments/components/EquipmentSpecificationSection';

// Logic Hook
import { useEquipmentForm } from '@/features/equipments/hooks/useEquipmentForm';

export default function EquipmentForm() {
  const {
    form,
    onSubmit,
    isEditing,
    isLoading,
    isSubmitting,
    isLoadingFactories,
    factoriesList,
    previewUrl,
    handleFileChange,
    fileInputRef,
  } = useEquipmentForm();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto pb-20">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Header Section */}
            <EquipmentFormHeader
              isEditing={isEditing}
              onSave={form.handleSubmit(onSubmit)}
              isSaving={isSubmitting}
              isValid={form.formState.isValid}
            />

            {/* Identity Information Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <EquipmentIdentitySection
                form={form as any}
                isSubmitting={isSubmitting}
                factoriesList={factoriesList}
                isLoadingFactories={isLoadingFactories}
              />
            </div>

            {/* Specifications & Image Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <EquipmentSpecificationSection
                form={form as any}
                isSubmitting={isSubmitting}
                previewUrl={previewUrl}
                handleFileChange={handleFileChange}
                fileInputRef={fileInputRef}
              />
            </div>

          </form>
        </Form>
      </div>
    </PageContainer>
  );
}
