
"use client";

import type { Laptop, Student, Desk } from "@/lib/types";
import { DeskCell } from "@/components/desk-cell";

interface ClassroomLayoutProps {
  desks: Desk[]; // Array of actual desks {id: 1}, {id: 2}, ...
  laptops: Laptop[];
  students: Student[];
  onDropLaptopOnDesk: (deskId: number, laptopId: string) => void;
  onDeskClick: (deskId: number, laptop: Laptop | undefined) => void; // deskId is the actual desk ID
  rows: number;
  cols: number;
  rowGap: number; // Number of empty cells between rows
  colGap: number; // Number of empty cells between columns
}

const CorridorCell = () => (
  <div 
    className="bg-muted/30 rounded-md aspect-square shadow-inner" 
    aria-hidden="true" 
  />
);

export function ClassroomLayout({
  desks, // These are the actual desks, length = rows * cols
  laptops,
  students,
  onDropLaptopOnDesk,
  onDeskClick,
  rows,
  cols,
  rowGap = 0,
  colGap = 0,
}: ClassroomLayoutProps) {
  
  const getLaptopAtDesk = (deskId: number): Laptop | undefined => {
    return laptops.find((laptop) => laptop.locationId === deskId);
  };

  const getStudentForLaptop = (laptop: Laptop | undefined): Student | undefined => {
    if (!laptop || !laptop.studentId) return undefined;
    return students.find((student) => student.id === laptop.studentId);
  };

  const effectiveRowGap = rows > 1 ? rowGap : 0;
  const effectiveColGap = cols > 1 ? colGap : 0;

  const visualRows = rows + Math.max(0, rows - 1) * effectiveRowGap;
  const visualCols = cols + Math.max(0, cols - 1) * effectiveColGap;

  const gridCells = [];
  let deskIndex = 0;

  for (let r = 0; r < rows; r++) {
    // Render a row of desks
    for (let c = 0; c < cols; c++) {
      const currentDesk = desks[deskIndex++];
      if (!currentDesk) continue; // Should not happen if desks array is correct

      const laptopOnDesk = getLaptopAtDesk(currentDesk.id);
      const studentAssigned = getStudentForLaptop(laptopOnDesk);
      
      gridCells.push(
        <DeskCell
          key={`desk-${currentDesk.id}`}
          desk={currentDesk}
          laptop={laptopOnDesk}
          student={studentAssigned}
          onDrop={(laptopId) => onDropLaptopOnDesk(currentDesk.id, laptopId)}
          onClick={() => onDeskClick(currentDesk.id, laptopOnDesk)}
        />
      );

      // Render column gaps after this desk if not the last column
      if (c < cols - 1 && effectiveColGap > 0) {
        for (let g = 0; g < effectiveColGap; g++) {
          gridCells.push(<CorridorCell key={`col-gap-${r}-${c}-${g}`} />);
        }
      }
    }

    // Render row gaps after this row of desks if not the last row
    if (r < rows - 1 && effectiveRowGap > 0) {
      for (let g = 0; g < effectiveRowGap; g++) {
        // This full-width row gap will span `visualCols`
        for (let vc = 0; vc < visualCols; vc++) {
           gridCells.push(<CorridorCell key={`row-gap-block-${r}-${g}-${vc}`} />);
        }
      }
    }
  }


  return (
    <div className="bg-card p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Classroom Map</h2>
      <div
        className="grid gap-3 md:gap-4"
        style={{
          gridTemplateColumns: `repeat(${visualCols}, minmax(0, 1fr))`,
          // gridTemplateRows: `repeat(${visualRows}, auto)`, // Let content define row height, or use fixed height
        }}
        aria-label="Classroom Layout Grid"
      >
        {gridCells}
      </div>
    </div>
  );
}

