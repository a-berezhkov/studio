
"use client";

import { useState, useEffect, DragEvent, useCallback } from "react";
import type { Room, Laptop, Student, Desk } from "@/lib/types";
import { ClassroomLayout } from "@/components/classroom-layout";
import { LaptopItem } from "@/components/laptop-item";
import { StudentItem } from "@/components/student-item";
import { LaptopFormDialog } from "@/components/laptop-form-dialog";
import { StudentFormDialog } from "@/components/student-form-dialog";
import { RoomFormDialog, type RoomSubmitData } from "@/components/room-form-dialog";
import { AssignStudentDialog } from "@/components/assign-student-dialog";
import { ViewCredentialsDialog } from "@/components/view-credentials-dialog";
import { DeskActionModal } from "@/components/desk-action-modal";
import { AdminLoginDialog } from "@/components/admin-login-dialog"; // New import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit3, Trash2, Eye, UserPlus, Users, Laptop as LaptopIconLucide, Home, Edit, LogIn, LogOut } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export type DeskActionData = {
  desk: Desk;
  laptop?: Laptop;
  student?: Student;
};

const DEFAULT_ROOM_ID = "room-default";
const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "password";

export default function HomePage() {
  const { toast } = useToast();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);

  const [isLaptopFormOpen, setIsLaptopFormOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | undefined>(undefined);
  const [laptopToCreateAtDesk, setLaptopToCreateAtDesk] = useState<Desk | null>(null);

  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);

  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [laptopToAssign, setLaptopToAssign] = useState<Laptop | null>(null);

  const [isViewCredentialsOpen, setIsViewCredentialsOpen] = useState(false);
  const [laptopToView, setLaptopToView] = useState<Laptop | null>(null);
  
  const [draggedLaptopId, setDraggedLaptopId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'laptop' | 'student' | 'room', id: string } | null>(null);

  const [currentActionDesk, setCurrentActionDesk] = useState<DeskActionData | null>(null);
  const [isDeskActionModalOpen, setIsDeskActionModalOpen] = useState(false);

  const currentRoom = rooms.find(r => r.id === currentRoomId);

  useEffect(() => {
    if (rooms.length === 0) {
      const defaultRoom: Room = { 
        id: DEFAULT_ROOM_ID, 
        name: "Main Classroom", 
        rows: 5, 
        cols: 6,
        corridorsAfterRows: [],
        corridorsAfterCols: [],
      };
      setRooms([defaultRoom]);
      setCurrentRoomId(defaultRoom.id);
    } else if (!currentRoomId && rooms.length > 0) {
      setCurrentRoomId(rooms[0].id);
    }
  
    const mockLaptops: Laptop[] = [
      { id: "laptop-1", login: "Room5-L01", password: "password1", locationId: 1, studentId: "student-1", notes: "This is a note for laptop 1.", roomId: DEFAULT_ROOM_ID },
      { id: "laptop-2", login: "Room5-L02", password: "password2", locationId: 2, studentId: null, notes: "", roomId: DEFAULT_ROOM_ID },
      { id: "laptop-3", login: "Room5-L03", password: "password3", locationId: null, studentId: null, notes: "Unassigned laptop note.", roomId: DEFAULT_ROOM_ID },
    ];
    const mockStudents: Student[] = [
      { id: "student-1", name: "Alice Wonderland", groupNumber: "CS101", roomId: DEFAULT_ROOM_ID },
      { id: "student-2", name: "Bob The Builder", groupNumber: "ENG202", roomId: DEFAULT_ROOM_ID },
    ];
    setLaptops(mockLaptops);
    setStudents(mockStudents);
  }, []); 

  useEffect(() => {
    if (currentRoom) {
      const newDesks = Array.from({ length: currentRoom.rows * currentRoom.cols }, (_, i) => ({ id: i + 1 }));
      setDesks(newDesks);
      setLaptops(prevLaptops => prevLaptops.map(lap => {
        if (lap.roomId === currentRoom.id && lap.locationId && lap.locationId > newDesks.length) {
          return { ...lap, locationId: null }; 
        }
        return lap;
      }));
    } else {
      setDesks([]);
    }
  }, [currentRoomId, rooms, currentRoom?.rows, currentRoom?.cols]);

  const handleAdminLogin = (login: string, password_param: string) => {
    if (login === ADMIN_LOGIN && password_param === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setIsLoginDialogOpen(false);
      toast({ title: "Login Successful", description: "Welcome, Admin!" });
    } else {
      toast({ title: "Login Failed", description: "Invalid credentials.", variant: "destructive" });
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    toast({ title: "Logged Out", description: "You have been logged out." });
  };

  const handleAddOrUpdateRoom = (data: RoomSubmitData, roomId?: string) => {
    if (!isAdminAuthenticated) return;
    const roomData: Omit<Room, 'id'> = {
      name: data.name,
      rows: data.rows,
      cols: data.cols,
      corridorsAfterRows: data.corridorsAfterRows || [],
      corridorsAfterCols: data.corridorsAfterCols || [],
    };
    if (roomId) {
      setRooms(prevRooms => prevRooms.map(r => r.id === roomId ? { ...r, ...roomData } : r));
    } else {
      const newRoomId = `room-${Date.now()}`;
      const newRoom: Room = { id: newRoomId, ...roomData };
      setRooms(prevRooms => [...prevRooms, newRoom]);
      setCurrentRoomId(newRoomId); 
    }
    setEditingRoom(undefined);
    setIsRoomFormOpen(false);
  };

  const handleDeleteRoom = (roomIdToDelete: string) => {
    if (!isAdminAuthenticated) return;
    if (rooms.length <= 1) {
      toast({ title: "Action Denied", description: "Cannot delete the last room.", variant: "destructive"});
      setItemToDelete(null);
      return;
    }
    setItemToDelete({ type: 'room', id: roomIdToDelete });
  };
  
  const confirmDeleteRoom = (roomIdToDelete: string) => {
     if (!isAdminAuthenticated) return;
     setLaptops(prevLaptops => prevLaptops.filter(lap => lap.roomId !== roomIdToDelete));
     setStudents(prevStudents => prevStudents.filter(stu => stu.roomId !== roomIdToDelete));
     setRooms(prevRooms => {
        const remainingRooms = prevRooms.filter(r => r.id !== roomIdToDelete);
        if (currentRoomId === roomIdToDelete) {
            setCurrentRoomId(remainingRooms[0]?.id || null);
        }
        return remainingRooms;
     });
     setItemToDelete(null);
  }

  const handleAddOrUpdateLaptop = (formData: { login: string; password?: string }, laptopId?: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    if (laptopId) { 
      setLaptops(laps => laps.map(lap => {
        if (lap.id === laptopId) {
          const updatedLaptop = { ...lap, login: formData.login };
          if (typeof formData.password === 'string') { // Check if password was actually provided
            updatedLaptop.password = formData.password;
          }
          return updatedLaptop;
        }
        return lap;
      }));
    } else { 
      const newLaptop: Laptop = {
        id: `laptop-${Date.now()}`,
        login: formData.login,
        password: formData.password || "", 
        locationId: laptopToCreateAtDesk ? laptopToCreateAtDesk.id : null,
        studentId: null,
        notes: "",
        roomId: currentRoomId,
      };
      setLaptops(laps => [...laps, newLaptop]);
      if (laptopToCreateAtDesk) {
        setLaptopToCreateAtDesk(null); 
      }
    }
    setEditingLaptop(undefined);
    setIsLaptopFormOpen(false); 
    setIsDeskActionModalOpen(false); 
  };

  const handleAddOrUpdateStudent = (data: { name: string; groupNumber: string }, studentId?: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    if (studentId) {
      setStudents(stus => stus.map(stu => stu.id === studentId ? { ...stu, ...data, roomId: currentRoomId } : stu));
    } else {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name: data.name,
        groupNumber: data.groupNumber,
        roomId: currentRoomId,
      };
      setStudents(stus => [...stus, newStudent]);
    }
    setEditingStudent(undefined);
    setIsStudentFormOpen(false);
  };
  
  const confirmDeleteItem = () => {
    if (!isAdminAuthenticated || !itemToDelete) return;
    if (itemToDelete.type === 'laptop') {
      setLaptops(laps => laps.filter(lap => lap.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'student') {
      setLaptops(laps => laps.map(lap => lap.studentId === itemToDelete.id ? { ...lap, studentId: null } : lap));
      setStudents(stus => stus.filter(stu => stu.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'room') {
      confirmDeleteRoom(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  const handleDeleteLaptop = (laptopId: string) => {
    if (!isAdminAuthenticated) return;
    setItemToDelete({ type: 'laptop', id: laptopId });
  }
  const handleDeleteStudent = (studentId: string) => {
    if (!isAdminAuthenticated) return;
    setItemToDelete({ type: 'student', id: studentId });
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, laptopId: string) => {
    if (!isAdminAuthenticated) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("application/laptop-id", laptopId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedLaptopId(laptopId);
  };

  const handleDropLaptopOnDesk = (deskId: number, laptopIdToDrop: string) => {
    if (!isAdminAuthenticated) return;
    setLaptops(prevLaptops => {
      const droppedLaptop = prevLaptops.find(l => l.id === laptopIdToDrop);
      if (!droppedLaptop || droppedLaptop.roomId !== currentRoomId) return prevLaptops; 
      
      const existingLaptopAtDesk = prevLaptops.find(l => l.roomId === currentRoomId && l.locationId === deskId);

      return prevLaptops.map(lap => {
        if (lap.roomId !== currentRoomId) return lap;

        if (lap.id === laptopIdToDrop) return { ...lap, locationId: deskId };
        if (existingLaptopAtDesk && lap.id === existingLaptopAtDesk.id && existingLaptopAtDesk.id !== laptopIdToDrop) {
          return { ...lap, locationId: null }; 
        }
        return lap;
      });
    });
    setDraggedLaptopId(null);
  };
  
  const handleDeskClick = (deskId: number) => {
    const desk = desks.find(d => d.id === deskId);
    if (!desk || !currentRoomId) return;

    const laptopOnDesk = laptopsInCurrentRoom.find(l => l.locationId === deskId);
    let studentOnLaptop: Student | undefined = undefined;
    if (laptopOnDesk && laptopOnDesk.studentId) {
      studentOnLaptop = studentsInCurrentRoom.find(s => s.id === laptopOnDesk.studentId);
    }
    setCurrentActionDesk({ desk, laptop: laptopOnDesk, student: studentOnLaptop });
    setIsDeskActionModalOpen(true); // Modal itself can open, actions inside are restricted
  };

  const handleAssignStudent = (laptopId: string, studentId: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.roomId !== currentRoomId) return lap;
      if (lap.id === laptopId) return { ...lap, studentId: studentId };
      if (lap.studentId === studentId && lap.id !== laptopId) return { ...lap, studentId: null };
      return lap;
    }));
    
    if (currentActionDesk?.laptop?.id === laptopId) {
        const updatedStudent = studentsInCurrentRoom.find(s => s.id === studentId);
        setCurrentActionDesk(prev => prev ? {...prev, laptop: {...prev.laptop!, studentId: studentId}, student: updatedStudent} : null);
    }
    setIsAssignStudentOpen(false); 
  };
  
  const handleUnassignStudent = (laptopId: string) => {
    if (!isAdminAuthenticated) return;
    setLaptops(laps => laps.map(lap => (lap.id === laptopId && lap.roomId === currentRoomId) ? { ...lap, studentId: null } : lap));
     if (currentActionDesk?.laptop?.id === laptopId) {
        setCurrentActionDesk(prev => prev ? {...prev, laptop: {...prev.laptop!, studentId: null}, student: undefined} : null);
    }
  };

  const handleUnassignLocation = (laptopId: string) => {
    if (!isAdminAuthenticated) return;
    setLaptops(laps => laps.map(lap => (lap.id === laptopId && lap.roomId === currentRoomId) ? { ...lap, locationId: null } : lap));
  };

  const handleSaveLaptopNotes = (laptopId: string, notes: string) => {
    if (!isAdminAuthenticated) return;
    setLaptops(laps => laps.map(lap => (lap.id === laptopId && lap.roomId === currentRoomId) ? { ...lap, notes } : lap));
    if (currentActionDesk?.laptop?.id === laptopId) {
        setCurrentActionDesk(prev => prev ? {...prev, laptop: {...prev.laptop!, notes: notes}} : null);
    }
  };
  
  const openEditLaptopDialog = useCallback((laptop: Laptop) => {
    if (!isAdminAuthenticated) return;
    setEditingLaptop(laptop);
    setIsLaptopFormOpen(true);
    setIsDeskActionModalOpen(false);
  }, [isAdminAuthenticated]);

  const openViewCredentialsDialog = useCallback((laptop: Laptop) => {
    // Viewing credentials might be allowed for non-admins based on policy.
    // For now, let's keep it open but actions within edit dialog are restricted.
    setLaptopToView(laptop);
    setIsViewCredentialsOpen(true);
    setIsDeskActionModalOpen(false);
  }, []);

  const openAssignStudentDialog = useCallback((laptop: Laptop) => {
    if (!isAdminAuthenticated) return;
    setLaptopToAssign(laptop);
    setIsAssignStudentOpen(true);
  }, [isAdminAuthenticated]);

  const requestAddLaptopToDesk = useCallback((desk: Desk) => {
    if (!isAdminAuthenticated) return;
    setLaptopToCreateAtDesk(desk);
    setEditingLaptop(undefined); 
    setIsLaptopFormOpen(true);
    setIsDeskActionModalOpen(false);
  }, [isAdminAuthenticated]);

  const laptopsInCurrentRoom = laptops.filter(lap => lap.roomId === currentRoomId);
  const studentsInCurrentRoom = students.filter(stu => stu.roomId === currentRoomId);
  
  const unassignedLaptops = laptopsInCurrentRoom.filter(lap => lap.locationId === null);
  const assignedLaptops = laptopsInCurrentRoom.filter(lap => lap.locationId !== null);


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-4 shadow-md flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Classroom Navigator {currentRoom ? `- ${currentRoom.name}` : ""}
        </h1>
        {isAdminAuthenticated ? (
          <Button variant="ghost" onClick={handleAdminLogout} className="text-primary-foreground hover:bg-primary/80">
            <LogOut className="mr-2 h-5 w-5" /> Logout Admin
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setIsLoginDialogOpen(true)} className="text-primary-foreground hover:bg-primary/80">
            <LogIn className="mr-2 h-5 w-5" /> Admin Login
          </Button>
        )}
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <section className="lg:col-span-2">
          {currentRoom ? (
            <ClassroomLayout
              desks={desks}
              laptops={laptopsInCurrentRoom}
              students={studentsInCurrentRoom}
              onDropLaptopOnDesk={handleDropLaptopOnDesk}
              onDeskClick={handleDeskClick}
              rows={currentRoom.rows}
              cols={currentRoom.cols}
              corridorsAfterRows={currentRoom.corridorsAfterRows || []}
              corridorsAfterCols={currentRoom.corridorsAfterCols || []}
              isAdminAuthenticated={isAdminAuthenticated}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <p className="text-xl text-muted-foreground">Please select or create a room to begin.</p>
              </CardContent>
            </Card>
          )}
        </section>

        <aside className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center"><Home className="mr-2 h-6 w-6 text-primary" />Room Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="room-select" className="text-sm font-medium">Select Room</Label>
                <Select value={currentRoomId || ""} onValueChange={setCurrentRoomId}>
                  <SelectTrigger id="room-select">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => { if (isAdminAuthenticated) {setEditingRoom(undefined); setIsRoomFormOpen(true); }}} disabled={!isAdminAuthenticated}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Room
                </Button>
                {currentRoom && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { if (isAdminAuthenticated) {setEditingRoom(currentRoom); setIsRoomFormOpen(true);}}} disabled={!isAdminAuthenticated || !currentRoomId}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Room
                  </Button>
                )}
              </div>
               {currentRoom && rooms.length > 1 && (
                <Button size="sm" variant="destructive" className="w-full" onClick={() => handleDeleteRoom(currentRoom.id)} disabled={!isAdminAuthenticated || !currentRoomId || rooms.length <= 1}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Current Room
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center"><LaptopIconLucide className="mr-2 h-6 w-6 text-primary" />Laptops</CardTitle>
                <Button size="sm" onClick={() => { if(isAdminAuthenticated) {setLaptopToCreateAtDesk(null); setEditingLaptop(undefined); setIsLaptopFormOpen(true);}}} disabled={!isAdminAuthenticated || !currentRoomId}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Laptop
                </Button>
              </div>
              <CardDescription>Manage laptops for the current room. Drag unassigned laptops to the map.</CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-md font-semibold mb-2 text-muted-foreground">Unassigned Laptops</h3>
              <ScrollArea className="h-[150px] mb-4 p-1 border rounded-md bg-muted/20">
                {unassignedLaptops.length > 0 ? unassignedLaptops.map(laptop => (
                  <LaptopItem
                    key={laptop.id}
                    laptop={laptop}
                    isDraggable={isAdminAuthenticated}
                    onDragStart={handleDragStart}
                    onEdit={openEditLaptopDialog}
                    onDelete={() => handleDeleteLaptop(laptop.id)}
                    onViewCredentials={openViewCredentialsDialog}
                    onAssignStudent={() => openAssignStudentDialog(laptop)}
                    isAdminAuthenticated={isAdminAuthenticated}
                  />
                )) : <p className="text-sm text-center py-4 text-muted-foreground">No unassigned laptops in this room.</p>}
              </ScrollArea>
               <Separator className="my-4" />
               <h3 className="text-md font-semibold mb-2 text-muted-foreground">Assigned Laptops</h3>
                <ScrollArea className="h-[150px] p-1 border rounded-md bg-muted/20">
                 {assignedLaptops.length > 0 ? assignedLaptops.map(laptop => {
                    const student = studentsInCurrentRoom.find(s => s.id === laptop.studentId);
                    return (
                      <LaptopItem
                        key={laptop.id}
                        laptop={laptop}
                        assignedStudent={student}
                        isDraggable={isAdminAuthenticated}
                        onDragStart={handleDragStart}
                        onEdit={openEditLaptopDialog}
                        onDelete={() => handleDeleteLaptop(laptop.id)}
                        onViewCredentials={openViewCredentialsDialog}
                        onAssignStudent={() => openAssignStudentDialog(laptop)}
                        onUnassignStudent={student ? () => handleUnassignStudent(laptop.id) : undefined}
                        onUnassignLocation={() => handleUnassignLocation(laptop.id)}
                        isAdminAuthenticated={isAdminAuthenticated}
                      />
                    );
                  }) : <p className="text-sm text-center py-4 text-muted-foreground">No laptops assigned to desks in this room.</p>}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
               <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-6 w-6 text-primary" />Students</CardTitle>
                <Button size="sm" onClick={() => { if(isAdminAuthenticated) {setEditingStudent(undefined); setIsStudentFormOpen(true);}}} disabled={!isAdminAuthenticated || !currentRoomId}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add Student
                </Button>
              </div>
              <CardDescription>Manage student information for the current room.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] p-1 border rounded-md bg-muted/20">
                {studentsInCurrentRoom.length > 0 ? studentsInCurrentRoom.map(student => {
                  const assignedLaptop = laptopsInCurrentRoom.find(l => l.studentId === student.id);
                  return (
                    <StudentItem
                      key={student.id}
                      student={student}
                      assignedLaptop={assignedLaptop}
                      onEdit={() => { if(isAdminAuthenticated) {setEditingStudent(student); setIsStudentFormOpen(true);}}}
                      onDelete={() => handleDeleteStudent(student.id)}
                      isAdminAuthenticated={isAdminAuthenticated}
                    />
                  );
                }) : <p className="text-sm text-center py-4 text-muted-foreground">No students added to this room yet.</p>}
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      </main>

      <AdminLoginDialog
        open={isLoginDialogOpen}
        onOpenChange={setIsLoginDialogOpen}
        onLogin={handleAdminLogin}
      />
      <RoomFormDialog
        open={isRoomFormOpen}
        onOpenChange={setIsRoomFormOpen}
        onSubmit={handleAddOrUpdateRoom}
        initialData={editingRoom}
      />
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
      {laptopToAssign && currentRoomId && <AssignStudentDialog
        open={isAssignStudentOpen}
        onOpenChange={setIsAssignStudentOpen}
        laptop={laptopToAssign}
        students={studentsInCurrentRoom}
        laptops={laptopsInCurrentRoom} 
        onAssign={handleAssignStudent}
        isAdminAuthenticated={isAdminAuthenticated}
      />}
      {laptopToView && <ViewCredentialsDialog
        open={isViewCredentialsOpen}
        onOpenChange={setIsViewCredentialsOpen}
        laptop={laptopToView}
      />}
      {currentActionDesk && currentRoomId && <DeskActionModal
        open={isDeskActionModalOpen}
        onOpenChange={setIsDeskActionModalOpen}
        deskActionData={currentActionDesk}
        onEditLaptop={openEditLaptopDialog}
        onViewCredentials={openViewCredentialsDialog}
        onAssignStudent={openAssignStudentDialog}
        onUnassignStudent={handleUnassignStudent}
        onSaveNotes={handleSaveLaptopNotes}
        onAddLaptopToDesk={requestAddLaptopToDesk}
        isAdminAuthenticated={isAdminAuthenticated}
      />}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type}.
              {itemToDelete?.type === 'student' ? ' This student will be unassigned from any laptop.' : ''}
              {itemToDelete?.type === 'room' ? ' All laptops and students in this room will also be deleted.' : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90" disabled={!isAdminAuthenticated}>
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

    