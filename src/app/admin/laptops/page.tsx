
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Laptop, Student, Group, Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminLaptopListItem } from "@/components/admin-laptop-list-item";
import { LaptopFormDialog } from "@/components/laptop-form-dialog";
import { AssignStudentDialog } from "@/components/assign-student-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Search, ListChecks } from "lucide-react";

export default function AdminAllLaptopsPage() {
  const { toast } = useToast();
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  
  const [filteredLaptops, setFilteredLaptops] = useState<Laptop[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLaptopFormOpen, setIsLaptopFormOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | undefined>(undefined);
  
  const [isAssignStudentOpen, setIsAssignStudentOpen] = useState(false);
  const [laptopToAssign, setLaptopToAssign] = useState<Laptop | null>(null);

  const [laptopToDelete, setLaptopToDelete] = useState<Laptop | null>(null);

  // Data migration for localStorage (laptops)
  const migrateLaptopData = () => {
    const storedLaptopsRaw = localStorage.getItem('laptops');
    if (storedLaptopsRaw) {
      let parsedLaptops = JSON.parse(storedLaptopsRaw);
      let migrationNeeded = false;
      parsedLaptops = parsedLaptops.map((lap: any) => {
        if (lap.studentId !== undefined && !lap.studentIds) {
          migrationNeeded = true;
          return { ...lap, studentIds: lap.studentId ? [lap.studentId] : [], studentId: undefined };
        }
         if (lap.studentIds === undefined) {
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
    const migratedLaptops = migrateLaptopData();
    setAllLaptops(migratedLaptops);
    setFilteredLaptops(migratedLaptops);

    const storedStudents = localStorage.getItem('students');
    if (storedStudents) setAllStudents(JSON.parse(storedStudents));
    
    const storedGroups = localStorage.getItem('groups');
    if (storedGroups) setAllGroups(JSON.parse(storedGroups));

    const storedRooms = localStorage.getItem('rooms');
    if (storedRooms) setAllRooms(JSON.parse(storedRooms));
  }, []);

  const saveLaptopsToLocalStorage = useCallback(() => {
    localStorage.setItem('laptops', JSON.stringify(allLaptops));
  }, [allLaptops]);

  useEffect(() => { saveLaptopsToLocalStorage(); }, [allLaptops, saveLaptopsToLocalStorage]);

  useEffect(() => {
    const results = allLaptops.filter(laptop =>
      laptop.login.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLaptops(results);
  }, [searchTerm, allLaptops]);

  const handleAddOrUpdateLaptop = (formData: { login: string; password?: string; notes?: string }, laptopId?: string) => {
    let updatedLaptops;
    if (laptopId) {
      updatedLaptops = allLaptops.map(lap => {
        if (lap.id === laptopId) {
          const updatedLaptopData = { ...lap, login: formData.login, notes: formData.notes || lap.notes || "" };
          if (typeof formData.password === 'string' && formData.password.length > 0) {
            updatedLaptopData.password = formData.password;
          } else if (formData.password === "" && typeof lap.password === 'string') {
            updatedLaptopData.password = "";
          }
          return updatedLaptopData;
        }
        return lap;
      });
    } else {
      // Adding new laptop is generally done via main page with room context.
      // This page focuses on managing existing ones. Could be added if a default room is chosen or roomId is part of form.
      toast({ title: "Функция не реализована", description: "Добавление новых ноутбуков производится на главной странице в контексте кабинета.", variant: "default" });
      setIsLaptopFormOpen(false);
      return;
    }
    setAllLaptops(updatedLaptops);
    setEditingLaptop(undefined);
    setIsLaptopFormOpen(false);
    toast({ title: laptopId ? "Ноутбук обновлен" : "Ноутбук добавлен", description: `Ноутбук "${formData.login}" был ${laptopId ? 'обновлен' : 'добавлен'}.` });
  };
  
  const handleOpenDeleteDialog = (laptop: Laptop) => {
    setLaptopToDelete(laptop);
  };

  const confirmDeleteLaptop = () => {
    if (!laptopToDelete) return;
    const updatedLaptops = allLaptops.filter(lap => lap.id !== laptopToDelete.id);
    setAllLaptops(updatedLaptops);
    toast({ title: "Ноутбук удален", description: `Ноутбук "${laptopToDelete.login}" был удален.` });
    setLaptopToDelete(null);
  };

  const handleAssignStudentsToLaptop = (laptopId: string, selectedStudentIds: string[]) => {
    setAllLaptops(laps => laps.map(lap => 
      lap.id === laptopId ? { ...lap, studentIds: selectedStudentIds } : lap
    ));
    setIsAssignStudentOpen(false);
    setLaptopToAssign(null);
    toast({ title: "Назначения обновлены", description: "Список учащихся для ноутбука обновлен." });
  };
  
  const handleSaveNotes = (laptopId: string, notes: string) => {
    setAllLaptops(laps => laps.map(lap => {
      if (lap.id === laptopId) {
        return { ...lap, notes };
      }
      return lap;
    }));
    toast({ title: "Заметки сохранены", description: "Заметки для ноутбука обновлены." });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Все ноутбуки</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться в класс
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Список всех ноутбуков</CardTitle>
            <CardDescription>Просмотр, поиск и управление всеми ноутбуками в системе.</CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по логину ноутбука..."
                className="pl-8 w-full sm:w-72"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {allLaptops.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Нет доступных ноутбуков.</p>}
            {allLaptops.length > 0 && filteredLaptops.length === 0 && searchTerm && (
                <p className="text-sm text-muted-foreground text-center py-8">Ноутбуки с логином "{searchTerm}" не найдены.</p>
            )}
            <ScrollArea className="h-[calc(100vh-350px)] md:min-h-[400px] pr-2 sm:pr-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLaptops.map(laptop => (
                  <AdminLaptopListItem
                    key={laptop.id}
                    laptop={laptop}
                    allStudents={allStudents}
                    allGroups={allGroups}
                    allRooms={allRooms}
                    onEdit={() => { setEditingLaptop(laptop); setIsLaptopFormOpen(true); }}
                    onDelete={() => handleOpenDeleteDialog(laptop)}
                    onManageAssignments={() => { setLaptopToAssign(laptop); setIsAssignStudentOpen(true); }}
                    onSaveNotes={handleSaveNotes}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
      
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row px-4 sm:px-6">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Навигатор по классу. Управление ноутбуками.
          </p>
        </div>
      </footer>

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
        allStudents={allStudents} 
        groups={allGroups} 
        onAssign={handleAssignStudentsToLaptop}
        isAdminAuthenticated={true} // Assuming this page is admin-only
      />

      {laptopToDelete && (
        <AlertDialog open={!!laptopToDelete} onOpenChange={() => setLaptopToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие необратимо. Это навсегда удалит ноутбук <span className="font-semibold">"{laptopToDelete.login}"</span>.
                Он также будет снят со всех назначений.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setLaptopToDelete(null)}>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteLaptop} className="bg-destructive hover:bg-destructive/90">
                Удалить ноутбук
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
