
export interface Laptop {
  id: string;
  login: string;
  password?: string; // Password might be sensitive, consider how to handle
  locationId: number | null; // Corresponds to Desk ID
  studentId: string | null; // Corresponds to Student ID
}

export interface Student {
  id: string;
  name: string;
  groupNumber: string;
}

export interface Desk {
  id: number;
  // Potentially add row/col for explicit positioning if needed later
}
