
import { toast } from 'sonner';

import { PageContainer } from '@/components/shared/PageContainer';
import { Form } from '@/components/ui/form';

import { useChecklistForm } from '@/features/checklists/hooks/useChecklistForm';
import { ChecklistHeader } from '@/features/checklists/components/ChecklistHeader';
import { ChecklistGeneralInfo } from '@/features/checklists/components/ChecklistGeneralInfo';
import { ChecklistItemsTable } from '@/features/checklists/components/ChecklistItemsTable';

export default function ChecklistForm() {
  const {
    form,
    fields,
    append,
    remove,
    move,
    onSubmit,
    isEditing,
    isCopying,
    isLoading,
    isSubmitting,
    isReady
  } = useChecklistForm();

  // Handle loading state
  if (isLoading || !isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const handlePreview = () => {
    toast.info('Tính năng xem trước đang được phát triển');
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto pb-20">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Header Section */}
            <ChecklistHeader
              isEditing={isEditing}
              isCopying={isCopying}
              onSave={form.handleSubmit(onSubmit)}
              onPreview={handlePreview}
              isSaving={isSubmitting}
              isValid={form.formState.isValid}
            />

            {/* General Info Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
               <ChecklistGeneralInfo form={form as any} />
            </div>

            {/* Checklist Items Table Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <ChecklistItemsTable
                form={form as any}
                fields={fields}
                append={append}
                remove={remove}
                move={move}
              />
            </div>

          </form>
        </Form>
      </div>
    </PageContainer>
  );
}

