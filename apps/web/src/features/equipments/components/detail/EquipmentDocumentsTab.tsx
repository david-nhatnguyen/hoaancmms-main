import { useState, useRef } from 'react';
import { FileText, FileImage, Download, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUploadDocument, useDeleteDocument } from '@/features/equipments/hooks/use-equipment-documents';
import { Equipment, EquipmentDocument } from '@/api/types/equipment.types';
import { env } from '@/config/env';
import { toast } from 'sonner';

interface EquipmentDocumentsTabProps {
  equipment: Equipment;
}

const getFileIcon = (type?: string) => {
  if (type?.includes('image')) return FileImage;
  if (type?.includes('pdf')) return FileText; // Could distinguish PDF
  return FileText;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const EquipmentDocumentsTab = ({ equipment }: EquipmentDocumentsTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn (tối đa 10MB)');
      return;
    }

    uploadMutation.mutate({ id: equipment.id, file });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(
        { docId: deleteId, equipmentId: equipment.id }, // Need to pass equipmentId for invalidation context
        {
          onSuccess: () => setDeleteId(null)
        }
      );
    }
  };

  const getAssetUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/api/') ? path.replace('/api', '') : path;
    const baseUrl = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL;
    return `${baseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  const documents = equipment.documents || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Tài liệu thiết bị</CardTitle>
            <CardDescription>Quản lý các tài liệu hướng dẫn, thông số kỹ thuật</CardDescription>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.jpeg"
              aria-label="Upload document"
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="action-btn-primary"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4 mr-2" />
              )}
              Tải lên
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground">Chưa có tài liệu nào</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Tải lên các tài liệu liên quan đến thiết bị này</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                Chọn file tải lên
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc: EquipmentDocument) => {
                const Icon = getFileIcon(doc.type);
                return (
                  <div
                    key={doc.id}
                    className="group relative flex items-start p-4 rounded-xl border border-border bg-card hover:bg-secondary/20 hover:border-primary/20 transition-all shadow-sm hover:shadow"
                  >
                    <div className="bg-primary/10 p-2.5 rounded-lg mr-3 text-primary shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <h4 className="text-sm font-medium text-foreground truncate" title={doc.name}>
                        {doc.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {formatFileSize(doc.size)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={getAssetUrl(doc.path)}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-primary/20 text-primary transition-colors"
                        title="Tải xuống"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => setDeleteId(doc.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài liệu?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tài liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa tài liệu'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
