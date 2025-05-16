
export interface Room {
  id: string;
  name: string;
  rows: number;
  cols: number;
  corridorsAfterRows?: number[]; // 1-indexed rows after which a corridor exists
  corridorsAfterCols?: number[]; // 1-indexed columns after which a corridor exists
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
