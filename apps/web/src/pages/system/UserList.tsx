import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Download, 
  FileSpreadsheet,
  Eye,
  Pencil,
  Lock,
  Unlock,
  KeyRound,
  Users,
  UserCheck,
  UserX,
  X,
  ChevronDown,
  Check,
  MoreVertical
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { users, roles } from '@/data/systemData';
import { factories } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileFilters } from '@/components/shared/MobileFilters';

interface Filters {
  factory: string[];
  role: string[];
  status: string[];
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động', color: 'bg-status-active' },
  { value: 'locked', label: 'Đã khóa', color: 'bg-status-inactive' },
];

// Multi-select dropdown component
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
  const selectedLabels = options
    .filter(o => selected.includes(o.value))
    .map(o => o.label);

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
            {selected.length === 0 
              ? label 
              : selected.length === 1 
                ? selectedLabels[0]
                : `${label} (${selected.length})`
            }
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-popover border-border z-50" align="start">
        <Command className="bg-transparent">
          {searchable && <CommandInput placeholder={`Tìm ${label.toLowerCase()}...`} className="h-9" />}
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

// Chip filter component
function ChipFilter({
  options,
  selected,
  onToggle
}: {
  options: { value: string; label: string; color: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onToggle(option.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            selected.includes(option.value)
              ? `${option.color} text-white border-transparent shadow-sm`
              : "bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Mobile user card component
function UserCard({ 
  user, 
  onView, 
  onEdit, 
  onLockToggle 
}: { 
  user: typeof users[0]; 
  onView: () => void;
  onEdit: () => void;
  onLockToggle: () => void;
}) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{user.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={onView} className="gap-2">
              <Eye className="h-3.5 w-3.5" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Pencil className="h-3.5 w-3.5" />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLockToggle} className="gap-2">
              {user.status === 'active' ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              {user.status === 'active' ? 'Khóa' : 'Mở khóa'}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <KeyRound className="h-3.5 w-3.5" />
              Đặt lại mật khẩu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-medium">
          {user.role}
        </span>
        <span className={cn(
          "status-badge text-[10px]",
          user.status === 'active' 
            ? "bg-status-active/20 text-[hsl(var(--status-active))]"
            : "bg-status-inactive/20 text-[hsl(var(--status-inactive))]"
        )}>
          {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 truncate">
        Nhà máy: {user.factoryNames.join(', ')}
      </p>
    </div>
  );
}

export default function UserList() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    factory: [],
    role: [],
    status: [],
  });
  const [lockDialog, setLockDialog] = useState<{ open: boolean; user: typeof users[0] | null; action: 'lock' | 'unlock' }>({
    open: false,
    user: null,
    action: 'lock'
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.factory.length && !filters.factory.some(f => user.factories.includes(f) || user.factories.includes('all'))) return false;
      if (filters.role.length && !filters.role.includes(user.roleId)) return false;
      if (filters.status.length && !filters.status.includes(user.status)) return false;

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
    setFilters({ factory: [], role: [], status: [] });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  const activeCount = users.filter(u => u.status === 'active').length;
  const lockedCount = users.filter(u => u.status === 'locked').length;

  const factoryOptions = factories.map(f => ({ value: f.id, label: f.name }));
  const roleOptions = roles.map(r => ({ value: r.id, label: r.name }));

  const handleLockToggle = (user: typeof users[0]) => {
    setLockDialog({
      open: true,
      user,
      action: user.status === 'active' ? 'lock' : 'unlock'
    });
  };

  // Mobile filter sections
  const mobileFilterSections = [
    {
      id: 'factory',
      label: 'Nhà máy',
      activeCount: filters.factory.length,
      content: (
        <div className="flex flex-wrap gap-2">
          {factoryOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleFilter('factory', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                filters.factory.includes(opt.value)
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
      id: 'role',
      label: 'Vai trò',
      activeCount: filters.role.length,
      content: (
        <div className="flex flex-wrap gap-2">
          {roleOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleFilter('role', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                filters.role.includes(opt.value)
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
      id: 'status',
      label: 'Trạng thái',
      activeCount: filters.status.length,
      content: (
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleFilter('status', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                filters.status.includes(opt.value)
                  ? `${opt.color} text-white border-transparent`
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
          )}>Quản lý Người dùng</h1>
          <div className={cn(
            "flex items-center gap-2",
            isMobile && "w-full mt-2"
          )}>
            {!isMobile && (
              <>
                <Button variant="outline" size="sm" className="action-btn-secondary">
                  <FileSpreadsheet className="h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" size="sm" className="action-btn-secondary">
                  <Download className="h-4 w-4" />
                  Xuất
                </Button>
              </>
            )}
            <Button 
              onClick={() => navigate('/system/users/new')} 
              className={cn(
                "action-btn-primary",
                isMobile && "flex-1 h-9"
              )}
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4" />
              <span className={isMobile ? "text-xs" : ""}>Thêm người dùng</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={cn(
        "grid gap-3 mb-4",
        isMobile ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      )}>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Tổng</p>
            <p className={cn("font-bold", isMobile ? "text-xl" : "text-3xl")}>{users.length}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Hoạt động</p>
            <p className={cn("font-bold text-[hsl(var(--status-active))]", isMobile ? "text-xl" : "text-3xl")}>{activeCount}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-status-active/20">
              <UserCheck className="h-5 w-5 text-status-active" />
            </div>
          )}
        </div>
        <div className={cn(
          "stat-card flex items-center justify-between",
          isMobile && "p-2.5"
        )}>
          <div>
            <p className={cn("text-muted-foreground mb-0.5", isMobile ? "text-[10px]" : "text-sm mb-1")}>Đã khóa</p>
            <p className={cn("font-bold text-[hsl(var(--status-inactive))]", isMobile ? "text-xl" : "text-3xl")}>{lockedCount}</p>
          </div>
          {!isMobile && (
            <div className="stat-card-icon bg-status-inactive/20">
              <UserX className="h-5 w-5 text-status-inactive" />
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {isMobile ? (
        <MobileFilters
          searchPlaceholder="Tìm theo tên, email..."
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
                placeholder="Tìm theo tên, email, vai trò..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-9 h-9"
              />
            </div>

            <div className="h-6 w-px bg-border/50" />

            <MultiSelectDropdown
              label="Nhà máy"
              options={factoryOptions}
              selected={filters.factory}
              onToggle={(value) => toggleFilter('factory', value)}
              searchable
            />

            <MultiSelectDropdown
              label="Vai trò"
              options={roleOptions}
              selected={filters.role}
              onToggle={(value) => toggleFilter('role', value)}
            />

            <div className="h-6 w-px bg-border/50" />

            <ChipFilter
              options={STATUS_OPTIONS}
              selected={filters.status}
              onToggle={(value) => toggleFilter('status', value)}
            />
          </div>

          {(hasActiveFilters || searchQuery) && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground">Đang lọc:</span>
              <button 
                onClick={clearFilters}
                className="text-xs text-destructive hover:text-destructive/80 font-medium"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className={cn(
        "flex items-center justify-between",
        isMobile ? "mb-2" : "mb-3"
      )}>
        <span className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
          Hiển thị <span className="font-semibold text-foreground">{filteredUsers.length}</span> người dùng
        </span>
      </div>

      {/* Table / Cards */}
      {isMobile ? (
        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Không tìm thấy người dùng nào
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onView={() => navigate(`/system/users/${user.id}`)}
                onEdit={() => navigate(`/system/users/${user.id}/edit`)}
                onLockToggle={() => handleLockToggle(user)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="table-header-cell">Họ và tên</TableHead>
                <TableHead className="table-header-cell">Tài khoản</TableHead>
                <TableHead className="table-header-cell">Vai trò</TableHead>
                <TableHead className="table-header-cell">Nhà máy</TableHead>
                <TableHead className="table-header-cell text-center">Trạng thái</TableHead>
                <TableHead className="table-header-cell">Đăng nhập gần nhất</TableHead>
                <TableHead className="table-header-cell text-right w-[140px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="table-row-interactive">
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.factoryNames.join(', ')}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        "status-badge",
                        user.status === 'active' 
                          ? "bg-status-active/20 text-[hsl(var(--status-active))]"
                          : "bg-status-inactive/20 text-[hsl(var(--status-inactive))]"
                      )}>
                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastLogin || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/system/users/${user.id}`)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/system/users/${user.id}/edit`)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleLockToggle(user)}
                          className={cn(
                            "h-8 w-8",
                            user.status === 'active' 
                              ? "text-muted-foreground hover:text-destructive"
                              : "text-muted-foreground hover:text-status-active"
                          )}
                          title={user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        >
                          {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Đặt lại mật khẩu"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Lock/Unlock Dialog */}
      <Dialog open={lockDialog.open} onOpenChange={(open) => setLockDialog(prev => ({ ...prev, open }))}>
        <DialogContent className={cn(
          "bg-card border-border",
          isMobile && "max-w-[calc(100vw-32px)] mx-4"
        )}>
          <DialogHeader>
            <DialogTitle className={isMobile ? "text-base" : ""}>
              {lockDialog.action === 'lock' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
            </DialogTitle>
            <DialogDescription className={isMobile ? "text-xs" : ""}>
              {lockDialog.action === 'lock' 
                ? `Tài khoản "${lockDialog.user?.fullName}" sẽ không thể đăng nhập vào hệ thống.`
                : `Tài khoản "${lockDialog.user?.fullName}" sẽ có thể đăng nhập lại.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={cn("gap-2", isMobile && "flex-row")}>
            <Button 
              variant="outline" 
              onClick={() => setLockDialog(prev => ({ ...prev, open: false }))}
              className={cn(isMobile && "flex-1 h-9 text-xs")}
            >
              Hủy
            </Button>
            <Button 
              variant={lockDialog.action === 'lock' ? 'destructive' : 'default'}
              onClick={() => setLockDialog(prev => ({ ...prev, open: false }))}
              className={cn(isMobile && "flex-1 h-9 text-xs")}
            >
              {lockDialog.action === 'lock' ? 'Khóa' : 'Mở khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
