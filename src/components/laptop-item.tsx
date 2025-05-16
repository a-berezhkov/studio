
"use client";

import type { DragEvent } from "react";
import type { Laptop, Student, Group } from "@/lib/types"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Laptop as LaptopIcon, User, Edit3, Trash2, Eye, Link2, Unlink, Package } from "lucide-react"; 

interface LaptopItemProps {
  laptop: Laptop;
  assignedStudent?: Student;
  groups?: Group[]; 
  isDraggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>, laptopId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewCredentials: () => void;
  onAssignStudent: () => void;
  onUnassignStudent?: () => void; 
  onUnassignLocation?: () => void;
  isAdminAuthenticated: boolean;
}

export function LaptopItem({
  laptop,
  assignedStudent,
  groups, 
  isDraggable = false,
  onDragStart,
  onEdit,
  onDelete,
  onViewCredentials,
  onAssignStudent,
  onUnassignStudent,
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

  const studentGroup = assignedStudent && groups ? groups.find(g => g.id === assignedStudent.groupId) : undefined;

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
        {assignedStudent ? (
          <div className="space-y-1 text-sm text-muted-foreground mb-3">
            <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-accent-foreground" />
                <span>{assignedStudent.name}</span>
            </div>
            {studentGroup && (
                <div className="flex items-center space-x-2 pl-1">
                    <Package className="w-3.5 h-3.5 text-muted-foreground"/>
                    <span>Группа: {studentGroup.name}</span>
                </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">Учащийся не назначен.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={!isAdminAuthenticated}><Edit3 className="mr-1.5 h-4 w-4" /> Редакт.</Button>
          <Button variant="outline" size="sm" onClick={onViewCredentials}><Eye className="mr-1.5 h-4 w-4" /> Учетные данные</Button>
          {laptop.locationId && ( 
            assignedStudent && onUnassignStudent ? (
              <Button variant="outline" size="sm" onClick={onUnassignStudent} disabled={!isAdminAuthenticated}>
                <User className="mr-1.5 h-4 w-4" /> Снять назначение
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onAssignStudent} disabled={!isAdminAuthenticated}>
                <User className="mr-1.5 h-4 w-4" /> Назначить учащегося
              </Button>
            )
          )}
          {!laptop.locationId && ( 
             <Button variant="outline" size="sm" onClick={onAssignStudent} disabled={!isAdminAuthenticated}>
              <User className="mr-1.5 h-4 w-4" /> Назначить учащегося
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={!isAdminAuthenticated}><Trash2 className="mr-1.5 h-4 w-4" /> Удалить</Button>
        </div>
      </CardContent>
    </Card>
  );
}
