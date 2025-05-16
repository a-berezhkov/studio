
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
import { PlusCircle, Edit3, Trash2, Eye, UserPlus, Users, Laptop as LaptopIconLucide, Home, Edit, LogIn, LogOut, ShieldAlert, Package } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export type DeskActionData = {
  desk: Desk;
  laptop?: Laptop;
  student?: Student;
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

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAdminAuthenticated');
    if (storedAuth === 'true') {
      setIsAdminAuthenticated(true);
      setIsLoginDialogOpen(false);
    }

    const storedRooms = localStorage.getItem('rooms');
    const storedLaptops = localStorage.getItem('laptops');
    const storedStudents = localStorage.getItem('students');
    const storedGroups = localStorage.getItem('groups');
    const storedCurrentRoomId = localStorage.getItem('currentRoomId');
    let defaultRoomCreated = false;
    let defaultGroupCreated = false;

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
        defaultGroupCreated = true;
    }

    if (storedLaptops) {
      setLaptops(JSON.parse(storedLaptops));
    } else {
        const mockLaptops: Laptop[] = [
            { id: "laptop-1", login: "Kab5-N01", password: "password1", locationId: 1, studentId: "student-1", notes: "Это заметка для ноутбука 1.", roomId: DEFAULT_ROOM_ID },
            { id: "laptop-2", login: "Kab5-N02", password: "password2", locationId: 2, studentId: null, notes: "", roomId: DEFAULT_ROOM_ID },
            { id: "laptop-3", login: "Kab5-N03", password: "password3", locationId: null, studentId: null, notes: "Заметка для неназначенного ноутбука.", roomId: DEFAULT_ROOM_ID },
        ];
        setLaptops(mockLaptops);
    }
    if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
    } else {
        const mockStudents: Student[] = [
            { id: "student-1", name: "Алиса Селезнева", groupId: DEFAULT_GROUP_ID },
            { id: "student-2", name: "Иван Царевич", groupId: DEFAULT_GROUP_ID },
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
  }, [currentRoomId, rooms, currentRoom?.rows, currentRoom?.cols]); // currentRoom dependency to react to its changes

  useEffect(() => {
    if (isAdminAuthenticated) { // Save only if admin is authenticated
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
            updatedLaptop.password = ""; // Explicitly clear password if empty string is provided
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
        // If there was a laptop at the target desk, move it to the source desk of the dropped laptop (swap)
        if (existingLaptopAtDesk && lap.id === existingLaptopAtDesk.id) {
          return { ...lap, locationId: droppedLaptop.locationId, roomId: currentRoomId }; 
        }
        return lap;
      });
    });
    setDraggedLaptopId(null);
  };

  const handleAssignStudentToLaptop = (laptopId: string, studentId: string) => {
    if (!isAdminAuthenticated) return; 
    
    let newLaptops = [...laptops];

    // Unassign the student from any OTHER laptop they might be assigned to globally
    newLaptops = newLaptops.map(otherLap => {
      if (otherLap.studentId === studentId && otherLap.id !== laptopId) {
        return { ...otherLap, studentId: null };
      }
      return otherLap;
    });

    // Assign the student to the target laptop
    newLaptops = newLaptops.map(lap => {
      if (lap.id === laptopId) { 
        return { ...lap, studentId };
      }
      return lap;
    });

    setLaptops(newLaptops);
    setIsAssignStudentOpen(false);
    setLaptopToAssign(null);
    setIsDeskActionModalOpen(false);
    toast({ title: "Учащийся назначен", description: "Учащийся был назначен на ноутбук." });
  };

  const handleUnassignStudentFromLaptop = (laptopId: string) => {
    if (!isAdminAuthenticated) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId) { 
        return { ...lap, studentId: null };
      }
      return lap;
    }));
    setIsDeskActionModalOpen(false);
    toast({ title: "Назначение учащегося снято", description: "Назначение учащегося было снято." });
  };
  
  const handleUnassignLocation = (laptopId: string) => {
    if (!isAdminAuthenticated || !currentRoomId) return;
    setLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId && lap.roomId === currentRoomId) { // Check if laptop is in current room
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
    const studentAssigned = laptopOnDesk && laptopOnDesk.studentId
      ? students.find(s => s.id === laptopOnDesk.studentId) 
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
    toast({ title: "Заметки сохранены", description: "Заметки для ноутбука обновлены." });
    // Update notes in the action modal if it's open for this laptop
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
          <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
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
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="mr-2 h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Навигатор по классу {currentRoom ? `- ${currentRoom.name}` : ''}</h1>
          </div>
          <div className="flex items-center gap-2">
             <Button asChild variant="outline">
              <Link href="/admin/students">
                <Package className="mr-2 h-4 w-4" />
                Управление группами и учащимися
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                Управление пользователями
              </Link>
            </Button>
            <Button onClick={handleAdminLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" /> Выход администратора
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {currentRoom ? (
              <ClassroomLayout
                desks={desks}
                laptops={assignedLaptopsInCurrentRoom}
                students={students} 
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
              <Card className="h-[400px] flex items-center justify-center bg-muted/20 border-dashed">
                <CardContent className="text-center">
                   <Home className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">Выберите или создайте кабинет для просмотра схемы.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Home className="mr-2 h-5 w-5" /> Управление кабинетами</CardTitle>
                <CardDescription>Выберите, добавьте или отредактируйте кабинеты.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Активные группы: </span>
                    {currentRoom.activeGroupIds.map(gid => groups.find(g => g.id === gid)?.name).filter(Boolean).join(', ') || "Не указаны"}
                  </div>
                )}
                <div className="flex gap-2">
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
                <CardTitle className="flex items-center"><LaptopIconLucide className="mr-2 h-5 w-5" /> Ноутбуки</CardTitle>
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
                <ScrollArea className="h-[200px] pr-3">
                  {!currentRoomId && <p className="text-sm text-muted-foreground text-center">Выберите кабинет для управления ноутбуками.</p>}
                  {currentRoomId && laptopsInCurrentRoom.length === 0 && <p className="text-sm text-muted-foreground text-center">В этом кабинете нет ноутбуков.</p>}
                  
                  {unassignedLaptopsInCurrentRoom.map(laptop => (
                    <LaptopItem
                      key={laptop.id}
                      laptop={laptop}
                      assignedStudent={students.find(s => s.id === laptop.studentId)} 
                      groups={groups} 
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
                   {/* Display assigned laptops last or separately */}
                   {assignedLaptopsInCurrentRoom.map(laptop => (
                    <LaptopItem
                      key={laptop.id}
                      laptop={laptop}
                      assignedStudent={students.find(s => s.id === laptop.studentId)} 
                      groups={groups} 
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
          </div>
        </div>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
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
        students={students} 
        groups={groups} 
        laptops={laptops} 
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
        onUnassignLaptopFromDesk={handleUnassignLocation} // Pass the handler
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

