
"use client";

import type { DragEvent } from "react";
import type { Laptop, Student, Desk } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Laptop as LaptopIcon, User as UserIcon, Computer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DeskCellProps {
  desk: Desk;
  laptop?: Laptop;
  student?: Student;
  onDrop: (laptopId: string) => void;
  onClick: () => void;
  canDrop?: boolean; // New prop to control drop behavior
}

export function DeskCell({ desk, laptop, student, onDrop, onClick, canDrop = false }: DeskCellProps) {
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

  return (
    <TooltipProvider delayDuration={200}>
      <Card
        className={cn(
          "aspect-square flex flex-col items-center justify-center p-2 transition-all duration-150 ease-in-out transform hover:scale-105 hover:shadow-lg",
          hasLaptop ? "bg-secondary border-primary shadow-primary/20" : "bg-muted/50 hover:bg-accent/30",
          onClick ? "cursor-pointer" : "cursor-default", // Only show pointer if onClick is available
          "border-2"
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={onClick}
        aria-label={`Desk ${desk.id}${laptop ? `, occupied by laptop ${laptop.login}` : ', empty'}`}
        tabIndex={onClick ? 0 : -1} // Make it focusable only if clickable
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
                <TooltipContent>
                  <p>Laptop: {laptop.login}</p>
                  {student && <p>Student: {student.name} ({student.groupNumber})</p>}
                </TooltipContent>
              </Tooltip>
            ) : (
               <Computer className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground opacity-50" />
            )}
            {laptop && student && (
              <Tooltip>
                <TooltipTrigger>
                   <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-accent-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Student: {student.name}</p>
                  <p>Group: {student.groupNumber}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {laptop && !student && (
             <div className="w-4 h-4 md:w-5 md:h-5" /> 
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

    