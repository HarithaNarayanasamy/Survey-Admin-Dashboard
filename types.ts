
export type UserStatus = 'Updated' | 'Not Updated';

// Define the union type explicitly for type safety
export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

// Define a constant array for use in UI elements like dropdowns
export const Genders: Gender[] = ['Male', 'Female', 'Other', 'Prefer not to say'];

export interface User {
  id: number;
  volunteerId: number;
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  city: string;
  country: string;
  status: UserStatus;
}
