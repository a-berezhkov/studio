
"use client";

import type { Laptop, Student, Desk, Group } from "@/lib/types";
import { DeskCell } from "@/components/desk-cell";

interface ClassroomLayoutProps {
  desks: Desk[]; 
  laptops: Laptop[];
  allStudents: Student[]; // Changed from students to allStudents for clarity
  groups: Group[]; 
  onDropLaptopOnDesk: (deskId: number, laptopId: string) => void;
  onDeskClick: (deskId: number, laptop: Laptop | undefined) => void;
  rows: number; 
  cols: number; 
  corridorsAfterRows: number[]; 
  corridorsAfterCols: number[];
  isAdminAuthenticated: boolean;
}

const CorridorCell = () => (
  <div 
    className="bg-muted/30 rounded-md aspect-square shadow-inner" 
    aria-hidden="true" 
  />
);

export function ClassroomLayout({
  desks,
  laptops,
  allStudents, // Changed
  groups, 
  onDropLaptopOnDesk,
  onDeskClick,
  rows,
  cols,
  corridorsAfterRows = [],
  corridorsAfterCols = [],
  isAdminAuthenticated,
}: ClassroomLayoutProps) {
  
  const getLaptopAtDesk = (deskId: number): Laptop | undefined => {
    return laptops.find((laptop) => laptop.locationId === deskId);
  };

  const getStudentsForLaptop = (laptop: Laptop | undefined): Student[] => {
    if (!laptop || !laptop.studentIds || laptop.studentIds.length === 0) return [];
    return allStudents.filter((student) => laptop.studentIds.includes(student.id));
  };
  
  const gridCells: JSX.Element[] = [];
  let deskIndex = 0;
  let maxVisualCols = cols; 

  let tempVisualCols = cols;
  for (let c = 0; c < cols -1; c++) { 
      if(corridorsAfterCols.includes(c + 1)) { 
          tempVisualCols++;
      }
  }
  maxVisualCols = tempVisualCols;


  for (let r = 0; r < rows; r++) { 
    const currentRowVisualCells: JSX.Element[] = [];
    for (let c = 0; c < cols; c++) { 
      const currentDesk = desks[deskIndex++];
      if (!currentDesk) continue;

      const laptopOnDesk = getLaptopAtDesk(currentDesk.id);
      const studentsAssigned = getStudentsForLaptop(laptopOnDesk);
      
      currentRowVisualCells.push(
        <DeskCell
          key={`desk-${currentDesk.id}`}
          desk={currentDesk}
          laptop={laptopOnDesk}
          students={studentsAssigned} // Pass array of students
          groups={groups}
          onDrop={(laptopId) => {
            if (isAdminAuthenticated) onDropLaptopOnDesk(currentDesk.id, laptopId);
          }}
          onClick={() => onDeskClick(currentDesk.id, laptopOnDesk)}
          canDrop={isAdminAuthenticated}
        />
      );

      if (corridorsAfterCols.includes(c + 1) && c < cols - 1) {
        currentRowVisualCells.push(<CorridorCell key={`col-corridor-${r}-${c}`} />);
      }
    }
    gridCells.push(...currentRowVisualCells);

    if (corridorsAfterRows.includes(r + 1) && r < rows - 1) {
      for (let cg = 0; cg < maxVisualCols; cg++) {
         gridCells.push(<CorridorCell key={`row-corridor-${r}-${cg}`} />);
      }
    }
  }

  return (
    <div className="bg-card p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Карта класса</h2>
      <div
        className="grid gap-3 md:gap-4"
        style={{
          gridTemplateColumns: `repeat(${maxVisualCols}, minmax(0, 1fr))`,
        }}
        aria-label="Сетка расположения в классе"
      >
        {gridCells}
      </div>
    </div>
  );
}
