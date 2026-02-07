import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, Loader2, X } from 'lucide-react';
import { equipmentsApi } from '@/api/endpoints/equipments.api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImportEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadStart: (jobId: string, estimatedDuration?: number, fileName?: string) => void;
}

export function ImportEquipmentDialog({ open, onOpenChange, onUploadStart }: ImportEquipmentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset state when dialog opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
       setFile(null);
    }
    onOpenChange(isOpen);
  };

  // Import Mutation
  const importMutation = useMutation({
    mutationFn: (fileToUpload: File) => equipmentsApi.importExcel(fileToUpload),
    onSuccess: (data: any) => {
      // The server seems to wrap responses in a 'data' property
      const importData = data?.data || data;
      const finalId = importData?.importId || importData?.id || importData?.import_id;
      
      if (finalId) {
        onUploadStart(finalId, importData?.estimatedDuration, file?.name);
        toast.info('Đã tải lên file. Bắt đầu xử lý...', {
          id: 'import-start',
        });
        handleOpenChange(false);
      } else {
        toast.error('Lỗi hệ thống: Không tìm thấy ID tiến trình');
      }
    },
    onError: (error: any) => {
      toast.error('Upload thất bại', {
        description: error.response?.data?.message || 'Không thể upload file.',
      });
    },
  });

  // Start Import Handler
  const handleStartImport = () => {
    console.log('📤 [Dialog] handleStartImport triggered. File status:', !!file);
    if (!file) {
      toast.error('Vui lòng chọn file trước');
      return;
    }
    console.log('📤 [Dialog] Mutating file:', file.name);
    importMutation.mutate(file);
  };

  // Template Download Handler
  const handleDownloadTemplate = async () => {
      try {
          const blob = await equipmentsApi.getTemplate();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'equipment_import_template.xlsx');
          document.body.appendChild(link);
          link.click();
          link.remove();
          toast.success('Đã tải xuống file mẫu');
      } catch {
          toast.error('Không thể tải file mẫu');
      }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
         setFile(droppedFile);
      } else {
         toast.error('Vui lòng chỉ upload file Excel (.xlsx, .xls)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       setFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Thiết bị từ Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel danh sách thiết bị để thêm hàng loạt vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
             {/* Instructions & Template */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm flex items-start justify-between gap-4">
                <div className="space-y-1">
                <p className="font-medium">1. Chuẩn bị file dữ liệu</p>
                <p className="text-muted-foreground text-xs">Sử dụng file mẫu để đảm bảo đúng định dạng.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-8 shrink-0">
                <Download className="h-3 w-3 mr-1" /> File mẫu
                </Button>
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
                <p className="font-medium text-sm">2. Tải lên file</p>
                {!file ? (
                    <div 
                    className={cn(
                        "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors group",
                        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    >
                    <input 
                        id="file-upload" 
                        title="Upload Excel File"
                        type="file" 
                        className="hidden" 
                        accept=".xlsx, .xls" 
                        onChange={handleFileSelect} 
                    />
                    <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-base font-medium text-foreground">Kéo thả file vào đây hoặc click để chọn</p>
                    <p className="text-sm text-muted-foreground mt-1">Hỗ trợ định dạng .xlsx, .xls (Max 5MB)</p>
                    </div>
                ) : (
                    <div className="border rounded-lg p-4 flex items-center justify-between bg-muted/20 gap-3">
                        <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0 border border-green-200">
                                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium truncate text-base" title={file.name}>
                                    {file.name.length > 40 
                                      ? `${file.name.slice(0, 30)}...${file.name.split('.').pop()}` 
                                      : file.name}
                                </p>
                                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setFile(null)} 
                            className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                            title="Xóa file"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
            </div>

        <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Hủy bỏ
            </Button>
            <Button 
                onClick={handleStartImport} 
                disabled={!file || importMutation.isPending}
                className="min-w-[100px]"
            >
                {importMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Import
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
