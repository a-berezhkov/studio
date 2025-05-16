
"use client";

import { useState, useEffect, DragEvent, useCallback } from "react";
import type { Laptop, Student, Desk } from "@/lib/types";
import { ClassroomLayout } from "@/components/classroom-layout";
import { LaptopItem } from "@/components/laptop-item";
import { StudentItem } from "@/components/student-item";
import { LaptopFormDialog } from "@/components/laptop-form-dialog";
import { StudentFormDialog } from "@/components/student-form-dialog";
import { AssignStudentDialog } from "@/components/assign-student-dialog";
import { ViewCredentialsDialog } from "@/components/view-credentials-dialog";
import { DeskActionModal } from "@/components/desk-action-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit3, Trash2, Eye, UserPlus, Users, Laptop as LaptopIconLucide, Maximize } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


const CLASSROOM_ROWS = 5;
const CLASSROOM_COLS = 6;
const TOTAL_DESKS = CLASSROOM_ROWS * CLASSROOM_COLS;

export type DeskActionData = {
  desk: Desk;
  laptop?: Laptop;
  student?: Student;
};

export default function HomePage() {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);

  const [isLaptopFormOpen, setIsLaptopFormOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | undefined>(undefined);
  const [laptopToCreateAtDesk, setLaptopToCreateAtDesk] = useState<Desk | null>(null);


  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [laptopToAssign, setLaptopToAssign] = useState<Laptop | null>(null);

  const [isViewCredentialsOpen, setIsViewCredentialsOpen] = useState(false);
  const [laptopToView, setLaptopToView] = useState<Laptop | null>(null);
  
  const [draggedLaptopId, setDraggedLaptopId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'laptop' | 'student', id: string } | null>(null);

  const [currentActionDesk, setCurrentActionDesk] = useState<DeskActionData | null>(null);
  const [isDeskActionModalOpen, setIsDeskActionModalOpen] = useState(false);


  useEffect(() => {
    const initialDesks = Array.from({ length: TOTAL_DESKS }, (_, i) => ({ id: i + 1 }));
    setDesks(initialDesks);

    const mockLaptops: Laptop[] = [
      { id: "laptop-1", login: "Room5-L01", password: "password1", locationId: 1, studentId: "student-1", notes: "This is a note for laptop 1." },
      { id: "laptop-2", login: "Room5-L02", password: "password2", locationId: 2, studentId: null, notes: "" },
      { id: "laptop-3", login: "Room5-L03", password: "password3", locationId: null, studentId: null, notes: "Unassigned laptop note." },
    ];
    const mockStudents: Student[] = [
      { id: "student-1", name: "Alice Wonderland", groupNumber: "CS101" },
      { id: "student-2", name: "Bob The Builder", groupNumber: "ENG202" },
    ];
    setLaptops(mockLaptops);
    setStudents(mockStudents);
  }, []);

  const handleAddOrUpdateLaptop = (formData: { login: string; password?: string }, laptopId?: string) => {
    if (laptopId) { // Editing existing laptop
      setLaptops(laps => laps.map(lap => {
        if (lap.id === laptopId) {
          const updatedLaptop = { ...lap, login: formData.login };
          // If password string is provided (even empty), update it. If undefined, don't change.
          if (typeof formData.password === 'string') {
            updatedLaptop.password = formData.password;
          }
          return updatedLaptop;
        }
        return lap;
      }));
    } else { // Adding new laptop
      const newLaptop: Laptop = {
        id: `laptop-${Date.now()}`,
        login: formData.login,
        password: formData.password || "", 
        locationId: laptopToCreateAtDesk ? laptopToCreateAtDesk.id : null,
        studentId: null,
        notes: "", // Initialize notes for new laptops
      };
      setLaptops(laps => [...laps, newLaptop]);
      if (laptopToCreateAtDesk) {
        setLaptopToCreateAtDesk(null); // Reset temp state
      }
    }
    setEditingLaptop(undefined);
    setIsLaptopFormOpen(false); // Ensure form dialog closes
    setIsDeskActionModalOpen(false); // Close desk action modal if it was open
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
    setIsStudentFormOpen(false);
    // Potentially refresh desk action modal if student was assigned from there
  };
  
  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'laptop') {
      setLaptops(laps => laps.filter(lap => lap.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'student') {
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
      const droppedLaptop = prevLaptops.find(l => l.id === laptopIdToDrop);
      if (!droppedLaptop) return prevLaptops;
      const existingLaptopAtDesk = prevLaptops.find(l => l.locationId === deskId);

      return prevLaptops.map(lap => {
        if (lap.id === laptopIdToDrop) return { ...lap, locationId: deskId };
        if (existingLaptopAtDesk && lap.id === existingLaptopAtDesk.id && existingLaptopAtDesk.id !== laptopIdToDrop) {
          return { ...lap, locationId: null };
        }
        return lap;
      });
    });
    setDraggedLaptopId(null);
  };
  
  const handleDeskClick = (deskId: number, laptopOnDesk: Laptop | undefined) => {
    const desk = desks.find(d => d.id === deskId);
    if (!desk) return;

    let studentOnLaptop: Student | undefined = undefined;
    if (laptopOnDesk && laptopOnDesk.studentId) {
      studentOnLaptop = students.find(s => s.id === laptopOnDesk.studentId);
    }
    setCurrentActionDesk({ desk, laptop: laptopOnDesk, student: studentOnLaptop });
    setIsDeskActionModalOpen(true);
  };

  const handleAssignStudent = (laptopId: string, studentId: string) => {
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId) return { ...lap, studentId: studentId };
      if (lap.studentId === studentId && lap.id !== laptopId) return { ...lap, studentId: null };
      return lap;
    }));
    // Refresh currentActionDesk if it's open and matches this laptop
    if (currentActionDesk?.laptop?.id === laptopId) {
        const updatedStudent = students.find(s => s.id === studentId);
        setCurrentActionDesk(prev => prev ? {...prev, laptop: {...prev.laptop!, studentId: studentId}, student: updatedStudent} : null);
    }
    setIsAssignStudentOpen(false); // Close assign dialog
  };
  
  const handleUnassignStudent = (laptopId: string) => {
    setLaptops(laps => laps.map(lap => lap.id === laptopId ? { ...lap, studentId: null } : lap));
     // Refresh currentActionDesk
     if (currentActionDesk?.laptop?.id === laptopId) {
        setCurrentActionDesk(prev => prev ? {...prev, laptop: {...prev.laptop!, studentId: null}, student: undefined} : null);
    }
  };

  const handleUnassignLocation = (laptopId: string) => {
    setLaptops(laps => laps.map(lap => lap.id === laptopId ? { ...lap, locationId: null } : lap));
  };

  const handleSaveLaptopNotes = (laptopId: string, notes: string) => {
    setLaptops(laps => laps.map(lap => lap.id === laptopId ? { ...lap, notes } : lap));
    if (currentActionDesk?.laptop?.id === laptopId) {
        setCurrentActionDesk(prev => prev ? {...prev, laptop: {...prev.laptop!, notes: notes}} : null);
    }
    // Optionally close DeskActionModal or show a toast
  };
  
  // Callbacks for DeskActionModal
  const openEditLaptopDialog = useCallback((laptop: Laptop) => {
    setEditingLaptop(laptop);
    setIsLaptopFormOpen(true);
    setIsDeskActionModalOpen(false);
  }, []);

  const openViewCredentialsDialog = useCallback((laptop: Laptop) => {
    setLaptopToView(laptop);
    setIsViewCredentialsOpen(true);
    setIsDeskActionModalOpen(false);
  }, []);

  const openAssignStudentDialog = useCallback((laptop: Laptop) => {
    setLaptopToAssign(laptop);
    setIsAssignStudentOpen(true);
    // Keep DeskActionModal open or close? For now, let it manage its own closure or stay open.
    // setIsDeskActionModalOpen(false); 
  }, []);

  const requestAddLaptopToDesk = useCallback((desk: Desk) => {
    setLaptopToCreateAtDesk(desk);
    setEditingLaptop(undefined); // Ensure we are in "add" mode
    setIsLaptopFormOpen(true);
    setIsDeskActionModalOpen(false);
  }, []);


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
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center"><LaptopIconLucide className="mr-2 h-6 w-6 text-primary" />Laptops</CardTitle>
                <Button size="sm" onClick={() => { setLaptopToCreateAtDesk(null); setEditingLaptop(undefined); setIsLaptopFormOpen(true); }}>
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
                    onEdit={() => { setLaptopToCreateAtDesk(null); setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
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
                        onEdit={() => { setLaptopToCreateAtDesk(null); setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
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
      {laptopToAssign && <AssignStudentDialog
        open={isAssignStudentOpen}
        onOpenChange={setIsAssignStudentOpen}
        laptop={laptopToAssign}
        students={students}
        laptops={laptops}
        onAssign={handleAssignStudent}
      />}
      {laptopToView && <ViewCredentialsDialog
        open={isViewCredentialsOpen}
        onOpenChange={setIsViewCredentialsOpen}
        laptop={laptopToView}
      />}
      {currentActionDesk && <DeskActionModal
        open={isDeskActionModalOpen}
        onOpenChange={setIsDeskActionModalOpen}
        deskActionData={currentActionDesk}
        onEditLaptop={openEditLaptopDialog}
        onViewCredentials={openViewCredentialsDialog}
        onAssignStudent={openAssignStudentDialog}
        onUnassignStudent={handleUnassignStudent}
        onSaveNotes={handleSaveLaptopNotes}
        onAddLaptopToDesk={requestAddLaptopToDesk}
      />}
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
