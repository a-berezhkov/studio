
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
import { AdminLoginDialog } from "@/components/admin-login-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit3, Trash2, Eye, UserPlus, Users, Laptop as LaptopIconLucide, Home, Edit, LogIn, LogOut, ShieldAlert } from "lucide-react";
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
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(true); // Start with login dialog open

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
    const storedRooms = localStorage.getItem('rooms');
    const storedLaptops = localStorage.getItem('laptops');
    const storedStudents = localStorage.getItem('students');
    const storedCurrentRoomId = localStorage.getItem('currentRoomId');

    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    } else {
       const defaultRoom: Room = { 
        id: DEFAULT_ROOM_ID, 
        name: "Main Classroom", 
        rows: 5, 
        cols: 6,
        corridorsAfterRows: [],
        corridorsAfterCols: [],
      };
      setRooms([defaultRoom]);
    }

    if (storedLaptops) {
      setLaptops(JSON.parse(storedLaptops));
    } else {
        const mockLaptops: Laptop[] = [
            { id: "laptop-1", login: "Room5-L01", password: "password1", locationId: 1, studentId: "student-1", notes: "This is a note for laptop 1.", roomId: DEFAULT_ROOM_ID },
            { id: "laptop-2", login: "Room5-L02", password: "password2", locationId: 2, studentId: null, notes: "", roomId: DEFAULT_ROOM_ID },
            { id: "laptop-3", login: "Room5-L03", password: "password3", locationId: null, studentId: null, notes: "Unassigned laptop note.", roomId: DEFAULT_ROOM_ID },
        ];
        setLaptops(mockLaptops);
    }
    if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
    } else {
        const mockStudents: Student[] = [
            { id: "student-1", name: "Alice Wonderland", groupNumber: "CS101", roomId: DEFAULT_ROOM_ID },
            { id: "student-2", name: "Bob The Builder", groupNumber: "ENG202", roomId: DEFAULT_ROOM_ID },
        ];
        setStudents(mockStudents);
    }
    
    if (storedCurrentRoomId) {
        setCurrentRoomId(storedCurrentRoomId);
    } else if (rooms.length > 0) {
        setCurrentRoomId(rooms[0].id);
    } else {
        // If no rooms from storage and default room logic just ran, set currentRoomId
        setCurrentRoomId(DEFAULT_ROOM_ID);
    }

  }, []); 

  useEffect(() => {
    if (rooms.length > 0 && !currentRoomId) {
        const storedCurrentRoomId = localStorage.getItem('currentRoomId');
        if (storedCurrentRoomId && rooms.find(r => r.id === storedCurrentRoomId)) {
            setCurrentRoomId(storedCurrentRoomId);
        } else {
            setCurrentRoomId(rooms[0].id);
        }
    }
  }, [rooms, currentRoomId]);


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

  useEffect(() => {
    if (isAdminAuthenticated) {
      localStorage.setItem('rooms', JSON.stringify(rooms));
      localStorage.setItem('laptops', JSON.stringify(laptops));
      localStorage.setItem('students', JSON.stringify(students));
      if (currentRoomId) localStorage.setItem('currentRoomId', currentRoomId);
    }
  }, [rooms, laptops, students, currentRoomId, isAdminAuthenticated]);


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
    setIsLoginDialogOpen(true); // Show login dialog on logout
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
     toast({ title: "Room Deleted", description: "The room and its contents have been removed." });
  }

  const handleAddOrUpdateLaptop = (formData: { login: string; password?: string }, laptopId?: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    if (laptopId) { 
      setLaptops(laps => laps.map(lap => {
        if (lap.id === laptopId) {
          const updatedLaptop = { ...lap, login: formData.login, notes: lap.notes || "" };
          if (typeof formData.password === 'string' && formData.password.length > 0) { 
            updatedLaptop.password = formData.password;
          } else if (formData.password === "" && typeof lap.password === 'string') { 
            updatedLaptop.password = "";
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
      toast({ title: "Laptop Deleted", description: "The laptop has been removed." });
    } else if (itemToDelete.type === 'student') {
      setLaptops(laps => laps.map(lap => lap.studentId === itemToDelete.id ? { ...lap, studentId: null } : lap));
      setStudents(stus => stus.filter(stu => stu.id !== itemToDelete.id));
      toast({ title: "Student Deleted", description: "The student has been removed." });
    } else if (itemToDelete.type === 'room') {
      confirmDeleteRoom(itemToDelete.id); // Toast is handled in confirmDeleteRoom
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
    if (!isAdminAuthenticated || !currentRoomId) return;
    setLaptops(prevLaptops => {
      const droppedLaptop = prevLaptops.find(l => l.id === laptopIdToDrop);
      if (!droppedLaptop || droppedLaptop.roomId !== currentRoomId) {
        toast({ title: "Error", description: "Cannot move laptop from another room.", variant: "destructive"});
        return prevLaptops;
      }
      
      const existingLaptopAtDesk = prevLaptops.find(l => l.roomId === currentRoomId && l.locationId === deskId);

      return prevLaptops.map(lap => {
        if (lap.id === laptopIdToDrop) {
          return { ...lap, locationId: deskId, roomId: currentRoomId };
        }
        if (existingLaptopAtDesk && lap.id === existingLaptopAtDesk.id) {
          return { ...lap, locationId: droppedLaptop.locationId, roomId: currentRoomId }; // Swap locations
        }
        return lap;
      });
    });
    setDraggedLaptopId(null);
  };

  const handleAssignStudentToLaptop = (laptopId: string, studentId: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    
    let newLaptops = [...laptops];

    newLaptops = newLaptops.map(otherLap => {
      if (otherLap.studentId === studentId && otherLap.id !== laptopId && otherLap.roomId === currentRoomId) {
        return { ...otherLap, studentId: null };
      }
      return otherLap;
    });

    newLaptops = newLaptops.map(lap => {
      if (lap.id === laptopId && lap.roomId === currentRoomId) {
        return { ...lap, studentId };
      }
      return lap;
    });

    setLaptops(newLaptops);
    setIsAssignStudentOpen(false);
    setLaptopToAssign(null);
    setIsDeskActionModalOpen(false);
    toast({ title: "Student Assigned", description: "The student has been assigned to the laptop." });
  };

  const handleUnassignStudentFromLaptop = (laptopId: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId && lap.roomId === currentRoomId) {
        return { ...lap, studentId: null };
      }
      return lap;
    }));
    setIsDeskActionModalOpen(false);
    toast({ title: "Student Unassigned", description: "The student has been unassigned." });
  };
  
  const handleUnassignLocation = (laptopId: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId && lap.roomId === currentRoomId) {
        return { ...lap, locationId: null };
      }
      return lap;
    }));
    toast({ title: "Laptop Unassigned", description: "The laptop has been unassigned from its desk." });
  };

  const handleOpenDeskActionModal = (deskId: number) => {
    if (!currentRoom) return;
    const desk = desks.find(d => d.id === deskId);
    if (!desk) return;

    const laptopOnDesk = laptops.find(l => l.roomId === currentRoom.id && l.locationId === deskId);
    const studentAssigned = laptopOnDesk && laptopOnDesk.studentId
      ? students.find(s => s.id === laptopOnDesk.studentId && s.roomId === currentRoom.id)
      : undefined;

    setCurrentActionDesk({ desk, laptop: laptopOnDesk, student: studentAssigned });
    setIsDeskActionModalOpen(true);
  };

  const handleSaveNotes = (laptopId: string, notes: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId && lap.roomId === currentRoomId) {
        return { ...lap, notes };
      }
      return lap;
    }));
    toast({ title: "Notes Saved", description: `Notes for laptop updated.` });
    if (currentActionDesk?.laptop?.id === laptopId) {
        setCurrentActionDesk(prev => prev ? {...prev, laptop: {...prev.laptop!, notes}} : null);
    }
  };


  if (!isAdminAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Classroom Navigator</h1>
            </div>
            <Button onClick={() => setIsLoginDialogOpen(true)}>
              <LogIn className="mr-2 h-4 w-4" /> Admin Login
            </Button>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center">
          <Card className="p-6 md:p-8 max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center">
                <ShieldAlert className="mr-2 h-7 w-7 text-destructive" /> Access Restricted
              </CardTitle>
              <CardDescription>
                Please log in as an administrator to access the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setIsLoginDialogOpen(true)} className="w-full">
                 <LogIn className="mr-2 h-4 w-4" /> Admin Login
                </Button>
            </CardContent>
          </Card>
        </main>
        <footer className="py-6 md:px-8 md:py-0 border-t">
          <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} Classroom Navigator.
            </p>
          </div>
        </footer>
        <AdminLoginDialog
          open={isLoginDialogOpen && !isAdminAuthenticated}
          onOpenChange={setIsLoginDialogOpen}
          onLogin={handleAdminLogin}
        />
      </div>
    );
  }

  // Derived state for authenticated view
  const laptopsInCurrentRoom = laptops.filter(lap => lap.roomId === currentRoomId);
  const studentsInCurrentRoom = students.filter(stu => stu.roomId === currentRoomId);
  const unassignedLaptopsInCurrentRoom = laptopsInCurrentRoom.filter(lap => !lap.locationId);
  const assignedLaptopsInCurrentRoom = laptopsInCurrentRoom.filter(lap => lap.locationId !== null);


  // Main content when admin is authenticated
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="mr-2 h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Classroom Navigator {currentRoom ? `- ${currentRoom.name}` : ''}</h1>
          </div>
          <Button onClick={handleAdminLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Admin Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {!currentRoomId && rooms.length > 0 && (
             <Card className="mb-6">
                <CardContent className="pt-6 text-center">
                    <p className="text-lg font-semibold">Welcome, Admin!</p>
                    <p className="text-muted-foreground">Please select a room to get started, or add a new one.</p>
                </CardContent>
             </Card>
        )}
        {!currentRoomId && rooms.length === 0 && (
             <Card className="mb-6">
                <CardContent className="pt-6 text-center">
                    <p className="text-lg font-semibold">No Rooms Available</p>
                    <p className="text-muted-foreground">Please add a new room to begin managing your classroom.</p>
                     <Button
                        onClick={() => { setEditingRoom(undefined); setIsRoomFormOpen(true); }}
                        className="mt-4"
                        disabled={!isAdminAuthenticated}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add First Room
                      </Button>
                </CardContent>
             </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {currentRoom ? (
              <ClassroomLayout
                desks={desks}
                laptops={assignedLaptopsInCurrentRoom}
                students={studentsInCurrentRoom}
                onDropLaptopOnDesk={handleDropLaptopOnDesk}
                onDeskClick={(deskId) => handleOpenDeskActionModal(deskId)}
                rows={currentRoom.rows}
                cols={currentRoom.cols}
                corridorsAfterRows={currentRoom.corridorsAfterRows || []}
                corridorsAfterCols={currentRoom.corridorsAfterCols || []}
                isAdminAuthenticated={isAdminAuthenticated}
              />
            ) : (
              <Card className="h-[400px] flex items-center justify-center bg-muted/20 border-dashed">
                <CardContent className="text-center">
                   <Home className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">Select or create a room to view the layout.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Home className="mr-2 h-5 w-5" /> Room Management</CardTitle>
                <CardDescription>Select, add, or edit classroom rooms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="room-select">Current Room</Label>
                  <Select
                    value={currentRoomId || ""}
                    onValueChange={(value) => {
                        if (value === "__add_new_room__") {
                            setEditingRoom(undefined); 
                            setIsRoomFormOpen(true);
                        } else {
                            setCurrentRoomId(value);
                        }
                    }}
                    disabled={!isAdminAuthenticated || rooms.length === 0 && !currentRoomId}
                  >
                    <SelectTrigger id="room-select">
                      <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map(room => (
                        <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                      ))}
                       {rooms.length === 0 && <SelectItem value="" disabled>No rooms available</SelectItem>}
                       <SelectItem value="__add_new_room__" className="text-primary hover:!bg-primary/10">
                          <PlusCircle className="inline-block mr-2 h-4 w-4" /> Add new room...
                       </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => { setEditingRoom(undefined); setIsRoomFormOpen(true); }}
                    className="flex-1"
                    disabled={!isAdminAuthenticated}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Room
                  </Button>
                  {currentRoom && (
                    <Button
                      variant="outline"
                      onClick={() => { setEditingRoom(currentRoom); setIsRoomFormOpen(true); }}
                      className="flex-1"
                      disabled={!isAdminAuthenticated}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit Room
                    </Button>
                  )}
                </div>
                 {currentRoom && rooms.length > 1 && (
                    <Button
                        variant="destructive"
                        onClick={() => handleDeleteRoom(currentRoom.id)}
                        className="w-full"
                        disabled={!isAdminAuthenticated}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Room
                    </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><LaptopIconLucide className="mr-2 h-5 w-5" /> Laptops</CardTitle>
                <CardDescription>Manage laptops in <span className="font-semibold">{currentRoom?.name || "the selected room"}</span>.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => { setEditingLaptop(undefined); setLaptopToCreateAtDesk(null); setIsLaptopFormOpen(true); }}
                  className="w-full mb-4"
                  disabled={!isAdminAuthenticated || !currentRoomId}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Laptop
                </Button>
                <ScrollArea className="h-[200px] pr-3">
                  {!currentRoomId && <p className="text-sm text-muted-foreground text-center">Select a room to manage laptops.</p>}
                  {currentRoomId && laptopsInCurrentRoom.length === 0 && <p className="text-sm text-muted-foreground text-center">No laptops in this room.</p>}
                  
                  {unassignedLaptopsInCurrentRoom.map(laptop => (
                    <LaptopItem
                      key={laptop.id}
                      laptop={laptop}
                      assignedStudent={studentsInCurrentRoom.find(s => s.id === laptop.studentId)}
                      isDraggable={true}
                      onDragStart={handleDragStart}
                      onEdit={() => { setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
                      onDelete={() => handleDeleteLaptop(laptop.id)}
                      onViewCredentials={() => { setLaptopToView(laptop); setIsViewCredentialsOpen(true); }}
                      onAssignStudent={() => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true); }}
                      isAdminAuthenticated={isAdminAuthenticated}
                    />
                  ))}
                   {assignedLaptopsInCurrentRoom.length > 0 && unassignedLaptopsInCurrentRoom.length > 0 && <Separator className="my-3"/>}
                   {assignedLaptopsInCurrentRoom.map(laptop => (
                    <LaptopItem
                      key={laptop.id}
                      laptop={laptop}
                      assignedStudent={studentsInCurrentRoom.find(s => s.id === laptop.studentId)}
                      isDraggable={true}
                      onDragStart={handleDragStart}
                      onEdit={() => { setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
                      onDelete={() => handleDeleteLaptop(laptop.id)}
                      onViewCredentials={() => { setLaptopToView(laptop); setIsViewCredentialsOpen(true); }}
                      onAssignStudent={() => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true); }}
                      onUnassignStudent={laptop.studentId ? () => handleUnassignStudentFromLaptop(laptop.id) : undefined}
                      onUnassignLocation={() => handleUnassignLocation(laptop.id)}
                      isAdminAuthenticated={isAdminAuthenticated}
                    />
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5" /> Students</CardTitle>
                 <CardDescription>Manage students in <span className="font-semibold">{currentRoom?.name || "the selected room"}</span>.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => { setEditingStudent(undefined); setIsStudentFormOpen(true); }}
                  className="w-full mb-4"
                  disabled={!isAdminAuthenticated || !currentRoomId}
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Add New Student
                </Button>
                <ScrollArea className="h-[200px] pr-3">
                  {!currentRoomId && <p className="text-sm text-muted-foreground text-center">Select a room to manage students.</p>}
                  {currentRoomId && studentsInCurrentRoom.length === 0 && <p className="text-sm text-muted-foreground text-center">No students in this room.</p>}
                  {studentsInCurrentRoom.map(student => (
                    <StudentItem
                      key={student.id}
                      student={student}
                      assignedLaptop={laptopsInCurrentRoom.find(l => l.studentId === student.id)}
                      onEdit={() => { setEditingStudent(student); setIsStudentFormOpen(true); }}
                      onDelete={() => handleDeleteStudent(student.id)}
                      isAdminAuthenticated={isAdminAuthenticated}
                    />
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Classroom Navigator. All rights reserved.
          </p>
        </div>
      </footer>

      <AdminLoginDialog
        open={isLoginDialogOpen && !isAdminAuthenticated}
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
      <AssignStudentDialog
        open={isAssignStudentOpen}
        onOpenChange={setIsAssignStudentOpen}
        laptop={laptopToAssign}
        students={studentsInCurrentRoom.filter(s => 
            !laptopsInCurrentRoom.some(l => l.studentId === s.id && l.id !== laptopToAssign?.id)
        )}
        laptops={laptopsInCurrentRoom} // Pass all laptops in current room for context
        onAssign={handleAssignStudentToLaptop}
        isAdminAuthenticated={isAdminAuthenticated}
      />
      <ViewCredentialsDialog
        open={isViewCredentialsOpen}
        onOpenChange={setIsViewCredentialsOpen}
        laptop={laptopToView}
      />
      <DeskActionModal
        open={isDeskActionModalOpen}
        onOpenChange={setIsDeskActionModalOpen}
        deskActionData={currentActionDesk}
        onEditLaptop={(laptop) => { setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
        onViewCredentials={(laptop) => { setLaptopToView(laptop); setIsViewCredentialsOpen(true); }}
        onAssignStudent={(laptop) => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true); }}
        onUnassignStudent={handleUnassignStudentFromLaptop}
        onSaveNotes={handleSaveNotes}
        onAddLaptopToDesk={(desk) => { 
            setLaptopToCreateAtDesk(desk); 
            setEditingLaptop(undefined); 
            setIsLaptopFormOpen(true); 
        }}
        isAdminAuthenticated={isAdminAuthenticated}
      />
      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {itemToDelete.type}
                {itemToDelete.type === 'room' && ' and all associated laptops and students'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteItem}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
