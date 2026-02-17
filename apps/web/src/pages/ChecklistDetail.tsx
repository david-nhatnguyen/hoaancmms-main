import React from 'react';
import { ClipboardList, History, Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageContainer } from '@/components/shared/PageContainer';
import { Card, CardContent } from '@/components/ui/card';

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

  // 1. Loading State - Standardized Full Screen
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // 2. Error State - Standardized
  if (error) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto pt-20">
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="mb-2">Không thể tải checklist</AlertTitle>
            <AlertDescription>
              {error.message || 'Có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.'}
            </AlertDescription>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" onClick={handlers.handleGoBack} className="bg-background">
                Quay lại
              </Button>
              <Button onClick={() => refetch()} variant="destructive">
                Thử lại
              </Button>
            </div>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  // 3. Not Found State
  if (!checklist) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="border-border/60 shadow-sm bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <ClipboardList className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy checklist</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Checklist bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc bạn không có quyền truy cập.
              </p>
              <Button onClick={handlers.handleGoBack} variant="outline" className="min-w-[140px]">
                Quay lại danh sách
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // 4. Main Content - Standardized Page Structure
  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto pb-20 space-y-8">
        {/* Header Section */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <ChecklistDetailHeader
            checklist={checklist}
            onGoBack={handlers.handleGoBack}
            onCopy={handlers.handleCopy}
            onEdit={() => handlers.handleEdit(checklist.id)}
          />
        </div>

        {/* Content Tabs */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1 border border-border/40 inline-flex w-full sm:w-auto h-auto">
              <TabsTrigger
                value="preview"
                className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-1 sm:flex-none"
              >
                <ClipboardList className="h-4 w-4" />
                Xem trước
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="gap-2 px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all flex-1 sm:flex-none"
              >
                <History className="h-4 w-4" />
                Thông tin & Lịch sử
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="outline-none mt-0 space-y-6 animate-in fade-in duration-300">
              <ChecklistPreviewTab checklist={checklist} />
            </TabsContent>

            <TabsContent value="info" className="outline-none mt-0 space-y-6 animate-in fade-in duration-300">
              <ChecklistInfoTab checklist={checklist} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
