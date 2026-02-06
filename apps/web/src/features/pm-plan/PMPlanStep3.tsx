import { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Filter, 
  Search,
  Link2,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { equipments, EQUIPMENT_GROUPS } from '@/data/mockData';
import { checklistTemplates } from '@/data/checklistData';
import { ASSIGNEES } from '@/data/pmPlanData';
import { cn } from '@/lib/utils';

export interface PMPlanEquipmentItem {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentGroup: string;
  machineType: string;
  checklistId: string | null;
  checklistName: string | null;
  plannedDate: string | null;
  assignee: string | null;
  companionEquipment: string[]; // IDs of companion equipment
}

interface PMPlanStep3Props {
  factoryId: string;
  items: PMPlanEquipmentItem[];
  defaultDate: string;
  defaultAssignees: string[];
  applyToAll: boolean;
  allowPerDeviceChange: boolean;
  onChange: (items: PMPlanEquipmentItem[]) => void;
}

export function PMPlanStep3({ 
  factoryId, 
  items, 
  defaultDate, 
  defaultAssignees,
  applyToAll,
  allowPerDeviceChange,
  onChange 
}: PMPlanStep3Props) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCompanionSheet, setShowCompanionSheet] = useState(false);
  const [selectedItemForCompanion, setSelectedItemForCompanion] = useState<string | null>(null);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeChecklists = checklistTemplates.filter(c => c.status === 'active');

  const factoryEquipments = useMemo(() => {
    if (!factoryId) return [];
    return equipments.filter(e => e.factoryId === factoryId);
  }, [factoryId]);

  const availableEquipments = useMemo(() => {
    const addedIds = items.map(i => i.equipmentId);
    // Also exclude companion equipment
    const companionIds = items.flatMap(i => i.companionEquipment);
    let filtered = factoryEquipments.filter(e => !addedIds.includes(e.id) && !companionIds.includes(e.id));
    if (groupFilter) {
      filtered = filtered.filter(e => e.groupId === groupFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.code.toLowerCase().includes(query) || 
        e.name.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [factoryEquipments, items, groupFilter, searchQuery]);

  const availableCompanionEquipments = useMemo(() => {
    if (!selectedItemForCompanion) return [];
    const mainItem = items.find(i => i.id === selectedItemForCompanion);
    if (!mainItem) return [];
    
    const addedIds = items.map(i => i.equipmentId);
    const companionIds = items.flatMap(i => i.companionEquipment);
    
    return factoryEquipments.filter(e => 
      e.id !== mainItem.equipmentId && 
      !addedIds.includes(e.id) &&
      !companionIds.includes(e.id)
    );
  }, [factoryEquipments, items, selectedItemForCompanion]);

  const validation = useMemo(() => {
    const missingChecklist = items.filter(i => !i.checklistId);
    const missingDate = items.filter(i => !i.plannedDate);
    return { missingChecklist, missingDate };
  }, [items]);

  const handleAddEquipments = () => {
    const newItems: PMPlanEquipmentItem[] = selectedEquipments.map(eqId => {
      const eq = equipments.find(e => e.id === eqId)!;
      const group = EQUIPMENT_GROUPS[eq.groupId as keyof typeof EQUIPMENT_GROUPS];
      return {
        id: `pmi-new-${Date.now()}-${eqId}`,
        equipmentId: eq.id,
        equipmentCode: eq.code,
        equipmentName: eq.name,
        equipmentGroup: group?.name || '',
        machineType: eq.machineType,
        checklistId: null,
        checklistName: null,
        plannedDate: defaultDate || null,
        assignee: applyToAll && defaultAssignees.length > 0 ? defaultAssignees[0] : null,
        companionEquipment: []
      };
    });
    
    onChange([...items, ...newItems]);
    setSelectedEquipments([]);
    setShowAddDialog(false);
  };

  const handleRemoveItem = (itemId: string) => {
    onChange(items.filter(i => i.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof PMPlanEquipmentItem, value: string | null | string[]) => {
    onChange(items.map(item => {
      if (item.id === itemId) {
        if (field === 'checklistId') {
          const checklist = activeChecklists.find(c => c.id === value);
          return { 
            ...item, 
            checklistId: value as string | null,
            checklistName: checklist?.name || null
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleOpenCompanionSheet = (itemId: string) => {
    setSelectedItemForCompanion(itemId);
    setShowCompanionSheet(true);
  };

  const handleAddCompanion = (companionId: string) => {
    if (!selectedItemForCompanion) return;
    
    onChange(items.map(item => {
      if (item.id === selectedItemForCompanion) {
        return {
          ...item,
          companionEquipment: [...item.companionEquipment, companionId]
        };
      }
      return item;
    }));
  };

  const handleRemoveCompanion = (itemId: string, companionId: string) => {
    onChange(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          companionEquipment: item.companionEquipment.filter(id => id !== companionId)
        };
      }
      return item;
    }));
  };

  const getEquipmentById = (id: string) => equipments.find(e => e.id === id);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button 
          onClick={() => setShowAddDialog(true)} 
          disabled={!factoryId}
          className="action-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Thêm thiết bị
        </Button>
        <Button variant="outline" disabled className="action-btn-secondary">
          <Upload className="h-4 w-4" />
          Import danh sách
        </Button>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={groupFilter || 'all'} onValueChange={(v) => setGroupFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[180px] h-9 bg-secondary/50 border-border">
              <SelectValue placeholder="Tất cả nhóm" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Tất cả nhóm</SelectItem>
              {Object.values(EQUIPMENT_GROUPS).map(g => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Validation Summary */}
      {items.length > 0 && (validation.missingChecklist.length > 0 || validation.missingDate.length > 0) && (
        <div className="flex items-center gap-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 text-sm">
            {validation.missingChecklist.length > 0 && (
              <span className="text-destructive font-medium">
                {validation.missingChecklist.length} thiết bị chưa có checklist
              </span>
            )}
            {validation.missingChecklist.length > 0 && validation.missingDate.length > 0 && (
              <span className="mx-2 text-muted-foreground">•</span>
            )}
            {validation.missingDate.length > 0 && (
              <span className="text-destructive font-medium">
                {validation.missingDate.length} thiết bị chưa có ngày
              </span>
            )}
          </div>
        </div>
      )}

      {/* Equipment Table */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-secondary/20 rounded-xl border border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Chưa có thiết bị nào trong kế hoạch</p>
          <p className="text-sm text-muted-foreground mt-1">Nhấn "Thêm thiết bị" để bắt đầu</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50 bg-secondary/30">
                <TableHead className="table-header-cell w-[100px]">Mã TB</TableHead>
                <TableHead className="table-header-cell">Thiết bị</TableHead>
                <TableHead className="table-header-cell w-[200px]">Checklist</TableHead>
                <TableHead className="table-header-cell w-[140px]">Ngày KH</TableHead>
                <TableHead className="table-header-cell w-[160px]">Người phụ trách</TableHead>
                <TableHead className="table-header-cell w-[180px]">TB đi kèm</TableHead>
                <TableHead className="table-header-cell w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    "border-border/50",
                    (!item.checklistId || !item.plannedDate) && "bg-destructive/5"
                  )}
                >
                  <TableCell className="font-mono text-primary font-medium">
                    {item.equipmentCode}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.equipmentName}</p>
                      <p className="text-xs text-muted-foreground">{item.equipmentGroup}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={item.checklistId || ''} 
                      onValueChange={(v) => updateItem(item.id, 'checklistId', v || null)}
                    >
                      <SelectTrigger className={cn(
                        "h-9 bg-secondary/50 border-border text-sm",
                        !item.checklistId && "border-destructive/50"
                      )}>
                        <SelectValue placeholder="Chọn checklist" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {activeChecklists
                          .filter(c => c.machineType === item.machineType)
                          .map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={item.plannedDate || ''}
                      onChange={(e) => updateItem(item.id, 'plannedDate', e.target.value || null)}
                      className={cn(
                        "h-9 bg-secondary/50 border-border text-sm",
                        !item.plannedDate && "border-destructive/50"
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={item.assignee || ''} 
                      onValueChange={(v) => updateItem(item.id, 'assignee', v || null)}
                      disabled={applyToAll && !allowPerDeviceChange}
                    >
                      <SelectTrigger className="h-9 bg-secondary/50 border-border text-sm">
                        <SelectValue placeholder="Chọn người" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {ASSIGNEES.map(a => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.companionEquipment.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.companionEquipment.map(compId => {
                            const comp = getEquipmentById(compId);
                            return (
                              <Badge 
                                key={compId} 
                                variant="secondary"
                                className="text-xs flex items-center gap-1"
                              >
                                {comp?.code}
                                <button 
                                  onClick={() => handleRemoveCompanion(item.id, compId)}
                                  className="hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenCompanionSheet(item.id)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Link2 className="h-3 w-3 mr-1" />
                        + Thêm TB đi kèm
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Tổng cộng: <span className="font-medium text-foreground">{items.length} thiết bị chính</span>
          {items.reduce((acc, i) => acc + i.companionEquipment.length, 0) > 0 && (
            <>, <span className="font-medium text-foreground">
              {items.reduce((acc, i) => acc + i.companionEquipment.length, 0)} thiết bị đi kèm
            </span></>
          )}
        </p>
      )}

      {/* Add Equipment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm thiết bị vào kế hoạch</DialogTitle>
            <DialogDescription>
              Chọn thiết bị để thêm vào kế hoạch bảo dưỡng
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã hoặc tên thiết bị..."
                  className="pl-10 bg-secondary/50 border-border"
                />
              </div>
              <Select value={groupFilter || 'all'} onValueChange={(v) => setGroupFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[180px] bg-secondary/50 border-border">
                  <SelectValue placeholder="Tất cả nhóm" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">Tất cả nhóm</SelectItem>
                  {Object.values(EQUIPMENT_GROUPS).map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-border rounded-lg max-h-[300px] overflow-y-auto">
              {availableEquipments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Không còn thiết bị nào để thêm
                </div>
              ) : (
                availableEquipments.map(eq => (
                  <div 
                    key={eq.id}
                    className="flex items-center gap-3 p-3 border-b border-border/50 last:border-0 hover:bg-secondary/30"
                  >
                    <Checkbox
                      checked={selectedEquipments.includes(eq.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEquipments([...selectedEquipments, eq.id]);
                        } else {
                          setSelectedEquipments(selectedEquipments.filter(id => id !== eq.id));
                        }
                      }}
                      className="border-muted-foreground data-[state=checked]:bg-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{eq.code} - {eq.name}</p>
                      <p className="text-xs text-muted-foreground">{eq.machineType}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setSelectedEquipments([]); }}>
              Hủy
            </Button>
            <Button 
              onClick={handleAddEquipments}
              disabled={selectedEquipments.length === 0}
              className="action-btn-primary"
            >
              Thêm {selectedEquipments.length} thiết bị
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Companion Equipment Sheet */}
      <Sheet open={showCompanionSheet} onOpenChange={setShowCompanionSheet}>
        <SheetContent className="bg-card border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Thiết bị đi kèm
            </SheetTitle>
            <SheetDescription>
              Chọn thiết bị cần bảo dưỡng đồng thời với thiết bị chính
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm thiết bị..."
                className="pl-10 bg-secondary/50 border-border"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableCompanionEquipments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Không còn thiết bị khả dụng
                </p>
              ) : (
                availableCompanionEquipments.map(eq => {
                  const mainItem = items.find(i => i.id === selectedItemForCompanion);
                  const isAdded = mainItem?.companionEquipment.includes(eq.id);
                  
                  return (
                    <div 
                      key={eq.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        isAdded 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => {
                        if (isAdded) {
                          handleRemoveCompanion(selectedItemForCompanion!, eq.id);
                        } else {
                          handleAddCompanion(eq.id);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{eq.code} - {eq.name}</p>
                          <p className="text-xs text-muted-foreground">{eq.machineType}</p>
                        </div>
                        {isAdded && (
                          <Badge variant="default" className="bg-primary">Đã chọn</Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Lưu ý:</strong> Thiết bị đi kèm sẽ kế thừa ngày kế hoạch và người phụ trách từ thiết bị chính.
              </p>
              <Button 
                className="w-full" 
                onClick={() => setShowCompanionSheet(false)}
              >
                Xong
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
