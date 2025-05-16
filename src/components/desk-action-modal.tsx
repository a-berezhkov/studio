
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
import { useEffect, useState } from "react";
import { Laptop as LaptopIcon, User, Edit, KeyRound, StickyNote, PlusCircle, UserMinus, Package } from "lucide-react"; 

interface DeskActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deskActionData: DeskActionData | null;
  onEditLaptop: (laptop: Laptop) => void;
  onViewCredentials: (laptop: Laptop) => void;
  onAssignStudent: (laptop: Laptop) => void;
  onUnassignStudent: (laptopId: string) => void;
  onSaveNotes: (laptopId: string, notes: string) => void;
  onAddLaptopToDesk: (desk: Desk) => void;
  groups: Group[]; 
  isAdminAuthenticated: boolean;
}

export function DeskActionModal({
  open,
  onOpenChange,
  deskActionData,
  onEditLaptop,
  onViewCredentials,
  onAssignStudent,
  onUnassignStudent,
  onSaveNotes,
  onAddLaptopToDesk,
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

  const { desk, laptop, student } = deskActionData;
  const studentGroup = student ? groups.find(g => g.id === student.groupId) : undefined;

  const handleSaveNotes = () => {
    if (laptop && isAdminAuthenticated) {
      onSaveNotes(laptop.id, currentNotes);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Действия для стола {desk.id}</DialogTitle>
          {laptop ? (
            <DialogDescription>
              Управление ноутбуком <span className="font-semibold">{laptop.login}</span>
              {student ? ` назначенным учащемуся ${student.name}${studentGroup ? ` (Группа: ${studentGroup.name})` : ''}.` : "."}
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
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onEditLaptop(laptop)} disabled={!isAdminAuthenticated}>
                    <Edit className="mr-2 h-4 w-4" /> Редакт. данные
                  </Button>
                  <Button variant="outline" onClick={() => onViewCredentials(laptop)}>
                    <KeyRound className="mr-2 h-4 w-4" /> Просмотр учетных данных
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                  <User className="mr-2 h-4 w-4" /> Назначение учащегося
                </h3>
                {student ? (
                  <div className="space-y-2">
                     <p className="text-sm">Назначен: <span className="font-semibold">{student.name}</span></p>
                     {studentGroup && <p className="text-xs text-muted-foreground flex items-center"><Package className="w-3 h-3 mr-1"/> Группа: {studentGroup.name}</p>}
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => onAssignStudent(laptop)} disabled={!isAdminAuthenticated}>
                            <User className="mr-2 h-4 w-4" /> Сменить учащегося
                        </Button>
                        <Button variant="outline" onClick={() => { onUnassignStudent(laptop.id); }} disabled={!isAdminAuthenticated}>
                            <UserMinus className="mr-2 h-4 w-4" /> Снять назначение
                        </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => onAssignStudent(laptop)} disabled={!isAdminAuthenticated}>
                    <User className="mr-2 h-4 w-4" /> Назначить учащегося
                  </Button>
                )}
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
