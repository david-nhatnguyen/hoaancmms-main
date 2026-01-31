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
  ChevronDown,
  Check
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
import { users, roles, User } from '@/api/mock/systemData';
import { factories } from '@/api/mock/mockData';
import { cn } from '@/lib/utils';

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

export default function UserListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    factory: [],
    role: [],
    status: [],
  });
  const [lockDialog, setLockDialog] = useState<{ open: boolean; user: User | null; action: 'lock' | 'unlock' }>({
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

  const handleLockToggle = (user: User) => {
    setLockDialog({
      open: true,
      user,
      action: user.status === 'active' ? 'lock' : 'unlock'
    });
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Page Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-1">HỆ THỐNG</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lý Người dùng</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="action-btn-secondary">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="action-btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              Xuất
            </Button>
            <Button onClick={() => navigate('/system/users/new')} className="action-btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Thêm người dùng
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng người dùng</p>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Đang hoạt động</p>
            <p className="text-3xl font-bold text-[hsl(var(--status-active))]">{activeCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-status-active/20">
            <UserCheck className="h-5 w-5 text-[hsl(var(--status-active))]" />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Đã khóa</p>
            <p className="text-3xl font-bold text-destructive">{lockedCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/20">
            <UserX className="h-5 w-5 text-destructive" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card rounded-xl border border-border/50 p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, email, vai trò..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background"
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

      {/* Results */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          Hiển thị <span className="font-semibold text-foreground">{filteredUsers.length}</span> người dùng
        </span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50 bg-secondary/30">
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
                <TableRow key={user.id} className="hover:bg-secondary/20 transition-colors">
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
                      "text-xs px-2 py-1 rounded-full font-medium",
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
                            : "text-muted-foreground hover:text-[hsl(var(--status-active))]"
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

      {/* Lock/Unlock Dialog */}
      <Dialog open={lockDialog.open} onOpenChange={(open) => setLockDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {lockDialog.action === 'lock' ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?'}
            </DialogTitle>
            <DialogDescription>
              {lockDialog.action === 'lock' 
                ? `Tài khoản "${lockDialog.user?.fullName}" sẽ không thể đăng nhập vào hệ thống.`
                : `Tài khoản "${lockDialog.user?.fullName}" sẽ có thể đăng nhập lại.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLockDialog(prev => ({ ...prev, open: false }))}>
              Hủy
            </Button>
            <Button 
              variant={lockDialog.action === 'lock' ? 'destructive' : 'default'}
              onClick={() => setLockDialog(prev => ({ ...prev, open: false }))}
            >
              {lockDialog.action === 'lock' ? 'Khóa' : 'Mở khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}