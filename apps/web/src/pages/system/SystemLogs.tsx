import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  User,
  Activity,
  ExternalLink,
  ChevronDown,
  Check,
  Clock,
  FileText,
  Shield,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { systemLogs, users, PERMISSION_MODULES, SystemLog } from '@/data/systemData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileFilters } from '@/components/shared/MobileFilters';

interface Filters {
  user: string[];
  module: string[];
  action: string[];
}

const ACTION_OPTIONS = [
  { value: 'create', label: 'Tạo mới', icon: Plus, color: 'text-[hsl(var(--status-active))]' },
  { value: 'update', label: 'Cập nhật', icon: Pencil, color: 'text-primary' },
  { value: 'delete', label: 'Xóa', icon: Trash2, color: 'text-destructive' },
  { value: 'lock', label: 'Khóa', icon: Lock, color: 'text-[hsl(var(--status-maintenance))]' },
  { value: 'unlock', label: 'Mở khóa', icon: Unlock, color: 'text-[hsl(var(--status-active))]' },
  { value: 'login', label: 'Đăng nhập', icon: LogIn, color: 'text-primary' },
  { value: 'logout', label: 'Đăng xuất', icon: LogOut, color: 'text-muted-foreground' },
  { value: 'export', label: 'Xuất dữ liệu', icon: Download, color: 'text-primary' },
  { value: 'approve', label: 'Duyệt', icon: Check, color: 'text-[hsl(var(--status-active))]' },
];

// Multi-select dropdown
function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  searchable = false,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 border-border/50 bg-secondary/50 hover:bg-secondary",
            selected.length > 0 && "border-primary/50 bg-primary/10"
          )}
        >
          <span className="text-sm">
            {selected.length === 0 ? label : `${label} (${selected.length})`}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-popover border-border z-50" align="start">
        <Command className="bg-transparent">
          {searchable && <CommandInput placeholder={`Tìm...`} className="h-9" />}
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onToggle(option.value)}
                  className="cursor-pointer"
                >
                  <div className={cn(
                    "mr-2 h-4 w-4 rounded border border-primary flex items-center justify-center",
                    selected.includes(option.value) ? "bg-primary" : "bg-transparent"
                  )}>
                    {selected.includes(option.value) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Mobile log card component
function LogCard({
  log,
  onView
}: {
  log: SystemLog;
  onView: () => void;
}) {
  const actionConfig = ACTION_OPTIONS.find(a => a.value === log.action);
  const ActionIcon = actionConfig?.icon || Activity;
  const actionColor = actionConfig?.color || 'text-muted-foreground';
  const actionLabel = actionConfig?.label || log.action;

  return (
    <div
      className="bg-card rounded-xl border border-border/50 p-3"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("shrink-0", actionColor)}>
            <ActionIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{log.userName}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{log.timestamp}</p>
          </div>
        </div>
        <span className={cn("text-xs font-medium shrink-0", actionColor)}>
          {actionLabel}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px]">
          {log.module}
        </span>
        {log.objectName && (
          <span className="text-primary font-mono text-[10px] truncate max-w-[120px]">
            {log.objectName}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{log.details}</p>
    </div>
  );
}

export default function SystemLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    user: [],
    module: [],
    action: [],
  });
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const isMobile = useIsMobile();

  const filteredLogs = useMemo(() => {
    return systemLogs.filter(log => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          log.userName.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          (log.objectName?.toLowerCase().includes(query));
        if (!matches) return false;
      }

      if (filters.user.length && !filters.user.includes(log.userId)) return false;
      if (filters.module.length && !filters.module.includes(log.module)) return false;
      if (filters.action.length && !filters.action.includes(log.action)) return false;

      return true;
    });
  }, [searchQuery, filters]);

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const clearFilters = () => {
    setFilters({ user: [], module: [], action: [] });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  const userOptions = users.map(u => ({ value: u.id, label: u.fullName }));
  const moduleOptions = [
    ...PERMISSION_MODULES.map(m => ({ value: m.name, label: m.name })),
    { value: 'Hệ thống', label: 'Hệ thống' }
  ];
  const actionOptions = ACTION_OPTIONS.map(a => ({ value: a.value, label: a.label }));

  const getActionIcon = (action: string) => {
    const actionConfig = ACTION_OPTIONS.find(a => a.value === action);
    if (!actionConfig) return Activity;
    return actionConfig.icon;
  };

  const getActionColor = (action: string) => {
    const actionConfig = ACTION_OPTIONS.find(a => a.value === action);
    return actionConfig?.color || 'text-muted-foreground';
  };

  const getActionLabel = (action: string) => {
    const actionConfig = ACTION_OPTIONS.find(a => a.value === action);
    return actionConfig?.label || action;
  };

  // Mobile filter sections
  const mobileFilterSections = [
    {
      id: 'user',
      label: 'Người dùng',
      activeCount: filters.user.length,
      content: (
        <div className="flex flex-wrap gap-2">
          {userOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleFilter('user', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                filters.user.includes(opt.value)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 border-border/50 hover:bg-secondary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'module',
      label: 'Module',
      activeCount: filters.module.length,
      content: (
        <div className="flex flex-wrap gap-2">
          {moduleOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleFilter('module', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                filters.module.includes(opt.value)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 border-border/50 hover:bg-secondary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'action',
      label: 'Hành động',
      activeCount: filters.action.length,
      content: (
        <div className="flex flex-wrap gap-2">
          {actionOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleFilter('action', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                filters.action.includes(opt.value)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 border-border/50 hover:bg-secondary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className={cn(
      "animate-fade-in max-w-full overflow-x-hidden",
      isMobile ? "px-4 py-3" : "p-6"
    )}>
      {/* Page Header */}
      <div className="mb-4">
        {!isMobile && <p className="page-subtitle">HỆ THỐNG</p>}
        <div className={cn(
          "flex items-center justify-between gap-2",
          isMobile && "flex-wrap"
        )}>
          <h1 className={cn(
            "font-bold",
            isMobile ? "text-base" : "page-title"
          )}>Nhật ký hệ thống</h1>
          {!isMobile && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="action-btn-secondary">
                <Download className="h-4 w-4" />
                Xuất Excel
              </Button>
              <Button variant="outline" size="sm" className="action-btn-secondary">
                <FileText className="h-4 w-4" />
                Xuất PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={cn(
        "grid gap-3 mb-4",
        isMobile ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-4 gap-4 mb-6"
      )}>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Tổng log</p>
            <p className={cn("font-bold", isMobile ? "text-xl" : "text-3xl")}>{systemLogs.length}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-primary/20">
              <Activity className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Hôm nay</p>
            <p className={cn("font-bold text-[hsl(var(--status-active))]", isMobile ? "text-xl" : "text-3xl")}>
              {systemLogs.filter(l => l.timestamp.includes('18/01/2026')).length}
            </p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-status-active/20">
              <Clock className="h-5 w-5 text-status-active" />
            </div>
          )}
        </div>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Người dùng</p>
            <p className={cn("font-bold text-primary", isMobile ? "text-xl" : "text-3xl")}>
              {new Set(systemLogs.map(l => l.userId)).size}
            </p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Quan trọng</p>
            <p className={cn("font-bold text-[hsl(var(--status-maintenance))]", isMobile ? "text-xl" : "text-3xl")}>
              {systemLogs.filter(l => ['delete', 'lock', 'approve'].includes(l.action)).length}
            </p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-status-maintenance/20">
              <Shield className="h-5 w-5 text-status-maintenance" />
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {isMobile ? (
        <MobileFilters
          searchPlaceholder="Tìm theo người dùng, chi tiết..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          sections={mobileFilterSections}
          activeFiltersCount={Object.values(filters).flat().length}
          onClearAll={clearFilters}
        />
      ) : (
        <div className="bg-card rounded-xl border border-border/50 p-4 mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo người dùng, chi tiết, đối tượng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-9 h-9"
              />
            </div>

            <div className="h-6 w-px bg-border/50" />

            <MultiSelectDropdown
              label="Người dùng"
              options={userOptions}
              selected={filters.user}
              onToggle={(value) => toggleFilter('user', value)}
              searchable
            />

            <MultiSelectDropdown
              label="Module"
              options={moduleOptions}
              selected={filters.module}
              onToggle={(value) => toggleFilter('module', value)}
            />

            <MultiSelectDropdown
              label="Hành động"
              options={actionOptions}
              selected={filters.action}
              onToggle={(value) => toggleFilter('action', value)}
            />

            {(hasActiveFilters || searchQuery) && (
              <>
                <div className="h-6 w-px bg-border/50" />
                <button
                  onClick={clearFilters}
                  className="text-xs text-destructive hover:text-destructive/80 font-medium"
                >
                  Xóa bộ lọc
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className={cn(
        "flex items-center justify-between",
        isMobile ? "mb-2" : "mb-3"
      )}>
        <span className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
          Hiển thị <span className="font-semibold text-foreground">{filteredLogs.length}</span> bản ghi
        </span>
      </div>

      {/* Table / Cards */}
      {isMobile ? (
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Không tìm thấy bản ghi nào
            </div>
          ) : (
            filteredLogs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                onView={() => setSelectedLog(log)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="table-header-cell w-[160px]">Thời gian</TableHead>
                <TableHead className="table-header-cell">Người dùng</TableHead>
                <TableHead className="table-header-cell text-center">Hành động</TableHead>
                <TableHead className="table-header-cell">Module</TableHead>
                <TableHead className="table-header-cell">Đối tượng</TableHead>
                <TableHead className="table-header-cell">Chi tiết</TableHead>
                <TableHead className="table-header-cell text-right w-[80px]">Xem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Không tìm thấy bản ghi nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <TableRow
                      key={log.id}
                      className="table-row-interactive"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="font-medium">{log.userName}</TableCell>
                      <TableCell className="text-center">
                        <div className={cn("inline-flex items-center gap-1.5", getActionColor(log.action))}>
                          <ActionIcon className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">{getActionLabel(log.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md bg-secondary text-xs">
                          {log.module}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.objectName ? (
                          <span className="text-primary font-mono">{log.objectName}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {log.details}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Log Detail Sheet */}
      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className={cn(
          "bg-card border-border",
          isMobile ? "w-full" : "w-[400px] sm:w-[540px]"
        )}>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Activity className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              <span className={isMobile ? "text-base" : ""}>Chi tiết nhật ký</span>
            </SheetTitle>
          </SheetHeader>

          {selectedLog && (
            <div className={cn("mt-4 space-y-3", !isMobile && "mt-6 space-y-4")}>
              <div className="grid grid-cols-2 gap-2">
                <div className={cn(
                  "bg-secondary/50 rounded-lg",
                  isMobile ? "p-2.5" : "p-3"
                )}>
                  <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-xs")}>Thời gian</p>
                  <p className={cn("font-mono", isMobile ? "text-xs" : "text-sm")}>{selectedLog.timestamp}</p>
                </div>
                <div className={cn(
                  "bg-secondary/50 rounded-lg",
                  isMobile ? "p-2.5" : "p-3"
                )}>
                  <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-xs")}>Người dùng</p>
                  <p className={cn("font-medium", isMobile ? "text-xs" : "text-sm")}>{selectedLog.userName}</p>
                </div>
              </div>

              <div className={cn(
                "bg-secondary/50 rounded-lg",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-xs")}>Hành động</p>
                <div className={cn("flex items-center gap-2", getActionColor(selectedLog.action))}>
                  {(() => {
                    const ActionIcon = getActionIcon(selectedLog.action);
                    return <ActionIcon className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />;
                  })()}
                  <span className={cn("font-medium", isMobile ? "text-sm" : "")}>{getActionLabel(selectedLog.action)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className={cn(
                  "bg-secondary/50 rounded-lg",
                  isMobile ? "p-2.5" : "p-3"
                )}>
                  <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-xs")}>Module</p>
                  <p className={cn(isMobile ? "text-xs" : "text-sm")}>{selectedLog.module}</p>
                </div>
                <div className={cn(
                  "bg-secondary/50 rounded-lg",
                  isMobile ? "p-2.5" : "p-3"
                )}>
                  <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-xs")}>Đối tượng</p>
                  <p className={cn("font-mono text-primary truncate", isMobile ? "text-xs" : "text-sm")}>
                    {selectedLog.objectName || '-'}
                  </p>
                </div>
              </div>

              <div className={cn(
                "bg-secondary/50 rounded-lg",
                isMobile ? "p-2.5" : "p-3"
              )}>
                <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-xs")}>Chi tiết</p>
                <p className={cn(isMobile ? "text-xs" : "text-sm")}>{selectedLog.details}</p>
              </div>

              {(selectedLog.ipAddress || selectedLog.device) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className={cn(
                    "bg-secondary/50 rounded-lg",
                    isMobile ? "p-2.5" : "p-3"
                  )}>
                    <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-xs")}>Địa chỉ IP</p>
                    <p className={cn("font-mono", isMobile ? "text-xs" : "text-sm")}>{selectedLog.ipAddress || '-'}</p>
                  </div>
                  <div className={cn(
                    "bg-secondary/50 rounded-lg",
                    isMobile ? "p-2.5" : "p-3"
                  )}>
                    <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-xs")}>Thiết bị</p>
                    <p className={cn(isMobile ? "text-xs" : "text-sm")}>{selectedLog.device || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
