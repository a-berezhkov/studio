
"use client";

import type { DragEvent } from "react";
import type { Laptop, Student, Group } from "@/lib/types"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Laptop as LaptopIcon, User, Users as UsersIcon, Edit3, Trash2, Eye, Unlink, Package, Settings2 } from "lucide-react"; 

interface LaptopItemProps {
  laptop: Laptop;
  assignedStudents?: Student[]; // Changed from assignedStudent
  groups?: Group[]; 
  isDraggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>, laptopId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewCredentials: () => void;
  onManageAssignments: () => void; // Changed from onAssignStudent
  onUnassignAllStudents?: () => void; // Changed from onUnassignStudent
  onUnassignLocation?: () => void;
  isAdminAuthenticated: boolean;
}

export function LaptopItem({
  laptop,
  assignedStudents = [], // Default to empty array
  groups, 
  isDraggable = false,
  onDragStart,
  onEdit,
  onDelete,
  onViewCredentials,
  onManageAssignments, // Changed
  onUnassignAllStudents, // Changed
  onUnassignLocation,
  isAdminAuthenticated,
}: LaptopItemProps) {
  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (onDragStart && isAdminAuthenticated) {
      onDragStart(event, laptop.id);
    } else {
      event.preventDefault();
    }
  };

  const displayStudentNames = () => {
    if (!assignedStudents || assignedStudents.length === 0) {
      return "Учащиеся не назначены.";
    }
    if (assignedStudents.length === 1) {
      const student = assignedStudents[0];
      const groupName = student.groupId && groups ? groups.find(g => g.id === student.groupId)?.name : '';
      return `${student.name}${groupName ? ` (Группа: ${groupName})` : ''}`;
    }
    return `Назначено: ${assignedStudents.length} уч.`;
  };


  return (
    <Card 
      draggable={isDraggable && isAdminAuthenticated} 
      onDragStart={handleDragStart} 
      className="mb-4 shadow-md hover:shadow-lg transition-shadow bg-card"
      aria-label={`Ноутбук: ${laptop.login}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LaptopIcon className="w-6 h-6 text-primary" />
            <CardTitle className="text-lg">{laptop.login}</CardTitle>
          </div>
          {laptop.locationId && onUnassignLocation && (
            <Button variant="ghost" size="icon" onClick={onUnassignLocation} aria-label="Снять со стола" disabled={!isAdminAuthenticated}>
              <Unlink className="w-4 h-4" />
            </Button>
          )}
        </div>
        {laptop.locationId && <CardDescription>Стол: {laptop.locationId}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-2">
                {assignedStudents.length > 1 ? <UsersIcon className="w-4 h-4 text-accent-foreground" /> : assignedStudents.length === 1 ? <User className="w-4 h-4 text-accent-foreground" /> : <User className="w-4 h-4 text-muted-foreground opacity-50"/>}
                <span>{displayStudentNames()}</span>
            </div>
            {assignedStudents.length > 1 && (
                 <ul className="list-disc pl-5 mt-1 text-xs">
                    {assignedStudents.map(student => {
                        const groupName = student.groupId && groups ? groups.find(g => g.id === student.groupId)?.name : '';
                        return <li key={student.id}>{student.name}{groupName ? ` (${groupName})` : ''}</li>
                    })}
                 </ul>
            )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={!isAdminAuthenticated}><Edit3 className="mr-1.5 h-4 w-4" /> Редакт.</Button>
          <Button variant="outline" size="sm" onClick={onViewCredentials}><Eye className="mr-1.5 h-4 w-4" /> Учетные данные</Button>
         
          <Button variant="outline" size="sm" onClick={onManageAssignments} disabled={!isAdminAuthenticated}>
            <Settings2 className="mr-1.5 h-4 w-4" /> Управлять назначениями
          </Button>

          {assignedStudents && assignedStudents.length > 0 && onUnassignAllStudents && (
             <Button variant="outline" size="sm" onClick={onUnassignAllStudents} disabled={!isAdminAuthenticated}>
                <User className="mr-1.5 h-4 w-4" /> Снять все назначения
              </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={!isAdminAuthenticated}><Trash2 className="mr-1.5 h-4 w-4" /> Удалить</Button>
        </div>
      </CardContent>
    </Card>
  );
}
