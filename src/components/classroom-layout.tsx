
"use client";

import type { Laptop, Student, Desk } from "@/lib/types";
import { DeskCell } from "@/components/desk-cell";

interface ClassroomLayoutProps {
  desks: Desk[];
  laptops: Laptop[];
  students: Student[];
  onDropLaptopOnDesk: (deskId: number, laptopId: string) => void;
  onDeskClick: (deskId: number, laptop: Laptop | undefined) => void;
  rows: number;
  cols: number;
}

export function ClassroomLayout({
  desks,
  laptops,
  students,
  onDropLaptopOnDesk,
  onDeskClick,
  rows,
  cols,
}: ClassroomLayoutProps) {
  
  const getLaptopAtDesk = (deskId: number): Laptop | undefined => {
    return laptops.find((laptop) => laptop.locationId === deskId);
  };

  const getStudentForLaptop = (laptop: Laptop | undefined): Student | undefined => {
    if (!laptop || !laptop.studentId) return undefined;
    return students.find((student) => student.id === laptop.studentId);
  };

  return (
    <div className="bg-card p-4 md:p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center text-primary">Classroom Map</h2>
      <div
        className="grid gap-3 md:gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
        aria-label="Classroom Layout Grid"
      >
        {desks.map((desk) => {
          const laptopOnDesk = getLaptopAtDesk(desk.id);
          const studentAssigned = getStudentForLaptop(laptopOnDesk);
          return (
            <DeskCell
              key={desk.id}
              desk={desk}
              laptop={laptopOnDesk}
              student={studentAssigned}
              onDrop={(laptopId) => onDropLaptopOnDesk(desk.id, laptopId)}
              onClick={() => onDeskClick(desk.id, laptopOnDesk)}
            />
          );
        })}
      </div>
    </div>
  );
}
