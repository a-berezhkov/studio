
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
  students?: Student[]; 
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

  const renderTooltipContent = () => {
    const contentLines: React.ReactNode[] = [];

    if (laptop) {
      contentLines.push(<p key="laptop-info" className="font-semibold">Ноутбук: {laptop.login}</p>);
    }

    if (hasStudents) {
      contentLines.push(<p key="students-header" className="font-semibold mt-1.5">Учащиеся:</p>);
      students.forEach(student => {
        const group = groups.find(g => g.id === student.groupId);
        contentLines.push(
          <p key={student.id} className="ml-2 text-sm">
            • {student.name} <span className="text-xs text-muted-foreground">({group ? group.name : 'Группа не указана'})</span>
          </p>
        );
      });
    }

    if (contentLines.length === 0) {
      return <p className="text-sm">Стол свободен</p>;
    }
    return <div className="space-y-0.5">{contentLines}</div>;
  };


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
                <TooltipTrigger asChild>
                   {/* Using asChild on TooltipTrigger and wrapping the icon in a span or div can help if direct icon triggering is problematic */}
                  <span><LaptopIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" /></span>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="bg-popover text-popover-foreground shadow-md rounded-md p-2 max-w-xs">
                  {renderTooltipContent()}
                </TooltipContent>
              </Tooltip>
            ) : (
               <Computer className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground opacity-50" />
            )}
            {laptop && hasStudents && (
              <Tooltip>
                <TooltipTrigger asChild>
                   <span>
                   {students.length > 1 ? 
                    <UsersIcon className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" /> : 
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" />
                   }
                   </span>
                </TooltipTrigger>
                 <TooltipContent side="top" align="center" className="bg-popover text-popover-foreground shadow-md rounded-md p-2 max-w-xs">
                  {renderTooltipContent()}
                </TooltipContent>
              </Tooltip>
            )}
             {laptop && hasStudents && students.length === 1 && students[0].groupId && groups.find(g => g.id === students[0].groupId) && (
               <Tooltip>
                <TooltipTrigger asChild>
                    <span><Package className="w-3 h-3 md:w-3.5 md:h-3.5 text-muted-foreground" /></span>
                </TooltipTrigger>
                 <TooltipContent side="top" align="center" className="bg-popover text-popover-foreground shadow-md rounded-md p-2 max-w-xs">
                  {renderTooltipContent()}
                </TooltipContent>
              </Tooltip>
            )}
             {!hasStudents && laptop && ( 
             <div className="w-4 h-4 md:w-5 md:h-5" /> 
          )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

