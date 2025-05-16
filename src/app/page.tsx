
"use client";

import { useState, useEffect, DragEvent, useCallback } from "react";
import type { Room, Laptop, Student, Desk, Group } from "@/lib/types";
import { ClassroomLayout } from "@/components/classroom-layout";
import { LaptopItem } from "@/components/laptop-item";
import { LaptopFormDialog } from "@/components/laptop-form-dialog";
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
import { PlusCircle, Edit3, Trash2, Eye, UserPlus, Users, Laptop as LaptopIconLucide, Home, Edit, LogIn, LogOut, ShieldAlert, Package, Users2Icon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export type DeskActionData = {
  desk: Desk;
  laptop?: Laptop;
  students?: Student[]; // Changed to array
};

const DEFAULT_ROOM_ID = "room-default";
const DEFAULT_GROUP_ID = "group-default";
const ADMIN_LOGIN = "admin";
const ADMIN_PASSWORD = "password";

export default function HomePage() {
  const { toast } = useToast();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(true); 

  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [students, setStudents] = useState<Student[]>([]); 
  const [groups, setGroups] = useState<Group[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);

  const [isLaptopFormOpen, setIsLaptopFormOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | undefined>(undefined);
  const [laptopToCreateAtDesk, setLaptopToCreateAtDesk] = useState<Desk | null>(null);

  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);

  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [laptopToAssign, setLaptopToAssign] = useState<Laptop | null>(null);

  const [isViewCredentialsOpen, setIsViewCredentialsOpen] = useState(false);
  const [laptopToView, setLaptopToView] = useState<Laptop | null>(null);
  
  const [draggedLaptopId, setDraggedLaptopId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'laptop' | 'room', id: string } | null>(null);

  const [currentActionDesk, setCurrentActionDesk] = useState<DeskActionData | null>(null);
  const [isDeskActionModalOpen, setIsDeskActionModalOpen] = useState(false);

  const currentRoom = rooms.find(r => r.id === currentRoomId);

  // Data migration for localStorage
  const migrateLocalStorageData = () => {
    const storedLaptopsRaw = localStorage.getItem('laptops');
    if (storedLaptopsRaw) {
      let parsedLaptops = JSON.parse(storedLaptopsRaw);
      let migrationNeeded = false;
      parsedLaptops = parsedLaptops.map((lap: any) => {
        if (lap.studentId !== undefined && !lap.studentIds) {
          migrationNeeded = true;
          return { ...lap, studentIds: lap.studentId ? [lap.studentId] : [], studentId: undefined };
        }
        if (lap.studentIds === undefined) { // Ensure studentIds always exists
            migrationNeeded = true;
            return { ...lap, studentIds: [] };
        }
        return lap;
      });
      if (migrationNeeded) {
        localStorage.setItem('laptops', JSON.stringify(parsedLaptops));
      }
      return parsedLaptops;
    }
    return [];
  };


  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAdminAuthenticated(true);
      setIsLoginDialogOpen(false);
    }

    const storedRooms = localStorage.getItem('rooms');
    const migratedLaptops = migrateLocalStorageData();
    const storedStudents = localStorage.getItem('students');
    const storedGroups = localStorage.getItem('groups');
    const storedCurrentRoomId = localStorage.getItem('currentRoomId');
    let defaultRoomCreated = false;

    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    } else {
       const defaultRoom: Room = { 
        id: DEFAULT_ROOM_ID, 
        name: "Главный класс", 
        rows: 5, 
        cols: 6,
        corridorsAfterRows: [],
        corridorsAfterCols: [],
        activeGroupIds: [DEFAULT_GROUP_ID],
      };
      setRooms([defaultRoom]);
      defaultRoomCreated = true;
    }

    if (storedGroups) {
        setGroups(JSON.parse(storedGroups));
    } else {
        const defaultGroup: Group = { id: DEFAULT_GROUP_ID, name: "Нераспределенные" };
        setGroups([defaultGroup]);
    }
    
    if (migratedLaptops.length > 0) {
        setLaptops(migratedLaptops);
    } else {
         const mockLaptops: Laptop[] = [
            { id: "laptop-1", login: "Kab5-N01", password: "password1", locationId: 1, studentIds: ["student-1"], notes: "Это заметка для ноутбука 1.", roomId: DEFAULT_ROOM_ID },
            { id: "laptop-2", login: "Kab5-N02", password: "password2", locationId: 2, studentIds: [], notes: "", roomId: DEFAULT_ROOM_ID },
            { id: "laptop-3", login: "Kab5-N03", password: "password3", locationId: null, studentIds: [], notes: "Заметка для неназначенного ноутбука.", roomId: DEFAULT_ROOM_ID },
        ];
        setLaptops(mockLaptops);
    }

    if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
    } else {
        const mockStudents: Student[] = [
            { id: "student-1", name: "Алиса Селезнева", groupId: DEFAULT_GROUP_ID },
            { id: "student-2", name: "Иван Царевич", groupId: DEFAULT_GROUP_ID },
            { id: "student-3", name: "Колобок Хлебобулочный", groupId: DEFAULT_GROUP_ID },
        ];
        setStudents(mockStudents);
    }
    
    const finalRooms = defaultRoomCreated ? [{ id: DEFAULT_ROOM_ID, name: "Главный класс", rows: 5, cols: 6, corridorsAfterRows: [], corridorsAfterCols: [], activeGroupIds: [DEFAULT_GROUP_ID] }] : JSON.parse(storedRooms || "[]");

    if (storedCurrentRoomId && finalRooms.find((r: Room) => r.id === storedCurrentRoomId)) {
        setCurrentRoomId(storedCurrentRoomId);
    } else if (finalRooms.length > 0) {
        setCurrentRoomId(finalRooms[0].id);
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
      localStorage.setItem('groups', JSON.stringify(groups));
      if (currentRoomId) localStorage.setItem('currentRoomId', currentRoomId);
    }
  }, [rooms, laptops, students, groups, currentRoomId, isAdminAuthenticated]);


  const handleAdminLogin = (login: string, password_param: string) => {
    if (login === ADMIN_LOGIN && password_param === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setIsLoginDialogOpen(false);
      localStorage.setItem('isAdminAuthenticated', 'true');
      toast({ title: "Вход выполнен", description: "Добро пожаловать, Администратор!" });
    } else {
      toast({ title: "Ошибка входа", description: "Неверные учетные данные.", variant: "destructive" });
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsLoginDialogOpen(true); 
    localStorage.removeItem('isAdminAuthenticated');
    toast({ title: "Выход выполнен", description: "Вы вышли из системы." });
  };

  const handleAddOrUpdateRoom = (data: RoomSubmitData, roomId?: string) => {
    if (!isAdminAuthenticated) return;
    const roomData: Omit<Room, 'id'> = {
      name: data.name,
      rows: data.rows,
      cols: data.cols,
      corridorsAfterRows: data.corridorsAfterRows || [],
      corridorsAfterCols: data.corridorsAfterCols || [],
      activeGroupIds: data.activeGroupIds || [],
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
      toast({ title: "Действие запрещено", description: "Нельзя удалить последний кабинет.", variant: "destructive"});
      setItemToDelete(null);
      return;
    }
    setItemToDelete({ type: 'room', id: roomIdToDelete });
  };
  
  const confirmDeleteRoom = (roomIdToDelete: string) => {
     if (!isAdminAuthenticated) return;
     setLaptops(prevLaptops => prevLaptops.filter(lap => lap.roomId !== roomIdToDelete));
     setRooms(prevRooms => {
        const remainingRooms = prevRooms.filter(r => r.id !== roomIdToDelete);
        if (currentRoomId === roomIdToDelete) {
            setCurrentRoomId(remainingRooms[0]?.id || null);
        }
        return remainingRooms;
     });
     setItemToDelete(null);
     toast({ title: "Кабинет удален", description: "Кабинет и все ноутбуки в нем были удалены." });
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
            // If password field is explicitly cleared, remove the password
            // This case might need clarification: do we allow empty passwords or remove the field?
            // For now, setting to empty string if explicitly cleared.
            updatedLaptop.password = ""; 
          }
          // If password field is undefined (e.g. not touched in form), current password remains.
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
        studentIds: [], // Initialize with empty array
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

  const confirmDeleteItem = () => {
    if (!isAdminAuthenticated || !itemToDelete) return;
    if (itemToDelete.type === 'laptop') {
      setLaptops(laps => laps.filter(lap => lap.id !== itemToDelete.id));
      toast({ title: "Ноутбук удален", description: "Ноутбук был удален." });
    } else if (itemToDelete.type === 'room') {
      confirmDeleteRoom(itemToDelete.id); 
    }
    setItemToDelete(null);
  };

  const handleDeleteLaptop = (laptopId: string) => {
    if (!isAdminAuthenticated) return;
    setItemToDelete({ type: 'laptop', id: laptopId });
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
        toast({ title: "Ошибка", description: "Нельзя переместить ноутбук из другого кабинета.", variant: "destructive"});
        return prevLaptops;
      }
      
      const existingLaptopAtDesk = prevLaptops.find(l => l.roomId === currentRoomId && l.locationId === deskId);

      return prevLaptops.map(lap => {
        if (lap.id === laptopIdToDrop) {
          return { ...lap, locationId: deskId, roomId: currentRoomId };
        }
        // If there was a laptop at the target desk, move it to the source desk of the dropped laptop
        if (existingLaptopAtDesk && lap.id === existingLaptopAtDesk.id) {
          // Ensure droppedLaptop.locationId is the original location before the drop
          return { ...lap, locationId: droppedLaptop.locationId, roomId: currentRoomId }; 
        }
        return lap;
      });
    });
    setDraggedLaptopId(null);
  };

  const handleAssignStudentsToLaptop = (laptopId: string, selectedStudentIds: string[]) => {
    if (!isAdminAuthenticated) return; 
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId) { 
        return { ...lap, studentIds: selectedStudentIds };
      }
      return lap;
    }));
    setIsAssignStudentOpen(false);
    setLaptopToAssign(null);
    setIsDeskActionModalOpen(false);
    toast({ title: "Назначения обновлены", description: "Список учащихся для ноутбука обновлен." });
  };
  
  const handleUnassignAllStudentsFromLaptop = (laptopId: string) => {
    if (!isAdminAuthenticated) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId) { 
        return { ...lap, studentIds: [] };
      }
      return lap;
    }));
    setIsDeskActionModalOpen(false);
    toast({ title: "Все назначения сняты", description: "Все учащиеся были сняты с этого ноутбука." });
  };
  
  const handleUnassignSpecificStudentFromLaptop = (laptopId: string, studentIdToRemove: string) => {
    if (!isAdminAuthenticated) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId) {
        return { ...lap, studentIds: lap.studentIds.filter(id => id !== studentIdToRemove) };
      }
      return lap;
    }));
    // Optionally close modal or refresh its state if open
    if(currentActionDesk?.laptop?.id === laptopId) {
        setCurrentActionDesk(prev => prev ? {
            ...prev,
            students: prev.students?.filter(s => s.id !== studentIdToRemove)
        } : null);
    }
    toast({ title: "Учащийся снят с ноутбука", description: "Выбранный учащийся был снят с назначения." });
  };


  const handleUnassignLocation = (laptopId: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId && lap.roomId === currentRoomId) { 
        return { ...lap, locationId: null };
      }
      return lap;
    }));
    toast({ title: "Ноутбук снят с места", description: "Ноутбук был снят со стола." });
  };

  const handleOpenDeskActionModal = (deskId: number) => {
    if (!currentRoom) return;
    const desk = desks.find(d => d.id === deskId);
    if (!desk) return;

    const laptopOnDesk = laptops.find(l => l.roomId === currentRoom.id && l.locationId === deskId);
    const studentsAssigned = laptopOnDesk && laptopOnDesk.studentIds.length > 0
      ? students.filter(s => laptopOnDesk.studentIds.includes(s.id)) 
      : [];

    setCurrentActionDesk({ desk, laptop: laptopOnDesk, students: studentsAssigned });
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
    toast({ title: "Заметки сохранены", description: "Заметки для ноутбука обновлены." });
    if (currentActionDesk?.laptop?.id === laptopId) {
        setCurrentActionDesk(prev => prev ? {...prev, laptop: {...prev.laptop!, notes}} : null);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Навигатор по классу</h1>
            </div>
            <Button onClick={() => setIsLoginDialogOpen(true)}>
              <LogIn className="mr-2 h-4 w-4" /> Вход для администратора
            </Button>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center">
          <Card className="p-6 md:p-8 max-w-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center">
                <ShieldAlert className="mr-2 h-7 w-7 text-destructive" /> Доступ ограничен
              </CardTitle>
              <CardDescription>
                Пожалуйста, войдите как администратор для доступа к приложению.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setIsLoginDialogOpen(true)} className="w-full">
                 <LogIn className="mr-2 h-4 w-4" /> Вход для администратора
                </Button>
            </CardContent>
          </Card>
        </main>
        <footer className="py-6 md:px-8 md:py-0 border-t">
          <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row px-4 sm:px-6">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} Навигатор по классу.
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

  const laptopsInCurrentRoom = laptops.filter(lap => lap.roomId === currentRoomId);
  const unassignedLaptopsInCurrentRoom = laptopsInCurrentRoom.filter(lap => !lap.locationId);
  const assignedLaptopsInCurrentRoom = laptopsInCurrentRoom.filter(lap => lap.locationId !== null);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <Home className="mr-2 h-6 w-6 text-primary" />
            <h1 className="text-lg sm:text-xl font-bold truncate max-w-[150px] sm:max-w-xs">Навигатор {currentRoom ? `- ${currentRoom.name}` : ''}</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
             <Button asChild variant="outline" size="sm" className="px-2 md:px-3">
              <Link href="/admin/students">
                <Users2Icon className="h-4 w-4 md:mr-2" /> 
                <span className="hidden md:inline">Группы/Учащиеся</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="px-2 md:px-3">
              <Link href="/admin/users">
                <Users className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Пользователи</span>
              </Link>
            </Button>
            <Button onClick={handleAdminLogout} variant="outline" size="sm" className="px-2 md:px-3">
              <LogOut className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Выход</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8">
        {!currentRoomId && rooms.length > 0 && (
             <Card className="mb-6">
                <CardContent className="pt-6 text-center">
                    <p className="text-lg font-semibold">Добро пожаловать, Администратор!</p>
                    <p className="text-muted-foreground">Пожалуйста, выберите кабинет для начала работы или добавьте новый.</p>
                </CardContent>
             </Card>
        )}
        {!currentRoomId && rooms.length === 0 && (
             <Card className="mb-6">
                <CardContent className="pt-6 text-center">
                    <p className="text-lg font-semibold">Нет доступных кабинетов</p>
                    <p className="text-muted-foreground">Пожалуйста, добавьте новый кабинет, чтобы начать управление классом.</p>
                     <Button
                        onClick={() => { setEditingRoom(undefined); setIsRoomFormOpen(true); }}
                        className="mt-4"
                        disabled={!isAdminAuthenticated}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Добавить первый кабинет
                      </Button>
                </CardContent>
             </Card>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            {currentRoom ? (
              <ClassroomLayout
                desks={desks}
                laptops={assignedLaptopsInCurrentRoom}
                allStudents={students} 
                groups={groups} 
                onDropLaptopOnDesk={handleDropLaptopOnDesk}
                onDeskClick={(deskId) => handleOpenDeskActionModal(deskId)}
                rows={currentRoom.rows}
                cols={currentRoom.cols}
                corridorsAfterRows={currentRoom.corridorsAfterRows || []}
                corridorsAfterCols={currentRoom.corridorsAfterCols || []}
                isAdminAuthenticated={isAdminAuthenticated}
              />
            ) : (
              <Card className="h-[300px] sm:h-[400px] flex items-center justify-center bg-muted/20 border-dashed">
                <CardContent className="text-center p-4">
                   <Home className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">Выберите или создайте кабинет для просмотра схемы.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl"><Home className="mr-2 h-5 w-5" /> Управление кабинетами</CardTitle>
                <CardDescription>Выберите, добавьте или отредактируйте кабинеты.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="room-select">Текущий кабинет</Label>
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
                    disabled={!isAdminAuthenticated || (rooms.length === 0 && !currentRoomId)}
                  >
                    <SelectTrigger id="room-select">
                      <SelectValue placeholder="Выберите кабинет" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map(room => (
                        <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                      ))}
                       {rooms.length === 0 && <SelectItem value="" disabled>Нет доступных кабинетов</SelectItem>}
                       <SelectItem value="__add_new_room__" className="text-primary hover:!bg-primary/10">
                          <PlusCircle className="inline-block mr-2 h-4 w-4" /> Добавить новый кабинет...
                       </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {currentRoom && currentRoom.activeGroupIds && currentRoom.activeGroupIds.length > 0 && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Активные группы: </span>
                    {currentRoom.activeGroupIds.map(gid => groups.find(g => g.id === gid)?.name).filter(Boolean).join(', ') || "Не указаны"}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => { setEditingRoom(undefined); setIsRoomFormOpen(true); }}
                    className="flex-1"
                    disabled={!isAdminAuthenticated}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить кабинет
                  </Button>
                  {currentRoom && (
                    <Button
                      variant="outline"
                      onClick={() => { setEditingRoom(currentRoom); setIsRoomFormOpen(true); }}
                      className="flex-1"
                      disabled={!isAdminAuthenticated}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Редактировать кабинет
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
                        <Trash2 className="mr-2 h-4 w-4" /> Удалить текущий кабинет
                    </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl"><LaptopIconLucide className="mr-2 h-5 w-5" /> Ноутбуки</CardTitle>
                <CardDescription>Управление ноутбуками в <span className="font-semibold">{currentRoom?.name || "выбранном кабинете"}</span>.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => { setEditingLaptop(undefined); setLaptopToCreateAtDesk(null); setIsLaptopFormOpen(true); }}
                  className="w-full mb-4"
                  disabled={!isAdminAuthenticated || !currentRoomId}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Добавить новый ноутбук
                </Button>
                <ScrollArea className="h-[200px] pr-2 sm:pr-3">
                  {!currentRoomId && <p className="text-sm text-muted-foreground text-center">Выберите кабинет для управления ноутбуками.</p>}
                  {currentRoomId && laptopsInCurrentRoom.length === 0 && <p className="text-sm text-muted-foreground text-center">В этом кабинете нет ноутбуков.</p>}
                  
                  {unassignedLaptopsInCurrentRoom.map(laptop => (
                    <LaptopItem
                      key={laptop.id}
                      laptop={laptop}
                      assignedStudents={students.filter(s => laptop.studentIds.includes(s.id))} 
                      groups={groups} 
                      isDraggable={true}
                      onDragStart={handleDragStart}
                      onEdit={() => { setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
                      onDelete={() => handleDeleteLaptop(laptop.id)}
                      onViewCredentials={() => { setLaptopToView(laptop); setIsViewCredentialsOpen(true); }}
                      onManageAssignments={() => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true); }}
                      onUnassignAllStudents={() => handleUnassignAllStudentsFromLaptop(laptop.id)}
                      isAdminAuthenticated={isAdminAuthenticated}
                    />
                  ))}
                   {assignedLaptopsInCurrentRoom.length > 0 && unassignedLaptopsInCurrentRoom.length > 0 && <Separator className="my-3"/>}
                   {assignedLaptopsInCurrentRoom.map(laptop => (
                    <LaptopItem
                      key={laptop.id}
                      laptop={laptop}
                      assignedStudents={students.filter(s => laptop.studentIds.includes(s.id))} 
                      groups={groups} 
                      isDraggable={true}
                      onDragStart={handleDragStart}
                      onEdit={() => { setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
                      onDelete={() => handleDeleteLaptop(laptop.id)}
                      onViewCredentials={() => { setLaptopToView(laptop); setIsViewCredentialsOpen(true); }}
                      onManageAssignments={() => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true); }}
                      onUnassignAllStudents={() => handleUnassignAllStudentsFromLaptop(laptop.id)}
                      onUnassignLocation={() => handleUnassignLocation(laptop.id)}
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
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row px-4 sm:px-6">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Навигатор по классу. Все права защищены.
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
        allGroups={groups}
      />
      <LaptopFormDialog
        open={isLaptopFormOpen}
        onOpenChange={setIsLaptopFormOpen}
        onSubmit={handleAddOrUpdateLaptop}
        initialData={editingLaptop}
      />
      <AssignStudentDialog
        open={isAssignStudentOpen}
        onOpenChange={setIsAssignStudentOpen}
        laptop={laptopToAssign}
        allStudents={students} 
        groups={groups} 
        onAssign={handleAssignStudentsToLaptop}
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
        onManageAssignments={(laptop) => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true); }}
        onUnassignAllStudents={handleUnassignAllStudentsFromLaptop}
        onUnassignSpecificStudent={handleUnassignSpecificStudentFromLaptop}
        onUnassignLaptopFromDesk={handleUnassignLocation}
        onSaveNotes={handleSaveNotes}
        onAddLaptopToDesk={(desk) => { 
            setLaptopToCreateAtDesk(desk); 
            setEditingLaptop(undefined); 
            setIsLaptopFormOpen(true); 
        }}
        groups={groups} 
        isAdminAuthenticated={isAdminAuthenticated}
      />
      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие необратимо. Это навсегда удалит {itemToDelete.type === 'laptop' ? 'ноутбук' : 'кабинет'}
                {itemToDelete.type === 'room' && ' и все ноутбуки в нем'}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
