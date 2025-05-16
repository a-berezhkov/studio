
export interface Group {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  rows: number;
  cols: number;
  corridorsAfterRows?: number[]; // 1-indexed rows after which a corridor exists
  corridorsAfterCols?: number[]; // 1-indexed columns after which a corridor exists
  activeGroupIds?: string[]; // IDs of groups considered active in this room
}

export interface Laptop {
  id: string;
  login: string;
  password?: string;
  locationId: number | null; 
  studentIds: string[]; // Changed from studentId: string | null
  notes?: string;
  roomId: string; 
}

export interface Student {
  id: string;
  name: string;
  groupId: string;
}

export interface Desk {
  id: number;
}
