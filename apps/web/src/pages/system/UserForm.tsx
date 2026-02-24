import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Lock,
    Shield,
    Building2,
    Eye,
    EyeOff,
    Loader2,
    ChevronsUpDown,
    Check,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { users, roles } from '@/data/systemData';
import { factories } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

export default function UserForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const isEdit = Boolean(id);

    const existingUser = id ? users.find((u) => u.id === id) : undefined;

    // Form state
    const [username, setUsername] = useState(existingUser?.email?.split('@')[0] ?? '');
    const [fullName, setFullName] = useState(existingUser?.fullName ?? '');
    const [email, setEmail] = useState(existingUser?.email ?? '');
    const [phone, setPhone] = useState(existingUser?.phone ?? '');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [notes, setNotes] = useState(existingUser?.notes ?? '');
    const [forcePasswordChange, setForcePasswordChange] = useState(!isEdit);

    // Role & factory
    const [selectedRoleId, setSelectedRoleId] = useState<string>(existingUser?.roleId ?? '');
    const [selectedFactoryIds, setSelectedFactoryIds] = useState<string[]>(
        existingUser?.factories ?? [],
    );
    const [allFactories, setAllFactories] = useState(
        existingUser?.factories?.includes('all') ?? false,
    );

    // Combobox open state
    const [roleOpen, setRoleOpen] = useState(false);
    const [factoryOpen, setFactoryOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const selectedRole = roles.find((r) => r.id === selectedRoleId);

    const toggleFactory = (factoryId: string) => {
        if (allFactories) {
            setAllFactories(false);
            setSelectedFactoryIds([factoryId]);
            return;
        }
        setSelectedFactoryIds((prev) =>
            prev.includes(factoryId) ? prev.filter((f) => f !== factoryId) : [...prev, factoryId],
        );
    };

    const toggleAllFactories = () => {
        setAllFactories((prev) => {
            if (!prev) setSelectedFactoryIds([]);
            return !prev;
        });
    };

    const factoryLabels = allFactories
        ? 'Tất cả nhà máy'
        : selectedFactoryIds.length === 0
            ? 'Chưa chọn nhà máy'
            : factories
                .filter((f) => selectedFactoryIds.includes(f.id))
                .map((f) => f.name)
                .join(', ');

    const handleSave = async () => {
        if (!fullName.trim()) { toast.error('Họ và tên không được để trống'); return; }
        if (!isEdit && !password) { toast.error('Mật khẩu không được để trống'); return; }
        if (!selectedRoleId) { toast.error('Vui lòng chọn vai trò cho người dùng'); return; }

        setIsSaving(true);
        try {
            await new Promise((r) => setTimeout(r, 800));
            toast.success(isEdit ? 'Cập nhật người dùng thành công' : 'Tạo người dùng thành công');
            navigate('/system/users');
        } catch {
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className={cn(
                'max-w-full overflow-x-hidden',
                isMobile ? 'px-4 py-3 pb-24' : 'p-6',
            )}
        >
            {/* ── Header ── */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/system/users')}
                    className="-ml-2 mb-3 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Quay lại
                </Button>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">HỆ THỐNG</p>
                            <h1 className={cn('font-bold', isMobile ? 'text-lg' : 'page-title')}>
                                {isEdit ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}
                            </h1>
                        </div>
                    </div>

                    {!isMobile && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/system/users')}
                                disabled={isSaving}
                                className="action-btn-secondary"
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} className="action-btn-primary">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isEdit ? 'Lưu thay đổi' : 'Tạo người dùng'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6 max-w-4xl">
                {/* ── Basic Info ── */}
                <div>
                    <Card className="border border-border/60 shadow-sm bg-card">
                        <CardHeader className="pb-4 border-b border-border/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-primary/10">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-0.5">Họ tên, email và số điện thoại</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">
                                    Họ và tên <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="VD: Nguyễn Văn An"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Tên đăng nhập</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">@</span>
                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                        className="pl-7 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="VD: nguyen.van@company.com"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="VD: 0901234567"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {isEdit ? 'Mật khẩu mới (bỏ trống để giữ nguyên)' : <>Mật khẩu <span className="text-destructive">*</span></>}
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={isEdit ? '••••••••' : 'Tối thiểu 6 ký tự'}
                                        className="pl-9 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Ghi chú</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Thông tin bổ sung..."
                                    className="resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                                <Switch
                                    id="force-pwd"
                                    checked={forcePasswordChange}
                                    onCheckedChange={setForcePasswordChange}
                                />
                                <div>
                                    <Label htmlFor="force-pwd" className="cursor-pointer font-medium">
                                        Yêu cầu đổi mật khẩu lần đầu
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Người dùng phải đổi mật khẩu khi đăng nhập lần đầu</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Role & Factory ── */}
                <div>
                    <Card className="border border-border/60 shadow-sm bg-card">
                        <CardHeader className="pb-4 border-b border-border/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-md bg-primary/10">
                                    <Shield className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Vai trò & Phạm vi nhà máy</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Phân quyền truy cập hệ thống
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Role selector */}
                            <div className="space-y-2">
                                <Label>
                                    Vai trò <span className="text-destructive">*</span>
                                </Label>
                                <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                'w-full justify-between h-10 font-normal',
                                                !selectedRoleId && 'text-muted-foreground',
                                            )}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                <span className="truncate">
                                                    {selectedRole ? selectedRole.name : 'Chọn vai trò...'}
                                                </span>
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full min-w-[320px] p-0 bg-popover border-border" align="start">
                                        <Command>
                                            <CommandInput placeholder="Tìm vai trò..." className="h-9" />
                                            <CommandList>
                                                <CommandEmpty>Không tìm thấy vai trò</CommandEmpty>
                                                <CommandGroup>
                                                    {roles.map((role) => (
                                                        <CommandItem
                                                            key={role.id}
                                                            value={role.id}
                                                            onSelect={() => {
                                                                setSelectedRoleId(role.id);
                                                                setRoleOpen(false);
                                                            }}
                                                            className="gap-3 py-3"
                                                        >
                                                            <div
                                                                className={cn(
                                                                    'p-1.5 rounded-md shrink-0',
                                                                    role.id === 'admin' ? 'bg-destructive/20' : 'bg-primary/10',
                                                                )}
                                                            >
                                                                <Shield
                                                                    className={cn(
                                                                        'h-3.5 w-3.5',
                                                                        role.id === 'admin' ? 'text-destructive' : 'text-primary',
                                                                    )}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium">{role.name}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{role.description}</p>
                                                            </div>
                                                            {selectedRoleId === role.id && (
                                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                            )}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                {/* Role permissions preview */}
                                {selectedRole && (
                                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/15">
                                        <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1.5">
                                            <Shield className="h-3.5 w-3.5" />
                                            Quyền của vai trò này:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedRole.permissions
                                                .filter((p) => Object.values(p.actions).some(Boolean))
                                                .slice(0, 8)
                                                .map((p) => {
                                                    const actionCount = Object.values(p.actions).filter(Boolean).length;
                                                    return (
                                                        <span
                                                            key={p.moduleId}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium"
                                                        >
                                                            {p.moduleName}
                                                            <span className="opacity-60">({actionCount})</span>
                                                        </span>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Factory selector */}
                            <div className="space-y-2">
                                <Label>Phạm vi nhà máy</Label>

                                {/* All factories toggle */}
                                <div
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                                        allFactories
                                            ? 'bg-primary/10 border-primary/30'
                                            : 'bg-muted/30 border-border/40 hover:bg-muted/50',
                                    )}
                                    onClick={toggleAllFactories}
                                >
                                    <div
                                        className={cn(
                                            'h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                                            allFactories
                                                ? 'bg-primary border-primary'
                                                : 'bg-transparent border-border',
                                        )}
                                    >
                                        {allFactories && <Check className="h-3 w-3 text-primary-foreground" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Tất cả nhà máy</p>
                                        <p className="text-xs text-muted-foreground">
                                            Người dùng có thể truy cập tất cả nhà máy trong hệ thống
                                        </p>
                                    </div>
                                </div>

                                {/* Specific factories */}
                                {!allFactories && (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {factories.map((factory) => {
                                                const isSelected = selectedFactoryIds.includes(factory.id);
                                                return (
                                                    <button
                                                        key={factory.id}
                                                        type="button"
                                                        onClick={() => toggleFactory(factory.id)}
                                                        className={cn(
                                                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                                                            isSelected
                                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                                : 'bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground',
                                                        )}
                                                    >
                                                        <Building2 className="inline h-3 w-3 mr-1" />
                                                        {factory.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {selectedFactoryIds.length === 0 && (
                                            <div className="flex items-center gap-1.5 text-xs text-amber-500/80">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                Chưa chọn nhà máy nào – người dùng sẽ không thấy dữ liệu
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom action bar for mobile */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 p-4 flex gap-2 z-50">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate('/system/users')}
                        disabled={isSaving}
                    >
                        Hủy
                    </Button>
                    <Button
                        className="flex-1 action-btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isEdit ? 'Lưu' : 'Tạo'}
                    </Button>
                </div>
            )}
        </div>
    );
}
