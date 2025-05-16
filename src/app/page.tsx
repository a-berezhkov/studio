
"use client";

import { useState, useEffect, DragEvent } from "react";
import type { Laptop, Student, Desk } from "@/lib/types";
import { ClassroomLayout } from "@/components/classroom-layout";
import { LaptopItem } from "@/components/laptop-item";
import { StudentItem } from "@/components/student-item";
import { LaptopFormDialog } from "@/components/laptop-form-dialog";
import { StudentFormDialog } from "@/components/student-form-dialog";
import { AssignStudentDialog } from "@/components/assign-student-dialog";
import { ViewCredentialsDialog } from "@/components/view-credentials-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit3, Trash2, Eye, UserPlus, Users, Laptop as LaptopIconLucide, Maximize } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


const CLASSROOM_ROWS = 5;
const CLASSROOM_COLS = 6;
const TOTAL_DESKS = CLASSROOM_ROWS * CLASSROOM_COLS;

export default function HomePage() {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);

  const [isLaptopFormOpen, setIsLaptopFormOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | undefined>(undefined);

  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [laptopToAssign, setLaptopToAssign] = useState<Laptop | null>(null);

  const [isViewCredentialsOpen, setIsViewCredentialsOpen] = useState(false);
  const [laptopToView, setLaptopToView] = useState<Laptop | null>(null);
  
  const [draggedLaptopId, setDraggedLaptopId] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<{ type: 'laptop' | 'student', id: string } | null>(null);


  useEffect(() => {
    // Initialize desks
    const initialDesks = Array.from({ length: TOTAL_DESKS }, (_, i) => ({ id: i + 1 }));
    setDesks(initialDesks);

    // Load mock data or data from localStorage
    const mockLaptops: Laptop[] = [
      { id: "laptop-1", login: "Room5-L01", password: "password1", locationId: 1, studentId: "student-1" },
      { id: "laptop-2", login: "Room5-L02", password: "password2", locationId: 2, studentId: null },
      { id: "laptop-3", login: "Room5-L03", password: "password3", locationId: null, studentId: null },
    ];
    const mockStudents: Student[] = [
      { id: "student-1", name: "Alice Wonderland", groupNumber: "CS101" },
      { id: "student-2", name: "Bob The Builder", groupNumber: "ENG202" },
    ];
    setLaptops(mockLaptops);
    setStudents(mockStudents);
  }, []);

  const handleAddOrUpdateLaptop = (data: { login: string; password?: string }, laptopId?: string) => {
    if (laptopId) {
      setLaptops(laps => laps.map(lap => lap.id === laptopId ? { ...lap, ...data } : lap));
    } else {
      const newLaptop: Laptop = {
        id: `laptop-${Date.now()}`,
        login: data.login,
        password: data.password,
        locationId: null,
        studentId: null,
      };
      setLaptops(laps => [...laps, newLaptop]);
    }
    setEditingLaptop(undefined);
  };

  const handleAddOrUpdateStudent = (data: { name: string; groupNumber: string }, studentId?: string) => {
    if (studentId) {
      setStudents(stus => stus.map(stu => stu.id === studentId ? { ...stu, ...data } : stu));
    } else {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name: data.name,
        groupNumber: data.groupNumber,
      };
      setStudents(stus => [...stus, newStudent]);
    }
    setEditingStudent(undefined);
  };
  
  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'laptop') {
      setLaptops(laps => laps.filter(lap => lap.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'student') {
      // Unassign student from any laptop first
      setLaptops(laps => laps.map(lap => lap.studentId === itemToDelete.id ? { ...lap, studentId: null } : lap));
      setStudents(stus => stus.filter(stu => stu.id !== itemToDelete.id));
    }
    setItemToDelete(null);
  };

  const handleDeleteLaptop = (laptopId: string) => setItemToDelete({ type: 'laptop', id: laptopId });
  const handleDeleteStudent = (studentId: string) => setItemToDelete({ type: 'student', id: studentId });

  const handleDragStart = (event: DragEvent<HTMLDivElement>, laptopId: string) => {
    event.dataTransfer.setData("application/laptop-id", laptopId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedLaptopId(laptopId);
  };

  const handleDropLaptopOnDesk = (deskId: number, laptopIdToDrop: string) => {
    setLaptops(prevLaptops => {
      // The laptop being dropped
      const droppedLaptop = prevLaptops.find(l => l.id === laptopIdToDrop);
      if (!droppedLaptop) return prevLaptops;

      // Laptop currently at the target desk (if any)
      const existingLaptopAtDesk = prevLaptops.find(l => l.locationId === deskId);

      return prevLaptops.map(lap => {
        // Update the dropped laptop
        if (lap.id === laptopIdToDrop) {
          return { ...lap, locationId: deskId };
        }
        // If there was another laptop at the target desk, unassign its location
        if (existingLaptopAtDesk && lap.id === existingLaptopAtDesk.id && existingLaptopAtDesk.id !== laptopIdToDrop) {
          return { ...lap, locationId: null }; // Or swap: droppedLaptop.locationId
        }
        return lap;
      });
    });
    setDraggedLaptopId(null);
  };
  
  const handleDeskClick = (deskId: number, laptopOnDesk: Laptop | undefined) => {
    if (laptopOnDesk) {
      setLaptopToAssign(laptopOnDesk);
      // Potentially open a quick action menu here later or laptop details
      // For now, clicking a desk with a laptop could open assign student dialog if needed.
      // Or edit laptop details.
      setEditingLaptop(laptopOnDesk);
      // setIsLaptopFormOpen(true); // This would open edit form for laptop on desk
    } else {
      // Desk is empty, perhaps allow quick "add laptop here" in future
    }
  };

  const handleAssignStudent = (laptopId: string, studentId: string) => {
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId) return { ...lap, studentId: studentId };
      // Ensure student is unassigned from any other laptop
      if (lap.studentId === studentId && lap.id !== laptopId) return { ...lap, studentId: null };
      return lap;
    }));
  };
  
  const handleUnassignStudent = (laptopId: string) => {
    setLaptops(laps => laps.map(lap => lap.id === laptopId ? { ...lap, studentId: null } : lap));
  };

  const handleUnassignLocation = (laptopId: string) => {
    setLaptops(laps => laps.map(lap => lap.id === laptopId ? { ...lap, locationId: null } : lap));
  };

  const unassignedLaptops = laptops.filter(lap => lap.locationId === null);
  const assignedLaptops = laptops.filter(lap => lap.locationId !== null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-3xl font-bold text-center">Classroom Navigator</h1>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <section className="lg:col-span-2">
          <ClassroomLayout
            desks={desks}
            laptops={laptops}
            students={students}
            onDropLaptopOnDesk={handleDropLaptopOnDesk}
            onDeskClick={handleDeskClick}
            rows={CLASSROOM_ROWS}
            cols={CLASSROOM_COLS}
          />
        </section>

        <aside className="lg:col-span-1 space-y-6">
          {/* Laptops Management */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center"><LaptopIconLucide className="mr-2 h-6 w-6 text-primary" />Laptops</CardTitle>
                <Button size="sm" onClick={() => { setEditingLaptop(undefined); setIsLaptopFormOpen(true); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Laptop
                </Button>
              </div>
              <CardDescription>Manage classroom laptops. Drag unassigned laptops to the map.</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-md font-semibold mb-2 text-muted-foreground">Unassigned Laptops</h3>
              <ScrollArea className="h-[200px] mb-4 p-1 border rounded-md bg-muted/20">
                {unassignedLaptops.length > 0 ? unassignedLaptops.map(laptop => (
                  <LaptopItem
                    key={laptop.id}
                    laptop={laptop}
                    isDraggable={true}
                    onDragStart={handleDragStart}
                    onEdit={() => { setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
                    onDelete={() => handleDeleteLaptop(laptop.id)}
                    onViewCredentials={() => { setLaptopToView(laptop); setIsViewCredentialsOpen(true); }}
                    onAssignStudent={() => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true);}}
                  />
                )) : <p className="text-sm text-center py-4 text-muted-foreground">No unassigned laptops.</p>}
              </ScrollArea>
               <Separator className="my-4" />
               <h3 className="text-md font-semibold mb-2 text-muted-foreground">Assigned Laptops</h3>
                <ScrollArea className="h-[200px] p-1 border rounded-md bg-muted/20">
                 {assignedLaptops.length > 0 ? assignedLaptops.map(laptop => {
                    const student = students.find(s => s.id === laptop.studentId);
                    return (
                      <LaptopItem
                        key={laptop.id}
                        laptop={laptop}
                        assignedStudent={student}
                        isDraggable={true}
                        onDragStart={handleDragStart}
                        onEdit={() => { setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
                        onDelete={() => handleDeleteLaptop(laptop.id)}
                        onViewCredentials={() => { setLaptopToView(laptop); setIsViewCredentialsOpen(true); }}
                        onAssignStudent={() => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true);}}
                        onUnassignStudent={student ? () => handleUnassignStudent(laptop.id) : undefined}
                        onUnassignLocation={() => handleUnassignLocation(laptop.id)}
                      />
                    );
                  }) : <p className="text-sm text-center py-4 text-muted-foreground">No laptops assigned to desks.</p>}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Students Management */}
          <Card className="shadow-lg">
            <CardHeader>
               <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-6 w-6 text-primary" />Students</CardTitle>
                <Button size="sm" onClick={() => { setEditingStudent(undefined); setIsStudentFormOpen(true); }}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add Student
                </Button>
              </div>
              <CardDescription>Manage student information.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px] p-1 border rounded-md bg-muted/20">
                {students.length > 0 ? students.map(student => {
                  const assignedLaptop = laptops.find(l => l.studentId === student.id);
                  return (
                    <StudentItem
                      key={student.id}
                      student={student}
                      assignedLaptop={assignedLaptop}
                      onEdit={() => { setEditingStudent(student); setIsStudentFormOpen(true); }}
                      onDelete={() => handleDeleteStudent(student.id)}
                    />
                  );
                }) : <p className="text-sm text-center py-4 text-muted-foreground">No students added yet.</p>}
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Dialogs */}
      <LaptopFormDialog
        open={isLaptopFormOpen}
        onOpenChange={setIsLaptopFormOpen}
        onSubmit={handleAddOrUpdateLaptop}
        initialData={editingLaptop}
      />
      <StudentFormDialog
        open={isStudentFormOpen}
        onOpenChange={setIsStudentFormOpen}
        onSubmit={handleAddOrUpdateStudent}
        initialData={editingStudent}
      />
      <AssignStudentDialog
        open={isAssignStudentOpen}
        onOpenChange={setIsAssignStudentOpen}
        laptop={laptopToAssign}
        students={students}
        laptops={laptops}
        onAssign={handleAssignStudent}
      />
      <ViewCredentialsDialog
        open={isViewCredentialsOpen}
        onOpenChange={setIsViewCredentialsOpen}
        laptop={laptopToView}
      />
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type}
              {itemToDelete?.type === 'student' ? ' and unassign them from any laptop.' : '.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        Classroom Navigator &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
