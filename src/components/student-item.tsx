
"use client";

import type { Student, Laptop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Edit3, Trash2, Laptop as LaptopIcon, Package } from "lucide-react";

interface StudentItemProps {
  student: Student;
  assignedLaptop?: Laptop;
  groupName?: string; // Added groupName
  onEdit: () => void;
  onDelete: () => void;
  isAdminAuthenticated: boolean;
}

export function StudentItem({ student, assignedLaptop, groupName, onEdit, onDelete, isAdminAuthenticated }: StudentItemProps) {
  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow bg-card" aria-label={`Student: ${student.name}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <CardTitle className="text-lg">{student.name}</CardTitle>
        </div>
        {groupName && (
            <CardDescription className="flex items-center text-sm">
                <Package className="w-3.5 h-3.5 mr-1.5 text-muted-foreground"/> Group: {groupName}
            </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {assignedLaptop ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
            <LaptopIcon className="w-4 h-4 text-accent-foreground" />
            <span>Assigned to Laptop: {assignedLaptop.login} (Room ID: {assignedLaptop.roomId}, Desk {assignedLaptop.locationId})</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">Not assigned to any laptop.</p>
        )}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit} disabled={!isAdminAuthenticated}><Edit3 className="mr-1.5 h-4 w-4" /> Edit</Button>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={!isAdminAuthenticated}><Trash2 className="mr-1.5 h-4 w-4" /> Delete</Button>
        </div>
      </CardContent>
    </Card>
  );
}
