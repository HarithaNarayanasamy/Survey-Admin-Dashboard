export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  VOLUNTEER = 'VOLUNTEER',
}

export interface AuthUser {
  username: string;
  role: Role;
  volunteerId?: string; // e.g., 'V1', 'V2'
}

export interface UserData {
  // Dynamic properties from Excel file
  [key: string]: string | number;
}

export interface UserRecord {
  id: string;
  volunteerId: string;
  status: 'Pending' | 'Updated';
  data: UserData;
}
