
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

interface AssignStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laptop: Laptop | null;
  students: Student[]; 
  groups: Group[];
  laptops: Laptop[]; 
  onAssign: (laptopId: string, studentId: string) => void;
  isAdminAuthenticated: boolean;
}

export function AssignStudentDialog({ 
    open, 
    onOpenChange, 
    laptop, 
    students, 
    groups, 
    laptops, 
    onAssign, 
    isAdminAuthenticated 
}: AssignStudentDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  
  const assignedStudentIdsGlobally = useMemo(() => new Set(
    laptops.map(l => l.studentId).filter(Boolean)
  ), [laptops]);

  const studentsInSelectedGroup = useMemo(() => {
    if (!selectedGroupId) return [];
    return students.filter(s => s.groupId === selectedGroupId);
  }, [students, selectedGroupId]);

  const availableStudentsToDisplay = useMemo(() => {
    return studentsInSelectedGroup
      .filter(s => 
        (!assignedStudentIdsGlobally.has(s.id) || (laptop && s.id === laptop.studentId)) &&
        (searchTerm === "" || s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [studentsInSelectedGroup, assignedStudentIdsGlobally, laptop, searchTerm]);

  useEffect(() => {
    if (open && laptop?.studentId) {
      const currentStudent = students.find(s => s.id === laptop.studentId);
      if (currentStudent) {
        setSelectedGroupId(currentStudent.groupId);
        setSelectedStudentId(currentStudent.id);
        setSearchTerm(""); 
      }
    } else if (open) {
      setSelectedGroupId(groups[0]?.id || undefined); 
      setSelectedStudentId(undefined);
      setSearchTerm("");
    }
  }, [open, laptop, students, groups]);

  const handleAssign = () => {
    if (laptop && selectedStudentId && isAdminAuthenticated) {
      onAssign(laptop.id, selectedStudentId);
      onOpenChange(false);
    }
  };

  if (!laptop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Назначить учащегося на ноутбук: {laptop.login}</DialogTitle>
          <DialogDescription>
            Выберите группу, затем найдите и выберите учащегося. Будут доступны только учащиеся, еще не назначенные на ноутбук.
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
                setSelectedStudentId(undefined); 
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
                  Поиск учащегося
                </Label>
                <Input
                  id="student-search"
                  placeholder="Введите для поиска по имени..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedStudentId(undefined); 
                  }}
                  className="col-span-3"
                  disabled={!isAdminAuthenticated}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student-select" className="text-right">
                  Учащийся
                </Label>
                <Select 
                  value={selectedStudentId} 
                  onValueChange={setSelectedStudentId}
                  disabled={!isAdminAuthenticated || availableStudentsToDisplay.length === 0}
                >
                  <SelectTrigger id="student-select" className="col-span-3">
                    <SelectValue placeholder="Выберите учащегося" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudentsToDisplay.length > 0 ? (
                      availableStudentsToDisplay.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-students" disabled>
                        {searchTerm ? "Совпадающих учащихся не найдено" : "В этой группе нет доступных учащихся"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleAssign} disabled={!selectedStudentId || !isAdminAuthenticated}>Назначить учащегося</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
