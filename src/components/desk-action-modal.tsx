
"use client";

import type { Laptop, Student, Desk, Group } from "@/lib/types"; 
import type { DeskActionData } from "@/app/page"; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Laptop as LaptopIcon, User, Users, Edit, KeyRound, StickyNote, PlusCircle, UserMinus, Package, Unlink, Trash2, Settings2 } from "lucide-react"; 

interface DeskActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deskActionData: DeskActionData | null;
  onEditLaptop: (laptop: Laptop) => void;
  onViewCredentials: (laptop: Laptop) => void;
  onManageAssignments: (laptop: Laptop) => void; // Changed
  onUnassignAllStudents: (laptopId: string) => void; // Changed
  onUnassignSpecificStudent: (laptopId: string, studentId: string) => void; // New
  onSaveNotes: (laptopId: string, notes: string) => void;
  onAddLaptopToDesk: (desk: Desk) => void;
  onUnassignLaptopFromDesk?: (laptopId: string) => void; 
  groups: Group[]; 
  isAdminAuthenticated: boolean;
}

export function DeskActionModal({
  open,
  onOpenChange,
  deskActionData,
  onEditLaptop,
  onViewCredentials,
  onManageAssignments, // Changed
  onUnassignAllStudents, // Changed
  onUnassignSpecificStudent, // New
  onSaveNotes,
  onAddLaptopToDesk,
  onUnassignLaptopFromDesk, 
  groups, 
  isAdminAuthenticated,
}: DeskActionModalProps) {
  const [currentNotes, setCurrentNotes] = useState("");

  useEffect(() => {
    if (deskActionData?.laptop) {
      setCurrentNotes(deskActionData.laptop.notes || "");
    } else {
      setCurrentNotes("");
    }
  }, [deskActionData]);

  if (!deskActionData) return null;

  const { desk, laptop, students } = deskActionData; // students is now an array

  const handleSaveNotes = () => {
    if (laptop && isAdminAuthenticated) {
      onSaveNotes(laptop.id, currentNotes);
    }
  };

  const handleUnassignFromDesk = () => {
    if (laptop && onUnassignLaptopFromDesk && isAdminAuthenticated) {
      onUnassignLaptopFromDesk(laptop.id);
      onOpenChange(false); 
    }
  }

  const getStudentGroupName = (student: Student): string => {
    const group = groups.find(g => g.id === student.groupId);
    return group ? group.name : "Неизвестная группа";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card"> {/* Slightly wider for student list */}
        <DialogHeader>
          <DialogTitle>Действия для стола {desk.id}</DialogTitle>
          {laptop ? (
            <DialogDescription>
              Управление ноутбуком <span className="font-semibold">{laptop.login}</span>.
              {students && students.length > 0 ? ` Назначен учащимся.` : " Учащиеся не назначены."}
            </DialogDescription>
          ) : (
            <DialogDescription>Этот стол в данный момент пуст.</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4 space-y-4">
          {laptop ? (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <LaptopIcon className="mr-2 h-4 w-4" /> Действия с ноутбуком
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onEditLaptop(laptop)} disabled={!isAdminAuthenticated}>
                    <Edit className="mr-2 h-4 w-4" /> Редакт. данные
                  </Button>
                  <Button variant="outline" onClick={() => onViewCredentials(laptop)}>
                    <KeyRound className="mr-2 h-4 w-4" /> Просмотр учетных данных
                  </Button>
                </div>
                {onUnassignLaptopFromDesk && (
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full" 
                        onClick={handleUnassignFromDesk} 
                        disabled={!isAdminAuthenticated}
                    >
                        <Unlink className="mr-2 h-4 w-4" /> Убрать ноутбук со стола
                    </Button>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                  <Users className="mr-2 h-4 w-4" /> Назначенные учащиеся
                </h3>
                {students && students.length > 0 ? (
                  <ScrollArea className="max-h-[150px] border rounded-md p-2 mb-2">
                    <ul className="space-y-1">
                      {students.map(student => (
                        <li key={student.id} className="text-sm flex justify-between items-center">
                          <div>
                            <span className="font-medium">{student.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({getStudentGroupName(student)})</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => onUnassignSpecificStudent(laptop.id, student.id)} 
                            disabled={!isAdminAuthenticated}
                            title="Снять назначение с этого учащегося"
                          >
                            <UserMinus className="h-4 w-4 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground mb-2">Учащиеся не назначены.</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" onClick={() => onManageAssignments(laptop)} disabled={!isAdminAuthenticated}>
                        <Settings2 className="mr-2 h-4 w-4" /> Управлять назначениями
                    </Button>
                    {students && students.length > 0 && (
                        <Button variant="outline" className="w-full" onClick={() => { onUnassignAllStudents(laptop.id); }} disabled={!isAdminAuthenticated}>
                            <Trash2 className="mr-2 h-4 w-4" /> Снять все назначения
                        </Button>
                    )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <StickyNote className="mr-2 h-4 w-4" /> Заметки о ноутбуке
                </h3>
                <Textarea
                  placeholder="Введите заметки для этого ноутбука..."
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  className="min-h-[80px]"
                  disabled={!isAdminAuthenticated}
                />
                <Button onClick={handleSaveNotes} size="sm" className="mt-2" disabled={!isAdminAuthenticated}>
                  Сохранить заметки
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Этот стол пуст.</p>
              <Button onClick={() => onAddLaptopToDesk(desk)} disabled={!isAdminAuthenticated}>
                <PlusCircle className="mr-2 h-4 w-4" /> Добавить ноутбук на этот стол
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Закрыть
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
