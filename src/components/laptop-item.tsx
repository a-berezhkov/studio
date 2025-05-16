
"use client";

import type { DragEvent } from "react";
import type { Laptop, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Laptop as LaptopIcon, User, Edit3, Trash2, Eye, Link2, Unlink } from "lucide-react";

interface LaptopItemProps {
  laptop: Laptop;
  assignedStudent?: Student;
  isDraggable?: boolean;
  onDragStart?: (event: DragEvent<HTMLDivElement>, laptopId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewCredentials: () => void;
  onAssignStudent: () => void;
  onUnassignStudent?: () => void; 
  onUnassignLocation?: () => void;
}

export function LaptopItem({
  laptop,
  assignedStudent,
  isDraggable = false,
  onDragStart,
  onEdit,
  onDelete,
  onViewCredentials,
  onAssignStudent,
  onUnassignStudent,
  onUnassignLocation
}: LaptopItemProps) {
  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      onDragStart(event, laptop.id);
    }
  };

  return (
    <Card 
      draggable={isDraggable} 
      onDragStart={handleDragStart} 
      className="mb-4 shadow-md hover:shadow-lg transition-shadow bg-card"
      aria-label={`Laptop: ${laptop.login}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LaptopIcon className="w-6 h-6 text-primary" />
            <CardTitle className="text-lg">{laptop.login}</CardTitle>
          </div>
          {laptop.locationId && onUnassignLocation && (
            <Button variant="ghost" size="icon" onClick={onUnassignLocation} aria-label="Unassign from desk">
              <Unlink className="w-4 h-4" />
            </Button>
          )}
        </div>
        {laptop.locationId && <CardDescription>Desk: {laptop.locationId}</CardDescription>}
      </CardHeader>
      <CardContent>
        {assignedStudent ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
            <User className="w-4 h-4 text-accent-foreground" />
            <span>{assignedStudent.name} ({assignedStudent.groupNumber})</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">No student assigned.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}><Edit3 className="mr-1.5 h-4 w-4" /> Edit</Button>
          <Button variant="outline" size="sm" onClick={onViewCredentials}><Eye className="mr-1.5 h-4 w-4" /> Credentials</Button>
          {laptop.locationId && (
            assignedStudent && onUnassignStudent ? (
              <Button variant="outline" size="sm" onClick={onUnassignStudent}>
                <User className="mr-1.5 h-4 w-4" /> Unassign Student
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onAssignStudent}>
                <User className="mr-1.5 h-4 w-4" /> Assign Student
              </Button>
            )
          )}
          {!laptop.locationId && ( // Only show assign student if not on map for simplicity, or always show if laptop exists.
             <Button variant="outline" size="sm" onClick={onAssignStudent} disabled={!!laptop.locationId}>
              <User className="mr-1.5 h-4 w-4" /> Assign Student
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete}><Trash2 className="mr-1.5 h-4 w-4" /> Delete</Button>
        </div>
      </CardContent>
    </Card>
  );
}
