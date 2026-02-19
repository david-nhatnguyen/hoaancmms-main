import { useMemo } from 'react';
import { env } from '@/config/env';
import {
    Loader2,
    CheckCircle2,
    X,
    FileSpreadsheet,
    AlertCircle,
    Download,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ImportJobHistory } from './useImportProgress';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ImportProgressProps {
    /** The polling progress value (0–100) returned by `useImportProgress` */
    progress: number;
    /** The job history returned by `useImportProgress` */
    history: ImportJobHistory | null;
    /** Called when the user closes / dismisses the progress card */
    onClose: () => void;
    /** Optional file name to show before polling returns results */
    fileName?: string;
    /** Label shown above the file name. E.g. "Đang nhập thiết bị" */
    importingLabel?: string;
    /** Success message shown when all records imported. Defaults to generic message */
    successMessage?: (total: number) => string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: metric stat card
// ─────────────────────────────────────────────────────────────────────────────

type MetricVariant = 'default' | 'success' | 'error' | 'warning';

function MetricStat({
    label,
    value,
    icon: Icon,
    variant = 'default',
}: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    variant?: MetricVariant;
}) {
    const colorMap: Record<MetricVariant, string> = {
        default: 'text-muted-foreground',
        success: 'text-emerald-500',
        error: 'text-destructive',
        warning: 'text-amber-500',
    };

    return (
        <div className="flex flex-col gap-1.5 p-4 rounded-xl border border-border/40 bg-muted/5 transition-all hover:bg-muted/10">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className={cn('h-4 w-4', colorMap[variant])} />
                <span className="text-[12px] uppercase tracking-wider font-bold opacity-70">{label}</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground/90">{value}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generic import-progress card. Pair with `useImportProgress` hook.
 *
 * Usage:
 * ```tsx
 * const { progress, history } = useImportProgress({ jobId, getStatus: ..., ... });
 *
 * <ImportProgress
 *   progress={progress}
 *   history={history}
 *   fileName={activeFileName}
 *   onClose={handleClose}
 *   importingLabel="Đang nhập thiết bị"
 *   successMessage={(total) => `${total} thiết bị đã nhập thành công.`}
 * />
 * ```
 */
export function ImportProgress({
    progress,
    history,
    onClose,
    fileName: propFileName,
    importingLabel = 'Đang nhập dữ liệu',
    successMessage,
}: ImportProgressProps) {
    const currentFileName = propFileName ?? history?.fileName;

    const displayFileName = useMemo(() => {
        if (!currentFileName) return '';
        if (currentFileName.length <= 32) return currentFileName;
        const parts = currentFileName.split('.');
        const ext = parts.pop();
        return `${parts.join('.').slice(0, 20)}...${ext}`;
    }, [currentFileName]);

    const handleDownloadReport = () => {
        if (!history?.errorFileUrl) return;
        const baseRaw = env.API_URL;
        const apiBase = baseRaw.endsWith('/api') ? baseRaw.slice(0, -4) : baseRaw;
        const url = history.errorFileUrl.startsWith('http')
            ? history.errorFileUrl
            : `${apiBase}${history.errorFileUrl}`;
        window.open(url, '_blank');
    };

    // Only hide if there is genuinely nothing to show yet.
    // progress starts at 1 from useImportProgress so this guard
    // prevents rendering a blank card before any jobId is active.
    if (!history && progress <= 0) return null;

    const status = history?.status ?? 'PENDING';
    const isProcessing = status === 'PENDING' || status === 'PROCESSING';
    const isCompleted = status === 'COMPLETED';
    const isFailed = status === 'FAILED';

    const total = history?.totalRecords ?? 0;
    const success = history?.successCount ?? 0;
    const failed = history?.failedCount ?? 0;

    const glowColor = isCompleted && failed === 0
        ? 'bg-emerald-500'
        : isFailed || failed > 0
            ? 'bg-destructive'
            : 'bg-primary';

    const iconContainerClass = isCompleted && failed === 0
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
        : isFailed || failed > 0
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary';

    const statusLabel: Record<string, string> = {
        PENDING: 'ĐANG CHỜ',
        PROCESSING: 'ĐANG XỬ LÝ',
        COMPLETED: 'HOÀN THÀNH',
        FAILED: 'THẤT BẠI',
    };

    const badgeClass = cn(
        'h-5 px-1.5 text-[10px] font-bold border-none',
        isCompleted && failed === 0 && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        (isFailed || failed > 0) && 'bg-destructive/10 text-destructive',
        isProcessing && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    );

    // ──────────────────────────────────────────────────────────────────────────
    return (
        <Card className="w-full mb-8 relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 rounded-2xl">
            {/* Ambient glow */}
            <div
                className={cn(
                    'absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none transition-colors duration-1000',
                    glowColor,
                )}
            />

            {/* Close button */}
            <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-muted/30 hover:bg-muted/50 border border-border/20 transition-all shadow-sm"
                onClick={onClose}
                title="Đóng"
            >
                <X className="h-4 w-4" />
            </Button>

            {/* Header */}
            <CardHeader className="p-5 sm:p-6 pb-2 sm:pb-3 flex-row items-center space-y-0 pr-14">
                <div className="flex items-center gap-4 min-w-0">
                    {/* Status icon */}
                    <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-border/30', iconContainerClass)}>
                        {isCompleted && failed === 0
                            ? <CheckCircle2 className="h-5 w-5" />
                            : isFailed || failed > 0
                                ? <AlertCircle className="h-5 w-5" />
                                : <Loader2 className="h-5 w-5 animate-spin" />}
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                                {importingLabel}
                            </span>
                            <Badge variant="outline" className={badgeClass}>
                                {statusLabel[status] ?? status}
                            </Badge>
                        </div>
                        <h4
                            className="font-bold text-lg text-foreground/90 tracking-tight truncate max-w-[200px] sm:max-w-md"
                            title={currentFileName}
                        >
                            {displayFileName}
                        </h4>
                    </div>
                </div>
            </CardHeader>

            {/* Body */}
            <CardContent className="p-5 sm:p-6 pt-2 pb-6 space-y-6">

                {/* Progress bar */}
                {isProcessing && (
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Đang xử lý dữ liệu...</span>
                            <span className="text-sm font-bold tracking-tight">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 w-full bg-muted/40" />
                    </div>
                )}

                {/* Metric grid */}
                {(isCompleted || isFailed || (total > 0 && !isProcessing)) && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <MetricStat label="Tổng số dòng" value={total} icon={FileSpreadsheet} variant="default" />
                        <MetricStat label="Thành công" value={success} icon={CheckCircle2} variant="success" />
                        <MetricStat
                            label="Lỗi"
                            value={failed}
                            icon={AlertCircle}
                            variant={failed > 0 ? 'error' : 'default'}
                        />
                    </div>
                )}

                {/* Error section */}
                {failed > 0 && (
                    <div className="relative overflow-hidden border border-destructive/20 bg-destructive/5 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:bg-destructive/[0.07]">
                        <div className="flex-1 space-y-1">
                            <h5 className="text-sm font-bold text-destructive">
                                Phát hiện {failed} dòng lỗi trong tệp của bạn
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                                Một số dòng không thể nhập do thiếu thông tin hoặc sai định dạng. Tải báo cáo để kiểm tra và khắc phục.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto border-destructive/20 bg-background/50 hover:bg-destructive/10 hover:border-destructive/30 text-destructive text-xs font-bold shrink-0"
                            onClick={handleDownloadReport}
                        >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download báo cáo lỗi
                        </Button>
                    </div>
                )}

                {/* All-success message */}
                {isCompleted && failed === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">
                            {successMessage
                                ? successMessage(total)
                                : `Tuyệt vời! Toàn bộ ${total} bản ghi đã được nhập thành công.`}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
