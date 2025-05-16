
"use client";

import { useState } from "react";
import type { Laptop, Student, Group, Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Edit3, Trash2, Users, KeyRound, StickyNote, MapPin, Users2Icon, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "./ui/scroll-area";

interface AdminLaptopListItemProps {
  laptop: Laptop;
  allStudents: Student[];
  allGroups: Group[];
  allRooms: Room[];
  onEdit: () => void;
  onDelete: () => void;
  onManageAssignments: () => void;
  onSaveNotes: (laptopId: string, notes: string) => void;
}

export function AdminLaptopListItem({
  laptop,
  allStudents,
  allGroups,
  allRooms,
  onEdit,
  onDelete,
  onManageAssignments,
  onSaveNotes,
}: AdminLaptopListItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(laptop.notes || "");

  const assignedStudents = allStudents.filter(s => laptop.studentIds.includes(s.id));
  const room = allRooms.find(r => r.id === laptop.roomId);

  const getStudentGroupName = (student: Student): string => {
    const group = allGroups.find(g => g.id === student.groupId);
    return group ? group.name : "N/A";
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentNotes(e.target.value);
  };

  const handleSaveNotesClick = () => {
    onSaveNotes(laptop.id, currentNotes);
  };


  return (
    <Card className="flex flex-col shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{laptop.login}</CardTitle>
             <Badge variant={room ? "secondary" : "outline"}>
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                {room ? room.name : "Кабинет не найден"}
                {laptop.locationId ? `, Стол: ${laptop.locationId}` : ", Не на столе"}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div>
          <Label htmlFor={`password-${laptop.id}`} className="text-xs text-muted-foreground flex items-center mb-1">
            <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Пароль
          </Label>
          <div className="relative flex items-center">
            <Input
              id={`password-${laptop.id}`}
              type={showPassword ? "text" : "password"}
              value={laptop.password || "N/A"}
              readOnly
              className="pr-10 text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div>
            <Label className="text-xs text-muted-foreground flex items-center mb-1">
                <Users2Icon className="mr-1.5 h-3.5 w-3.5" /> Назначенные учащиеся
            </Label>
            {assignedStudents.length > 0 ? (
                <ScrollArea className="h-[60px] border rounded-md p-2 text-sm">
                    <ul className="space-y-0.5">
                    {assignedStudents.map(student => (
                        <li key={student.id}>
                        {student.name} <span className="text-xs text-muted-foreground">({getStudentGroupName(student)})</span>
                        </li>
                    ))}
                    </ul>
                </ScrollArea>
                ) : (
                <p className="text-sm text-muted-foreground p-2 border rounded-md text-center">Учащиеся не назначены</p>
                )}
        </div>

        <div>
          <Label htmlFor={`notes-${laptop.id}`} className="text-xs text-muted-foreground flex items-center mb-1">
            <StickyNote className="mr-1.5 h-3.5 w-3.5" /> Заметки
          </Label>
          <Textarea
            id={`notes-${laptop.id}`}
            value={currentNotes}
            onChange={handleNotesChange}
            placeholder="Заметки о ноутбуке..."
            className="text-sm min-h-[60px]"
          />
           <Button onClick={handleSaveNotesClick} size="sm" variant="outline" className="mt-1.5 text-xs h-7">
             Сохранить заметки
           </Button>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 mt-auto">
        <div className="flex flex-wrap gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 min-w-[calc(50%-0.25rem)] sm:flex-none">
            <Edit3 className="mr-1.5 h-4 w-4" /> Редакт.
          </Button>
          <Button variant="outline" size="sm" onClick={onManageAssignments} className="flex-1 min-w-[calc(50%-0.25rem)] sm:flex-none">
            <Settings2 className="mr-1.5 h-4 w-4" /> Назначения
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}  className="w-full sm:flex-1 sm:w-auto mt-2 sm:mt-0">
            <Trash2 className="mr-1.5 h-4 w-4" /> Удалить
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
