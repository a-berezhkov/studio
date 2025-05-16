
"use client";

import type { DragEvent } from "react";
import type { Laptop, Student, Desk, Group } from "@/lib/types"; 
import { cn } from "@/lib/utils";
import { Laptop as LaptopIcon, User as UserIcon, Users as UsersIcon, Computer, Package } from "lucide-react"; 
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DeskCellProps {
  desk: Desk;
  laptop?: Laptop;
  students?: Student[]; // Changed from student to students array
  groups?: Group[]; 
  onDrop: (laptopId: string) => void;
  onClick: () => void;
  canDrop?: boolean;
}

export function DeskCell({ desk, laptop, students = [], groups = [], onDrop, onClick, canDrop = false }: DeskCellProps) {
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (canDrop) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    } else {
      event.dataTransfer.dropEffect = "none";
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (canDrop) {
      event.preventDefault();
      const laptopId = event.dataTransfer.getData("application/laptop-id");
      if (laptopId) {
        onDrop(laptopId);
      }
    }
  };

  const hasLaptop = !!laptop;
  const hasStudents = students && students.length > 0;

  const tooltipContent = [];
  if (laptop) tooltipContent.push(`Ноутбук: ${laptop.login}`);
  if (hasStudents) {
    tooltipContent.push(`Учащиеся: ${students.map(s => s.name).join(', ')}`);
    if (students.length === 1 && students[0].groupId) {
        const group = groups.find(g => g.id === students[0].groupId);
        if (group) tooltipContent.push(`Группа: ${group.name}`);
    } else if (students.length > 1) {
        // Could list groups if diverse, or primary group
    }
  }


  return (
    <TooltipProvider delayDuration={200}>
      <Card
        className={cn(
          "aspect-square flex flex-col items-center justify-center p-2 transition-all duration-150 ease-in-out transform hover:scale-105 hover:shadow-lg",
          hasLaptop ? "bg-secondary border-primary shadow-primary/20" : "bg-muted/50 hover:bg-accent/30",
          onClick ? "cursor-pointer" : "cursor-default", 
          "border-2"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={onClick}
        aria-label={`Стол ${desk.id}${laptop ? `, занят ноутбуком ${laptop.login}` : ', пустой'}`}
        tabIndex={onClick ? 0 : -1} 
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onClick) onClick(); }}
      >
        <CardContent className="flex flex-col items-center justify-center p-1 w-full h-full">
          <span className="text-xs font-medium text-muted-foreground absolute top-1 right-1.5">{desk.id}</span>
          <div className="flex flex-col items-center justify-center space-y-1 flex-grow">
            {laptop ? (
              <Tooltip>
                <TooltipTrigger>
                  <LaptopIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </TooltipTrigger>
                {tooltipContent.length > 0 && (
                  <TooltipContent>
                    {tooltipContent.map((line, idx) => <p key={idx}>{line}</p>)}
                  </TooltipContent>
                )}
              </Tooltip>
            ) : (
               <Computer className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground opacity-50" />
            )}
            {laptop && hasStudents && (
              <Tooltip>
                <TooltipTrigger>
                   {students.length > 1 ? 
                    <UsersIcon className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" /> : 
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" />
                   }
                </TooltipTrigger>
                 {tooltipContent.length > 0 && (
                  <TooltipContent>
                    {tooltipContent.map((line, idx) => <p key={idx}>{line}</p>)}
                  </TooltipContent>
                )}
              </Tooltip>
            )}
             {laptop && hasStudents && students.length === 1 && students[0].groupId && groups.find(g => g.id === students[0].groupId) && (
               <Tooltip>
                <TooltipTrigger>
                    <Package className="w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                 {tooltipContent.length > 0 && (
                  <TooltipContent>
                    {tooltipContent.map((line, idx) => <p key={idx}>{line}</p>)}
                  </TooltipContent>
                )}
              </Tooltip>
            )}
             {!hasStudents && laptop && ( // Keep consistent spacing if student/group is missing
             <div className="w-4 h-4 md:w-5 md:h-5" /> 
          )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
