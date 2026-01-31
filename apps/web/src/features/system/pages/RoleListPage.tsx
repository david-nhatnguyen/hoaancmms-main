import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Shield, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { roles } from '@/api/mock/systemData';

export default function RoleListPage() {
  const navigate = useNavigate();
  const [roleList] = useState(roles);

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-1">HỆ THỐNG</p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Vai trò & Phân quyền</h1>
          <Button onClick={() => navigate('/system/roles/new')} className="action-btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Thêm vai trò
          </Button>
        </div>
      </div>

      {/* Role List */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50 bg-secondary/30">
              <TableHead className="w-[250px]">Tên vai trò</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[150px] text-center">Người dùng</TableHead>
              <TableHead className="w-[150px] text-center">Loại</TableHead>
              <TableHead className="w-[120px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roleList.map((role) => (
              <TableRow 
                key={role.id} 
                className="hover:bg-secondary/20 transition-colors cursor-pointer"
                onClick={() => navigate(`/system/roles/${role.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Shield className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{role.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {role.description}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{role.userCount}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {role.isSystem ? (
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary">
                      Hệ thống
                    </Badge>
                  ) : (
                    <Badge variant="outline">Tùy chỉnh</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/system/roles/${role.id}`)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}