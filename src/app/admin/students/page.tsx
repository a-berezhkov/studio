
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
import { Separator } from "@/components/ui/separator";

export default function AdminStudentsGroupsPage() {
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]); // Needed to check assignments

  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);

  const [itemToDelete, setItemToDelete] = useState<{ type: 'student' | 'group', id: string, name?: string } | null>(null);

  useEffect(() => {
    const storedGroups = localStorage.getItem('groups');
    const storedStudents = localStorage.getItem('students');
    const storedLaptops = localStorage.getItem('laptops');

    if (storedGroups) setGroups(JSON.parse(storedGroups));
    else {
        const defaultGroup: Group = {id: 'group-default', name: 'Unassigned'};
        setGroups([defaultGroup]);
    }
    if (storedStudents) setAllStudents(JSON.parse(storedStudents));
    if (storedLaptops) setAllLaptops(JSON.parse(storedLaptops));
  }, []);

  const saveGroupsToLocalStorage = useCallback(() => {
    localStorage.setItem('groups', JSON.stringify(groups));
  }, [groups]);

  const saveStudentsToLocalStorage = useCallback(() => {
    localStorage.setItem('students', JSON.stringify(allStudents));
  }, [allStudents]);
  
  const saveLaptopsToLocalStorage = useCallback(() => { // Laptops might be updated if student is deleted
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
    toast({ title: groupId ? "Group Updated" : "Group Added", description: `Group ${data.name} has been ${groupId ? 'updated' : 'added'}.` });
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const studentsInGroup = allStudents.filter(s => s.groupId === groupId);
    if (studentsInGroup.length > 0) {
      toast({ title: "Action Denied", description: `Cannot delete group "${group.name}" as it contains students. Please move or delete students first.`, variant: "destructive"});
      return;
    }
    if (groups.length <= 1 && group.id === 'group-default') {
        toast({ title: "Action Denied", description: `Cannot delete the default 'Unassigned' group if it's the only one.`, variant: "destructive"});
        return;
    }
    setItemToDelete({ type: 'group', id: groupId, name: group.name });
  };

  const confirmDeleteGroup = () => {
    if (!itemToDelete || itemToDelete.type !== 'group') return;
    const updatedGroups = groups.filter(grp => grp.id !== itemToDelete!.id);
    setGroups(updatedGroups);
    toast({ title: "Group Deleted", description: `Group "${itemToDelete.name || itemToDelete.id}" has been removed.` });
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
    toast({ title: studentId ? "Student Updated" : "Student Added", description: `Student ${data.name} has been ${studentId ? 'updated' : 'added'}.` });
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    setItemToDelete({ type: 'student', id: studentId, name: student?.name });
  };

  const confirmDeleteStudent = () => {
    if (!itemToDelete || itemToDelete.type !== 'student') return;
    
    const studentName = itemToDelete.name || itemToDelete.id;

    // Unassign student from any laptops globally
    const updatedLaptops = allLaptops.map(lap => 
      lap.studentId === itemToDelete!.id ? { ...lap, studentId: null } : lap
    );
    setAllLaptops(updatedLaptops);

    const updatedStudents = allStudents.filter(stu => stu.id !== itemToDelete!.id);
    setAllStudents(updatedStudents);
    
    toast({ title: "Student Deleted", description: `Student ${studentName} has been removed.` });
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Group & Student Management</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Groups Column */}
          <div className="md:col-span-1 space-y-4">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5"/>Groups</CardTitle>
                    <Button
                        onClick={() => { setEditingGroup(undefined); setIsGroupFormOpen(true); }}
                        size="sm"
                        variant="outline"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Group
                    </Button>
                </div>
                <CardDescription>Manage student groups. All actions are saved automatically.</CardDescription>
              </CardHeader>
              <CardContent>
                {groups.length === 0 && <p className="text-sm text-muted-foreground text-center">No groups available. Click "Add Group" to begin.</p>}
                <ScrollArea className="h-[calc(100vh-450px)] min-h-[200px] pr-3">
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
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5"/>Students</CardTitle>
                    <Button
                        onClick={() => { setEditingStudent(undefined); setIsStudentFormOpen(true); }}
                        disabled={groups.length === 0}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
                    </Button>
                </div>
                <CardDescription>Add, edit, or remove students. Assign them to groups.</CardDescription>
              </CardHeader>
              <CardContent>
                {groups.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Please add a group first to start managing students.</p>
                )}
                {groups.length > 0 && allStudents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No students added yet. Click "Add New Student" to begin.</p>
                )}

                {groups.length > 0 && allStudents.length > 0 && (
                  <ScrollArea className="h-[calc(100vh-350px)] min-h-[300px] pr-3 mt-4">
                    <Accordion type="multiple" className="w-full" defaultValue={groups.map(g=>g.id)}>
                       {groups.map(group => {
                        const studentsInGroup = allStudents.filter(s => s.groupId === group.id);
                        return (
                          <AccordionItem value={group.id} key={group.id}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground"/>
                                    <span className="font-semibold">{group.name}</span> 
                                    <span className="text-xs text-muted-foreground">({studentsInGroup.length} student{studentsInGroup.length !== 1 ? 's' : ''})</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-2 pr-1">
                              {studentsInGroup.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No students in this group.</p>}
                              {studentsInGroup.map(student => (
                                <StudentItem
                                  key={student.id}
                                  student={student}
                                  assignedLaptop={allLaptops.find(l => l.studentId === student.id)}
                                  groupName={group.name} // Pass group name for display
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
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Classroom Navigator. Student & Group Management.
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
        groups={groups} // Pass groups for selection
      />

      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {itemToDelete.type} <span className="font-semibold">{itemToDelete.name || 'this item'}</span>.
                {itemToDelete.type === 'student' && ' They will also be unassigned from any laptop.'}
                {itemToDelete.type === 'group' && ' Ensure no students are in this group before deleting.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive hover:bg-destructive/90">
                Delete {itemToDelete.type === 'student' ? 'Student' : 'Group'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
