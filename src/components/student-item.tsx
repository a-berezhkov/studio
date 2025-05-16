
"use client";

import type { Student, Laptop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Edit3, Trash2, Laptop as LaptopIcon, Package, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StudentItemProps {
  student: Student;
  assignedLaptops?: Laptop[]; // Changed from assignedLaptop
  groupName?: string; 
  onEdit: () => void;
  onDelete: () => void;
  isAdminAuthenticated: boolean;
}

export function StudentItem({ student, assignedLaptops = [], groupName, onEdit, onDelete, isAdminAuthenticated }: StudentItemProps) {
  
  const assignedLaptopsText = () => {
    if (assignedLaptops.length === 0) {
      return "Не назначен ни на один ноутбук.";
    }
    if (assignedLaptops.length === 1) {
      const lap = assignedLaptops[0];
      return `Назначен: ${lap.login} (Каб: ${lap.roomId}, Стол: ${lap.locationId || 'не на столе'})`;
    }
    return `Назначен на ${assignedLaptops.length} ноутбук(а/ов).`;
  };
  
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
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
          {assignedLaptops.length > 0 ? <LaptopIcon className="w-4 h-4 text-accent-foreground" /> : <Info className="w-4 h-4 text-muted-foreground"/>}
          <span>{assignedLaptopsText()}</span>
          {assignedLaptops.length > 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">Назначенные ноутбуки:</p>
                  <ul className="list-disc pl-4 text-xs">
                    {assignedLaptops.map(lap => (
                      <li key={lap.id}>{lap.login} (Каб: {lap.roomId}, Стол: {lap.locationId || 'не на столе'})</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={!isAdminAuthenticated}><Edit3 className="mr-1.5 h-4 w-4" /> Редакт.</Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={!isAdminAuthenticated}><Trash2 className="mr-1.5 h-4 w-4" /> Удалить</Button>
        </div>
      </CardContent>
    </Card>
  );
}
