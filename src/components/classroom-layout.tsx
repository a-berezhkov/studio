
"use client";

import type { Laptop, Student, Desk } from "@/lib/types";
import { DeskCell } from "@/components/desk-cell";

interface ClassroomLayoutProps {
  desks: Desk[]; 
  laptops: Laptop[];
  students: Student[];
  onDropLaptopOnDesk: (deskId: number, laptopId: string) => void;
  onDeskClick: (deskId: number, laptop: Laptop | undefined) => void;
  rows: number; // Number of actual desk rows
  cols: number; // Number of actual desk columns
  corridorsAfterRows: number[]; // 1-indexed array of row numbers after which a corridor appears
  corridorsAfterCols: number[]; // 1-indexed array of col numbers after which a corridor appears
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
  students,
  onDropLaptopOnDesk,
  onDeskClick,
  rows,
  cols,
  corridorsAfterRows = [],
  corridorsAfterCols = [],
}: ClassroomLayoutProps) {
  
  const getLaptopAtDesk = (deskId: number): Laptop | undefined => {
    return laptops.find((laptop) => laptop.locationId === deskId);
  };

  const getStudentForLaptop = (laptop: Laptop | undefined): Student | undefined => {
    if (!laptop || !laptop.studentId) return undefined;
    return students.find((student) => student.id === laptop.studentId);
  };

  const gridCells: JSX.Element[] = [];
  let deskIndex = 0;
  let maxVisualCols = cols; // Start with base columns

  // Pre-calculate maxVisualCols for the grid-template-columns
  // This considers the number of actual columns plus any specified column corridors
  let tempVisualCols = cols;
  for (let c = 0; c < cols -1; c++) { // Iterate up to cols-1 because corridor is *after* a col
      if(corridorsAfterCols.includes(c + 1)) { // c+1 is 1-indexed column
          tempVisualCols++;
      }
  }
  maxVisualCols = tempVisualCols;


  for (let r = 0; r < rows; r++) { // Iterate 0-indexed actual desk rows
    const currentRowVisualCells: JSX.Element[] = [];
    for (let c = 0; c < cols; c++) { // Iterate 0-indexed actual desk columns
      const currentDesk = desks[deskIndex++];
      if (!currentDesk) continue;

      const laptopOnDesk = getLaptopAtDesk(currentDesk.id);
      const studentAssigned = getStudentForLaptop(laptopOnDesk);
      
      currentRowVisualCells.push(
        <DeskCell
          key={`desk-${currentDesk.id}`}
          desk={currentDesk}
          laptop={laptopOnDesk}
          student={studentAssigned}
          onDrop={(laptopId) => onDropLaptopOnDesk(currentDesk.id, laptopId)}
          onClick={() => onDeskClick(currentDesk.id, laptopOnDesk)}
        />
      );

      // Add a column corridor *after* the current column 'c' (1-indexed c+1)
      // if it's specified and not after the very last column
      if (corridorsAfterCols.includes(c + 1) && c < cols - 1) {
        currentRowVisualCells.push(<CorridorCell key={`col-corridor-${r}-${c}`} />);
      }
    }
    gridCells.push(...currentRowVisualCells);

    // Add a row corridor *after* the current row 'r' (1-indexed r+1)
    // if it's specified and not after the very last row
    if (corridorsAfterRows.includes(r + 1) && r < rows - 1) {
      // The row corridor should span the full visual width determined by maxVisualCols
      for (let cg = 0; cg < maxVisualCols; cg++) {
         gridCells.push(<CorridorCell key={`row-corridor-${r}-${cg}`} />);
      }
    }
  }

  return (
    <div className="bg-card p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Classroom Map</h2>
      <div
        className="grid gap-3 md:gap-4"
        style={{
          gridTemplateColumns: `repeat(${maxVisualCols}, minmax(0, 1fr))`,
        }}
        aria-label="Classroom Layout Grid"
      >
        {gridCells}
      </div>
    </div>
  );
}
