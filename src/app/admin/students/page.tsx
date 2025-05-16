
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Student, Room, Laptop } from "@/lib/types";
import { StudentItem } from "@/components/student-item";
import { StudentFormDialog } from "@/components/student-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Users, ArrowLeft, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AdminStudentsPage() {
  const { toast } = useToast();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const currentRoom = rooms.find(r => r.id === currentRoomId);

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);

  const [studentsInCurrentRoom, setStudentsInCurrentRoom] = useState<Student[]>([]);
  
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const storedRooms = localStorage.getItem('rooms');
    const storedCurrentRoomId = localStorage.getItem('currentRoomId');
    const storedStudents = localStorage.getItem('students');
    const storedLaptops = localStorage.getItem('laptops');

    if (storedRooms) setRooms(JSON.parse(storedRooms));
    if (storedCurrentRoomId) setCurrentRoomId(storedCurrentRoomId);
    else if (storedRooms && JSON.parse(storedRooms).length > 0) {
        setCurrentRoomId(JSON.parse(storedRooms)[0].id);
    }
    if (storedStudents) setAllStudents(JSON.parse(storedStudents));
    if (storedLaptops) setAllLaptops(JSON.parse(storedLaptops));
  }, []);

  useEffect(() => {
    if (currentRoomId) {
      setStudentsInCurrentRoom(allStudents.filter(s => s.roomId === currentRoomId));
    } else {
      setStudentsInCurrentRoom([]);
    }
  }, [allStudents, currentRoomId]);

  const saveStudentsToLocalStorage = useCallback(() => {
    localStorage.setItem('students', JSON.stringify(allStudents));
  }, [allStudents]);

  const saveLaptopsToLocalStorage = useCallback(() => {
    localStorage.setItem('laptops', JSON.stringify(allLaptops));
  }, [allLaptops]);

  useEffect(() => {
    saveStudentsToLocalStorage();
  }, [allStudents, saveStudentsToLocalStorage]);

  useEffect(() => {
    saveLaptopsToLocalStorage();
  }, [allLaptops, saveLaptopsToLocalStorage]);

  useEffect(() => {
    if (currentRoomId) {
      localStorage.setItem('currentRoomId', currentRoomId);
    }
  }, [currentRoomId]);

  const handleAddOrUpdateStudent = (data: { name: string; groupNumber: string }, studentId?: string) => {
    if (!currentRoomId) {
        toast({ title: "Error", description: "No room selected.", variant: "destructive"});
        return;
    }
    let updatedStudents;
    if (studentId) {
      updatedStudents = allStudents.map(stu => 
        stu.id === studentId ? { ...stu, ...data, roomId: currentRoomId } : stu
      );
    } else {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name: data.name,
        groupNumber: data.groupNumber,
        roomId: currentRoomId,
      };
      updatedStudents = [...allStudents, newStudent];
    }
    setAllStudents(updatedStudents);
    setEditingStudent(undefined);
    setIsStudentFormOpen(false);
    toast({ title: studentId ? "Student Updated" : "Student Added", description: `Student ${data.name} has been ${studentId ? 'updated' : 'added'}.` });
  };

  const handleDeleteStudent = (studentId: string) => {
    setItemToDelete({ id: studentId });
  };

  const confirmDeleteStudent = () => {
    if (!itemToDelete) return;
    
    const studentNameToDelete = allStudents.find(s => s.id === itemToDelete.id)?.name;

    // Unassign student from any laptops globally
    const updatedLaptops = allLaptops.map(lap => 
      lap.studentId === itemToDelete.id ? { ...lap, studentId: null } : lap
    );
    setAllLaptops(updatedLaptops);

    const updatedStudents = allStudents.filter(stu => stu.id !== itemToDelete.id);
    setAllStudents(updatedStudents);
    
    toast({ title: "Student Deleted", description: `Student ${studentNameToDelete || itemToDelete.id} has been removed.` });
    setItemToDelete(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Student Management</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Classroom
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Manage Students {currentRoom ? `in ${currentRoom.name}` : ''}</CardTitle>
            <CardDescription>Add, edit, or remove students for the selected classroom. All actions are saved automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <Label htmlFor="room-select-students">Select Room</Label>
                    <Select
                        value={currentRoomId || ""}
                        onValueChange={(value) => setCurrentRoomId(value)}
                        disabled={rooms.length === 0}
                    >
                        <SelectTrigger id="room-select-students" aria-label="Select Room">
                        <SelectValue placeholder="Select a room to manage students" />
                        </SelectTrigger>
                        <SelectContent>
                        {rooms.map(room => (
                            <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                        ))}
                        {rooms.length === 0 && <SelectItem value="" disabled>No rooms available</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={() => { setEditingStudent(undefined); setIsStudentFormOpen(true); }}
                    className="w-full md:w-auto"
                    disabled={!currentRoomId}
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
                </Button>
            </div>

            {!currentRoomId && rooms.length > 0 && (
                <p className="text-center text-muted-foreground py-8">Please select a room to view and manage students.</p>
            )}
             {!currentRoomId && rooms.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No rooms available. Please add a room on the main classroom page first.</p>
            )}


            {currentRoomId && (
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px] pr-3 mt-4 border rounded-md p-4">
                {studentsInCurrentRoom.length === 0 && <p className="text-sm text-muted-foreground text-center">No students in this room. Click "Add New Student" to begin.</p>}
                {studentsInCurrentRoom.map(student => (
                    <StudentItem
                    key={student.id}
                    student={student}
                    assignedLaptop={allLaptops.find(l => l.roomId === currentRoomId && l.studentId === student.id)}
                    onEdit={() => { setEditingStudent(student); setIsStudentFormOpen(true); }}
                    onDelete={() => handleDeleteStudent(student.id)}
                    isAdminAuthenticated={true} 
                    />
                ))}
                </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Classroom Navigator. Student Management.
          </p>
        </div>
      </footer>

      <StudentFormDialog
        open={isStudentFormOpen}
        onOpenChange={setIsStudentFormOpen}
        onSubmit={handleAddOrUpdateStudent}
        initialData={editingStudent}
      />

      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete student <span className="font-semibold">{allStudents.find(s=>s.id === itemToDelete.id)?.name || 'this student'}</span>.
                They will also be unassigned from any laptop.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteStudent} className="bg-destructive hover:bg-destructive/90">Delete Student</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    