
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
        setSearchTerm(""); // Reset search term if student is pre-selected
      }
    } else if (open) {
      setSelectedGroupId(groups[0]?.id || undefined); // Default to first group or undefined
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
          <DialogTitle>Assign Student to Laptop: {laptop.login}</DialogTitle>
          <DialogDescription>
            Select a group, then search and select a student. Only students not already assigned to a laptop will be available.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="group-select" className="text-right">
              Group
            </Label>
            <Select 
              value={selectedGroupId} 
              onValueChange={(value) => {
                setSelectedGroupId(value);
                setSelectedStudentId(undefined); // Reset student if group changes
                setSearchTerm("");
              }}
              disabled={!isAdminAuthenticated || groups.length === 0}
            >
              <SelectTrigger id="group-select" className="col-span-3">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.length > 0 ? (
                  groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-groups" disabled>No groups available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedGroupId && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student-search" className="text-right">
                  Search Student
                </Label>
                <Input
                  id="student-search"
                  placeholder="Type to search by name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedStudentId(undefined); // Reset if search term changes
                  }}
                  className="col-span-3"
                  disabled={!isAdminAuthenticated}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student-select" className="text-right">
                  Student
                </Label>
                <Select 
                  value={selectedStudentId} 
                  onValueChange={setSelectedStudentId}
                  disabled={!isAdminAuthenticated || availableStudentsToDisplay.length === 0}
                >
                  <SelectTrigger id="student-select" className="col-span-3">
                    <SelectValue placeholder="Select a student" />
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
                        {searchTerm ? "No matching students" : "No available students in this group"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedStudentId || !isAdminAuthenticated}>Assign Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
