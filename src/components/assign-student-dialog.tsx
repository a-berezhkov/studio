
"use client";

import { useState, useEffect } from "react";
import type { Laptop, Student } from "@/lib/types";
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
import { Label } from "@/components/ui/label";

interface AssignStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laptop: Laptop | null;
  students: Student[]; // Should be students in the current room
  laptops: Laptop[]; // Should be laptops in the current room
  onAssign: (laptopId: string, studentId: string) => void;
}

export function AssignStudentDialog({ open, onOpenChange, laptop, students, laptops, onAssign }: AssignStudentDialogProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  
  // Students available for assignment are those in the current room
  // who are not already assigned to any other laptop in the current room,
  // OR the student currently assigned to THIS laptop (if any).
  const assignedStudentIdsInCurrentRoom = new Set(
    laptops.map(l => l.studentId).filter(Boolean)
  );

  const availableStudents = students.filter(s => 
    !assignedStudentIdsInCurrentRoom.has(s.id) || (laptop && s.id === laptop.studentId)
  );


  useEffect(() => {
    if (open) {
      setSelectedStudentId(laptop?.studentId || undefined);
    }
  }, [open, laptop]);

  const handleAssign = () => {
    if (laptop && selectedStudentId) {
      onAssign(laptop.id, selectedStudentId);
      onOpenChange(false);
    }
  };

  if (!laptop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Assign Student to Laptop: {laptop.login}</DialogTitle>
          <DialogDescription>
            Select a student to assign to this laptop. Only available students from the current room are shown.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student-select" className="text-right">
              Student
            </Label>
            <Select 
              value={selectedStudentId} 
              onValueChange={setSelectedStudentId}
            >
              <SelectTrigger id="student-select" className="col-span-3">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.length > 0 ? (
                  availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.groupNumber})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-students" disabled>No available students in this room</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedStudentId}>Assign Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
