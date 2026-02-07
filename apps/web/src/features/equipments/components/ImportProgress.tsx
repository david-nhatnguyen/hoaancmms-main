import { env } from '@/config/env';
import { Loader2, CheckCircle2, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useImportProgress } from '../hooks/useImportProgress';

interface ImportProgressProps {
  jobId: string;
  fileName?: string;
  onClose: () => void;
}

/**
 * Modern Stat Card matching logic from MobileStatsGrid
 */
function MetricStat({ 
  label, 
  value, 
  icon: Icon, 
  variant = 'default' 
}: { 
  label: string; 
  value: number | string; 
  icon: any;
  variant?: 'default' | 'success' | 'error' | 'warning' 
}) {
  const iconVariants = {
    default: "bg-muted text-muted-foreground",
    success: "bg-status-active/20 text-[hsl(var(--status-active))]",
    error: "bg-status-critical/20 text-[hsl(var(--status-critical))]",
    warning: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="stat-card flex flex-col gap-2 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <div className={cn("stat-card-icon h-8 w-8 sm:h-9 sm:w-9", iconVariants[variant])}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </p>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function ImportProgress({ jobId, fileName: propFileName, onClose }: ImportProgressProps) {
  const { progress, history } = useImportProgress({ jobId, onClose });

  const currentFileName = propFileName || history?.fileName;
  const displayFileName = currentFileName 
    ? (currentFileName.length > 30 ? `${currentFileName.slice(0, 20)}...${currentFileName.split('.').pop()}` : currentFileName)
    : '';

  const handleDownloadReport = () => {
    if (history?.errorFileUrl) {
      const baseRaw = env.API_URL;
      const apiBase = baseRaw.endsWith('/api') ? baseRaw.slice(0, -4) : baseRaw;
      
      const url = history.errorFileUrl.startsWith('http') 
        ? history.errorFileUrl 
        : `${apiBase}${history.errorFileUrl}`;
        
      window.open(url, '_blank');
    }
  };

  if (!jobId) return null;

  const isProcessing = !history || history.status === 'PENDING' || history.status === 'PROCESSING';
  const isCompleted = history?.status === 'COMPLETED';
  const isFailed = history?.status === 'FAILED';

  return (
    <Card className="w-full mb-6 overflow-hidden border-border/50 bg-card shadow-none animate-in fade-in slide-in-from-top-4 duration-500 rounded-xl">
      {/* Header matching FactoryList style */}
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3 sm:gap-4 font-sans flex-1 min-w-0">
          <div className={cn(
            "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-inner shrink-0",
            isCompleted ? "bg-status-active text-white" :
            isFailed ? "bg-status-critical text-white" :
            "bg-primary text-white"
          )}>
            {isCompleted ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" /> :
             isFailed ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> :
             <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="page-subtitle mb-0.5 truncate uppercase tracking-widest flex items-center gap-2">
                TIẾN ĐỘ {displayFileName && <span className="text-muted-foreground/50">|</span>} {displayFileName && <span className="text-primary/70">{displayFileName}</span>}
            </p>
            <h4 className="font-semibold text-sm sm:text-base text-foreground leading-tight truncate">
               {isCompleted ? 'Import Hoàn Tất' : 
                isFailed ? 'Tiến Trình Thất Bại' :
                'Đang xử lý dữ liệu'}
            </h4>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Progress Section */}
        {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-tighter bg-primary/5 border-primary/20 text-primary">
                    {history?.status === 'PENDING' ? 'Queued' : 'Processing'}
                   </Badge>
                   <span className="text-muted-foreground">
                      {history?.status === 'PENDING' ? 'Đang khởi tạo...' : 'Đang xử lý dữ liệu...'}
                   </span>
                </div>
                <span className="font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              
              <Progress value={progress} className="h-2 sm:h-2.5" />
            </div>
        )}

        {/* Results Metrics */}
        {isCompleted && (
             <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-in zoom-in-95 duration-500">
                <MetricStat 
                  label="Thành công" 
                  value={history.successCount} 
                  icon={CheckCircle2}
                  variant="success" 
                />
                <MetricStat 
                  label="Dòng lỗi" 
                  value={history.failedCount} 
                  icon={AlertCircle}
                  variant={history.failedCount > 0 ? "error" : "default"} 
                />
             </div>
        )}

        {/* Error Notification & Action */}
        {(isFailed || (isCompleted && history.failedCount > 0)) && (
            <div className="pt-2 animate-in slide-in-from-bottom-2 duration-500">
                {isFailed ? (
                     <div className="flex items-center gap-3 p-4 rounded-lg bg-status-critical/10 border border-status-critical/20 text-[hsl(var(--status-critical))]">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p className="text-xs sm:text-sm font-medium">Hệ thống gặp lỗi nghiêm trọng trong quá trình xử lý. Vui lòng thử lại sau.</p>
                     </div>
                ) : (
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                        <FileSpreadsheet className="h-5 w-5 shrink-0" />
                        <p className="text-xs sm:text-sm font-medium leading-normal">
                          Dữ liệu không hoàn toàn hợp lệ. Hãy tải báo cáo để xem chi tiết từng lỗi.
                        </p>
                      </div>
                      
                      <Button 
                          onClick={handleDownloadReport}
                          variant="outline"
                          className={cn(
                            "w-full h-12 rounded-xl text-sm font-bold gap-3 transition-all duration-300 group",
                            "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white hover:border-amber-600",
                            "dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white",
                            "hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
                          )}
                      >
                          <FileSpreadsheet className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                          Tải báo cáo lỗi (.xlsx)
                      </Button>
                    </div>
                )}
            </div>
        )}

        {isCompleted && history.failedCount === 0 && (
          <div className="flex flex-col items-center justify-center p-6 border border-dashed border-status-active/30 rounded-xl bg-status-active/5">
              <CheckCircle2 className="h-8 w-8 text-[hsl(var(--status-active))] mb-2" />
              <p className="text-[hsl(var(--status-active))] font-bold text-sm sm:text-base">Đồng bộ thành công!</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase mt-1 tracking-widest">100% dữ liệu đã được ghi vào hệ thống</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
