
export interface Room {
  id: string;
  name: string;
  rows: number;
  cols: number;
  rowGap?: number; // Optional: number of empty cells between rows
  colGap?: number; // Optional: number of empty cells between columns
}

export interface Laptop {
  id: string;
  login: string;
  password?: string;
  locationId: number | null; 
  studentId: string | null; 
  notes?: string;
  roomId: string; // Added roomId
}

export interface Student {
  id: string;
  name: string;
  groupNumber: string;
  roomId: string; // Added roomId
}

export interface Desk {
  id: number;
}

