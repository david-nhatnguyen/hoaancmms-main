import React from 'react';
import { ClipboardList, History, Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Atomic Components
import { ChecklistDetailHeader } from '@/features/checklists/components/ChecklistDetailHeader';
import { ChecklistPreviewTab } from '@/features/checklists/components/ChecklistPreviewTab';
import { ChecklistInfoTab } from '@/features/checklists/components/ChecklistInfoTab';

// Logic Hook
import { useChecklistDetail } from '@/features/checklists/hooks/useChecklistDetail';

export default function ChecklistDetail() {
  const {
    checklist,
    isLoading,
    error,
    refetch,
    activeTab,
    setActiveTab,
    handlers,
  } = useChecklistDetail();

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Đang tải checklist...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto py-12">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Có lỗi xảy ra khi tải checklist'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handlers.handleGoBack}>
              Quay lại danh sách
            </Button>
            <Button onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!checklist) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-lg font-medium mb-2">Không tìm thấy checklist</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Checklist không tồn tại hoặc đã bị xóa khỏi hệ thống
          </p>
          <Button variant="outline" onClick={handlers.handleGoBack} className="border-border">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <ChecklistDetailHeader
        checklist={checklist}
        onGoBack={handlers.handleGoBack}
        onCopy={handlers.handleCopy}
        onEdit={() => handlers.handleEdit(checklist.id)}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary/50 p-1 mb-6">
          <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-primary">
            <ClipboardList className="h-4 w-4" />
            Xem trước Checklist
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-primary">
            <History className="h-4 w-4" />
            Thông tin & Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview" className="animate-fade-in">
          <ChecklistPreviewTab checklist={checklist} />
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="animate-fade-in">
          <ChecklistInfoTab checklist={checklist} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
