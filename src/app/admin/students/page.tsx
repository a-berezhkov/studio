
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Student, Room, Laptop, Group } from "@/lib/types";
import { StudentItem } from "@/components/student-item";
import { StudentFormDialog } from "@/components/student-form-dialog";
import { GroupFormDialog } from "@/components/group-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Users, ArrowLeft, Trash2, Edit, Package, Users2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AdminStudentsGroupsPage() {
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]); 

  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);

  const [itemToDelete, setItemToDelete] = useState<{ type: 'student' | 'group', id: string, name?: string } | null>(null);

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
    const storedGroups = localStorage.getItem('groups');
    const storedStudents = localStorage.getItem('students');
    const migratedLaptops = migrateLaptopData();

    if (storedGroups) setGroups(JSON.parse(storedGroups));
    else {
        const defaultGroup: Group = {id: 'group-default', name: 'Нераспределенные'};
        setGroups([defaultGroup]);
    }
    if (storedStudents) setAllStudents(JSON.parse(storedStudents));
    setAllLaptops(migratedLaptops);
  }, []);

  const saveGroupsToLocalStorage = useCallback(() => {
    localStorage.setItem('groups', JSON.stringify(groups));
  }, [groups]);

  const saveStudentsToLocalStorage = useCallback(() => {
    localStorage.setItem('students', JSON.stringify(allStudents));
  }, [allStudents]);
  
  const saveLaptopsToLocalStorage = useCallback(() => { 
    localStorage.setItem('laptops', JSON.stringify(allLaptops));
  }, [allLaptops]);


  useEffect(() => { saveGroupsToLocalStorage(); }, [groups, saveGroupsToLocalStorage]);
  useEffect(() => { saveStudentsToLocalStorage(); }, [allStudents, saveStudentsToLocalStorage]);
  useEffect(() => { saveLaptopsToLocalStorage(); }, [allLaptops, saveLaptopsToLocalStorage]);

  // Group Handlers
  const handleAddOrUpdateGroup = (data: { name: string }, groupId?: string) => {
    let updatedGroups;
    if (groupId) {
      updatedGroups = groups.map(grp => grp.id === groupId ? { ...grp, ...data } : grp);
    } else {
      const newGroup: Group = { id: `group-${Date.now()}`, name: data.name };
      updatedGroups = [...groups, newGroup];
    }
    setGroups(updatedGroups);
    setEditingGroup(undefined);
    setIsGroupFormOpen(false);
    toast({ title: groupId ? "Группа обновлена" : "Группа добавлена", description: `Группа "${data.name}" была ${groupId ? 'обновлена' : 'добавлена'}.` });
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const studentsInGroup = allStudents.filter(s => s.groupId === groupId);
    if (studentsInGroup.length > 0) {
      toast({ title: "Действие запрещено", description: `Невозможно удалить группу "${group.name}", так как она содержит учащихся. Пожалуйста, сначала переместите или удалите учащихся.`, variant: "destructive"});
      return;
    }
    if (groups.length <= 1 && group.id === 'group-default') {
        toast({ title: "Действие запрещено", description: `Невозможно удалить группу по умолчанию "Нераспределенные", если она единственная.`, variant: "destructive"});
        return;
    }
    setItemToDelete({ type: 'group', id: groupId, name: group.name });
  };

  const confirmDeleteGroup = () => {
    if (!itemToDelete || itemToDelete.type !== 'group') return;
    const updatedGroups = groups.filter(grp => grp.id !== itemToDelete!.id);
    setGroups(updatedGroups);
    toast({ title: "Группа удалена", description: `Группа "${itemToDelete.name || itemToDelete.id}" была удалена.` });
    setItemToDelete(null);
  };

  // Student Handlers
  const handleAddOrUpdateStudent = (data: { name: string; groupId: string }, studentId?: string) => {
    let updatedStudents;
    if (studentId) {
      updatedStudents = allStudents.map(stu => 
        stu.id === studentId ? { ...stu, name: data.name, groupId: data.groupId } : stu
      );
    } else {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name: data.name,
        groupId: data.groupId,
      };
      updatedStudents = [...allStudents, newStudent];
    }
    setAllStudents(updatedStudents);
    setEditingStudent(undefined);
    setIsStudentFormOpen(false);
    toast({ title: studentId ? "Учащийся обновлен" : "Учащийся добавлен", description: `Учащийся "${data.name}" был ${studentId ? 'обновлен' : 'добавлен'}.` });
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    setItemToDelete({ type: 'student', id: studentId, name: student?.name });
  };

  const confirmDeleteStudent = () => {
    if (!itemToDelete || itemToDelete.type !== 'student') return;
    
    const studentIdToDelete = itemToDelete.id;
    const studentName = itemToDelete.name || studentIdToDelete;

    // Unassign student from any laptops globally
    const updatedLaptops = allLaptops.map(lap => {
      if (lap.studentIds.includes(studentIdToDelete)) {
        return { ...lap, studentIds: lap.studentIds.filter(id => id !== studentIdToDelete) };
      }
      return lap;
    });
    setAllLaptops(updatedLaptops);

    const updatedStudents = allStudents.filter(stu => stu.id !== studentIdToDelete);
    setAllStudents(updatedStudents);
    
    toast({ title: "Учащийся удален", description: `Учащийся "${studentName}" был удален.` });
    setItemToDelete(null);
  };
  
  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'student') {
      confirmDeleteStudent();
    } else if (itemToDelete.type === 'group') {
      confirmDeleteGroup();
    }
  };

  const getAssignedLaptopsForStudent = (studentId: string): Laptop[] => {
    return allLaptops.filter(laptop => laptop.studentIds.includes(studentId));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2">
            <Users2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Управление группами и учащимися</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Groups Column */}
          <div className="md:col-span-1 space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:items-center">
                    <CardTitle className="flex items-center text-xl"><Package className="mr-2 h-5 w-5"/>Группы</CardTitle>
                    <Button
                        onClick={() => { setEditingGroup(undefined); setIsGroupFormOpen(true); }}
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Добавить группу
                    </Button>
                </div>
                <CardDescription>Управляйте группами учащихся. Все действия сохраняются автоматически.</CardDescription>
              </CardHeader>
              <CardContent>
                {groups.length === 0 && <p className="text-sm text-muted-foreground text-center">Нет доступных групп. Нажмите "Добавить группу", чтобы начать.</p>}
                <ScrollArea className="h-60 md:h-[calc(100vh-450px)] md:min-h-[200px] pr-2 sm:pr-3">
                  {groups.map(group => (
                    <Card key={group.id} className="mb-3">
                      <CardHeader className="p-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{group.name}</CardTitle>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingGroup(group); setIsGroupFormOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteGroup(group.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Students Column */}
          <div className="md:col-span-2">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:items-center">
                    <CardTitle className="flex items-center text-xl"><Users className="mr-2 h-5 w-5"/>Учащиеся</CardTitle>
                    <Button
                        onClick={() => { setEditingStudent(undefined); setIsStudentFormOpen(true); }}
                        disabled={groups.length === 0}
                        className="w-full sm:w-auto"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Добавить нового учащегося
                    </Button>
                </div>
                <CardDescription>Добавляйте, редактируйте или удаляйте учащихся. Назначайте их в группы.</CardDescription>
              </CardHeader>
              <CardContent>
                {groups.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Пожалуйста, сначала добавьте группу, чтобы начать управление учащимися.</p>
                )}
                {groups.length > 0 && allStudents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Учащиеся еще не добавлены. Нажмите "Добавить нового учащегося", чтобы начать.</p>
                )}

                {groups.length > 0 && allStudents.length > 0 && (
                  <ScrollArea className="h-96 md:h-[calc(100vh-350px)] md:min-h-[300px] pr-2 sm:pr-3 mt-4">
                    <Accordion type="multiple" className="w-full" defaultValue={groups.map(g=>g.id)}>
                       {groups.map(group => {
                        const studentsInGroup = allStudents.filter(s => s.groupId === group.id);
                        return (
                          <AccordionItem value={group.id} key={group.id}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground"/>
                                    <span className="font-semibold">{group.name}</span> 
                                    <span className="text-xs text-muted-foreground">({studentsInGroup.length} уч.)</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-2 pr-1">
                              {studentsInGroup.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">В этой группе нет учащихся.</p>}
                              {studentsInGroup.map(student => (
                                <StudentItem
                                  key={student.id}
                                  student={student}
                                  assignedLaptops={getAssignedLaptopsForStudent(student.id)}
                                  groupName={group.name} 
                                  onEdit={() => { setEditingStudent(student); setIsStudentFormOpen(true); }}
                                  onDelete={() => handleDeleteStudent(student.id)}
                                  isAdminAuthenticated={true} // Assuming this page is admin-only
                                />
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        );
                       })}
                    </Accordion>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row px-4 sm:px-6">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Навигатор по классу. Управление учащимися и группами.
          </p>
        </div>
      </footer>

      <GroupFormDialog
        open={isGroupFormOpen}
        onOpenChange={setIsGroupFormOpen}
        onSubmit={handleAddOrUpdateGroup}
        initialData={editingGroup}
      />
      <StudentFormDialog
        open={isStudentFormOpen}
        onOpenChange={setIsStudentFormOpen}
        onSubmit={handleAddOrUpdateStudent}
        initialData={editingStudent}
        groups={groups} 
      />

      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие необратимо. Это навсегда удалит {itemToDelete.type === 'student' ? 'учащегося' : 'группу'} <span className="font-semibold">"{itemToDelete.name || 'этот элемент'}"</span>.
                {itemToDelete.type === 'student' && ' Он также будет снят со всех назначений на ноутбуки.'}
                {itemToDelete.type === 'group' && ' Убедитесь, что в этой группе нет учащихся перед удалением.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90">
                {itemToDelete.type === 'student' ? 'Удалить учащегося' : 'Удалить группу'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
