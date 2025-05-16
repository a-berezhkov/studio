
"use client";

import type { Student, Laptop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Edit3, Trash2, Laptop as LaptopIcon, Package } from "lucide-react";

interface StudentItemProps {
  student: Student;
  assignedLaptop?: Laptop;
  groupName?: string; 
  onEdit: () => void;
  onDelete: () => void;
  isAdminAuthenticated: boolean;
}

export function StudentItem({ student, assignedLaptop, groupName, onEdit, onDelete, isAdminAuthenticated }: StudentItemProps) {
  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow bg-card" aria-label={`Учащийся: ${student.name}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <CardTitle className="text-lg">{student.name}</CardTitle>
        </div>
        {groupName && (
            <CardDescription className="flex items-center text-sm">
                <Package className="w-3.5 h-3.5 mr-1.5 text-muted-foreground"/> Группа: {groupName}
            </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {assignedLaptop ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
            <LaptopIcon className="w-4 h-4 text-accent-foreground" />
            <span>Назначен на ноутбук: {assignedLaptop.login} (Кабинет: {assignedLaptop.roomId}, Стол {assignedLaptop.locationId})</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">Не назначен ни на один ноутбук.</p>
        )}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={!isAdminAuthenticated}><Edit3 className="mr-1.5 h-4 w-4" /> Редакт.</Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={!isAdminAuthenticated}><Trash2 className="mr-1.5 h-4 w-4" /> Удалить</Button>
        </div>
      </CardContent>
    </Card>
  );
}
