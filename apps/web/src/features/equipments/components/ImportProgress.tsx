import { env } from '@/config/env';
import { Loader2, CheckCircle2, X, FileSpreadsheet, AlertCircle, Download, CheckCircle } from 'lucide-react';
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
 * Metric Stat Component
 */
function MetricStat({ 
  label, 
  value, 
  icon: Icon, 
  variant = 'default',
  subValue
}: { 
  label: string; 
  value: number | string; 
  icon: any;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  subValue?: string;
}) {
  const styles = {
    default: {
      wrapper: "bg-muted/10 border-border/50",
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground"
    },
    success: {
      wrapper: "bg-card border-border/50",
      iconBg: "bg-status-active/20",
      iconColor: "text-[hsl(var(--status-active))]"
    },
    error: {
      wrapper: "bg-card border-border/50",
      iconBg: "bg-status-critical/20",
      iconColor: "text-[hsl(var(--status-critical))]"
    },
    warning: {
      wrapper: "bg-card border-border/50",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400"
    },
    info: {
      wrapper: "bg-card border-border/50",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400"
    }
  };

  const currentStyle = styles[variant] || styles.default;

  return (
    <div className={cn(
      "stat-card flex flex-col gap-3 p-3 sm:p-4 rounded-xl border transition-all", 
      currentStyle.wrapper
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "stat-card-icon h-9 w-9 rounded-lg flex items-center justify-center shrink-0", 
          currentStyle.iconBg
        )}>
          <Icon className={cn("h-5 w-5", currentStyle.iconColor)} />
        </div>
        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-1.5 pl-0.5">
        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-muted-foreground font-medium opacity-80">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}

export function ImportProgress({ jobId, fileName: propFileName, onClose }: ImportProgressProps) {
  const { progress, history } = useImportProgress({ jobId });

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

  const status = history?.status || 'PENDING';
  const isProcessing = status === 'PENDING' || status === 'PROCESSING';
  const isCompleted = status === 'COMPLETED';

  // Calculate stats
  const total = history?.totalRecords || 0;
  const success = history?.successCount || 0;
  const failed = history?.failedCount || 0;
  const isFailed = status === 'FAILED';

  return (
    <Card className="w-full mb-6 overflow-hidden border-border/60 bg-card/50 animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl backdrop-blur-sm">
      {/* Header */}
      <CardHeader className="sm:px-6 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
            "h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shadow-inner shrink-0",
            isCompleted ? "bg-status-active text-white" :
            isFailed ? "bg-status-critical text-white" :
            "bg-primary text-white"
          )}>
            {isCompleted ? <CheckCircle className="h-5 w-5" />:
             isFailed ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> :
             <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />}
          </div>
          
          <div className="flex flex-col gap-1 min-w-0 flex-1">
             <div className="flex items-center gap-2.5">
                <h4 className="font-bold text-base text-foreground/90 tracking-tight leading-none truncate flex-1" title={currentFileName}>
                  {displayFileName}
                </h4>
                <Badge variant="outline" className={cn(
                  isCompleted && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  isFailed && "bg-destructive/10 text-destructive",
                  isProcessing && "bg-blue-500/10 text-blue-600 dark:text-blue-400 animate-pulse"
                )}>
                  {status === 'PENDING' ? 'WAITING' : status}
                </Badge>
             </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-background/80" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Progress Bar (Visible when processing) */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Tiến độ xử lý</span>
              <span className="text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 w-full bg-secondary/70" />
          </div>
        )}

        {/* Completed Stats Grid */}
        {(isCompleted || isFailed) && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             <MetricStat 
               label="Tổng số dòng" 
               value={total} 
               icon={FileSpreadsheet} 
               variant="default"
             />
             <MetricStat 
               label="Thành công" 
               value={success} 
               icon={CheckCircle2} 
               variant="success"
             />
             <MetricStat 
               label="Thất bại" 
               value={failed} 
               icon={AlertCircle} 
               variant={"error"}
             />
          </div>
        )}

        {/* Error Details Section */}
        {failed > 0 && (
          <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-2 bg-background rounded-full shrink-0 shadow-sm border border-border/50">
              <FileSpreadsheet className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 space-y-1">
              <h5 className="text-sm font-semibold text-destructive flex items-center gap-2">
                Phát hiện {failed} dòng lỗi
              </h5>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                 Một số dòng dữ liệu không hợp lệ hoặc bị thiếu thông tin bắt buộc. 
                 Vui lòng tải báo cáo chi tiết để kiểm tra và sửa lỗi.
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full sm:w-auto border-destructive/20 hover:bg-destructive/10 hover:text-destructive text-destructive/80"
              onClick={handleDownloadReport}
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              Tải báo cáo lỗi
            </Button>
          </div>
        )}

        {/* Success Message (Clean) */}
        {isCompleted && failed === 0 && (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm">
             <CheckCircle2 className="h-4 w-4 shrink-0" />
             <span className="font-medium">Toàn bộ {total} thiết bị đã được import thành công!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
