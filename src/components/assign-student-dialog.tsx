
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Laptop, Student, Group } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssignStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laptop: Laptop | null;
  allStudents: Student[]; 
  groups: Group[];
  onAssign: (laptopId: string, selectedStudentIds: string[]) => void;
  isAdminAuthenticated: boolean;
}

export function AssignStudentDialog({ 
    open, 
    onOpenChange, 
    laptop, 
    allStudents, 
    groups, 
    onAssign, 
    isAdminAuthenticated 
}: AssignStudentDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (open && laptop) {
      setSelectedStudentIds(laptop.studentIds || []);
      // If there are assigned students, try to set the group of the first one
      if (laptop.studentIds && laptop.studentIds.length > 0) {
        const firstAssignedStudent = allStudents.find(s => s.id === laptop.studentIds[0]);
        if (firstAssignedStudent) {
          setSelectedGroupId(firstAssignedStudent.groupId);
        } else if (groups.length > 0) {
          setSelectedGroupId(groups[0].id); // Default to first group if assigned student not found or no students assigned
        }
      } else if (groups.length > 0) {
         setSelectedGroupId(groups[0].id); // Default to first group
      } else {
        setSelectedGroupId(undefined);
      }
      setSearchTerm("");
    } else if (open) {
        setSelectedStudentIds([]);
        setSelectedGroupId(groups[0]?.id || undefined);
        setSearchTerm("");
    }
  }, [open, laptop, allStudents, groups]);

  const studentsInSelectedGroup = useMemo(() => {
    if (!selectedGroupId) return [];
    return allStudents.filter(s => s.groupId === selectedGroupId);
  }, [allStudents, selectedGroupId]);

  const filteredStudentsToDisplay = useMemo(() => {
    return studentsInSelectedGroup
      .filter(s => searchTerm === "" || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [studentsInSelectedGroup, searchTerm]);

  const handleStudentSelectionChange = (studentId: string, checked: boolean) => {
    setSelectedStudentIds(prev => 
      checked ? [...prev, studentId] : prev.filter(id => id !== studentId)
    );
  };

  const handleSaveAssignments = () => {
    if (laptop && isAdminAuthenticated) {
      onAssign(laptop.id, selectedStudentIds);
      onOpenChange(false);
    }
  };

  if (!laptop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card"> {/* Increased width slightly */}
        <DialogHeader>
          <DialogTitle>Назначить учащихся на ноутбук: {laptop.login}</DialogTitle>
          <DialogDescription>
            Выберите группу, затем отметьте учащихся для назначения на этот ноутбук.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group-select" className="text-right">
              Группа
            </Label>
            <Select 
              value={selectedGroupId} 
              onValueChange={(value) => {
                setSelectedGroupId(value);
                // Keep existing selections from other groups if desired, or clear:
                // setSelectedStudentIds(ids => ids.filter(id => allStudents.find(s => s.id === id)?.groupId === value));
                setSearchTerm("");
              }}
              disabled={!isAdminAuthenticated || groups.length === 0}
            >
              <SelectTrigger id="group-select" className="col-span-3">
                <SelectValue placeholder="Выберите группу" />
              </SelectTrigger>
              <SelectContent>
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-groups" disabled>Нет доступных групп</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedGroupId && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student-search" className="text-right">
                  Поиск в группе
                </Label>
                <Input
                  id="student-search"
                  placeholder="Введите для поиска по имени..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="col-span-3"
                  disabled={!isAdminAuthenticated}
                />
              </div>
              <Label className="text-sm font-medium">Учащиеся в группе "{groups.find(g => g.id === selectedGroupId)?.name}"</Label>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {filteredStudentsToDisplay.length > 0 ? (
                  filteredStudentsToDisplay.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudentIds.includes(student.id)}
                        onCheckedChange={(checked) => handleStudentSelectionChange(student.id, !!checked)}
                        disabled={!isAdminAuthenticated}
                      />
                      <Label htmlFor={`student-${student.id}`} className="font-normal cursor-pointer">
                        {student.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchTerm ? "Совпадающих учащихся не найдено" : "В этой группе нет учащихся"}
                  </p>
                )}
              </ScrollArea>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleSaveAssignments} disabled={!isAdminAuthenticated || !laptop}>Сохранить назначения</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
