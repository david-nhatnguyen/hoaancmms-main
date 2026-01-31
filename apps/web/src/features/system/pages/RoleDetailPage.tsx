import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { roles, ACTION_LABELS, Role } from '@/api/mock/systemData';
import { toast } from 'sonner';

export default function RoleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch
    const foundRole = roles.find(r => r.id === id);
    if (foundRole) {
      setRole(foundRole);
    }
    setLoading(false);
  }, [id]);

  const handleSave = () => {
    toast.success('Đã lưu thay đổi phân quyền');
  };

  if (loading) return <div>Loading...</div>;
  if (!role) return <div>Role not found</div>;

  return (
    <div className="p-6 animate-fade-in max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/system/roles')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{role.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Chi tiết và phân quyền</p>
          </div>
        </div>
        <Button onClick={handleSave} className="action-btn-primary">
          <Save className="h-4 w-4 mr-2" />
          Lưu thay đổi
        </Button>
      </div>

      <div className="space-y-6">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Thông tin chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên vai trò</Label>
                <Input defaultValue={role.name} disabled={role.isSystem} />
              </div>
              <div className="space-y-2">
                <Label>Mã vai trò</Label>
                <Input defaultValue={role.id} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea defaultValue={role.description} disabled={role.isSystem} />
            </div>
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Phân quyền chức năng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="w-[200px]">Chức năng</TableHead>
                  {Object.entries(ACTION_LABELS).map(([key, label]) => (
                    <TableHead key={key} className="text-center w-[100px]">{label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {role.permissions.map((perm) => (
                  <TableRow key={perm.moduleId} className="hover:bg-secondary/10">
                    <TableCell className="font-medium">
                      {perm.moduleName}
                    </TableCell>
                    {Object.keys(ACTION_LABELS).map((actionKey) => {
                      const action = actionKey as keyof typeof perm.actions;
                      return (
                        <TableCell key={action} className="text-center">
                          <div className="flex justify-center">
                            <Checkbox 
                              checked={perm.actions[action]} 
                              disabled={role.isSystem} // Disable editing for system roles in this mock
                            />
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}