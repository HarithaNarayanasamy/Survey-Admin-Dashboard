import { UserRecord, UserData } from '../types';

// Let TypeScript know that XLSX is available on the window object from the CDN script
declare const XLSX: any;

const USERS_STORAGE_KEY = 'userData';
const TOTAL_VOLUNTEERS = 50;

// --- LocalStorage Operations ---

export const loadUsersFromStorage = (): UserRecord[] => {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load users from storage", error);
    return [];
  }
};

export const saveUsersToStorage = (users: UserRecord[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to storage", error);
  }
};

export const clearUsersFromStorage = (): void => {
  localStorage.removeItem(USERS_STORAGE_KEY);
}

// --- Excel File Operations ---

export const parseExcelFile = (file: File): Promise<UserRecord[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // FIX: Add `defval: ''` to preserve empty cells/columns
                const json: UserData[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                const newRecords: UserRecord[] = json.map((row, index) => ({
                    id: `${Date.now()}-${index}`, // Simple unique ID
                    volunteerId: `V${(index % TOTAL_VOLUNTEERS) + 1}`,
                    status: 'Pending',
                    data: row,
                }));

                resolve(newRecords);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

export const exportUsersToExcel = (users: UserRecord[]): void => {
  if (users.length === 0) {
    alert("No data to export.");
    return;
  }
  
  // Flatten the data for export
  const flattenedData = users.map(user => ({
    volunteerId: user.volunteerId,
    status: user.status,
    ...user.data,
    // We don't export the internal ID
  }));

  const worksheet = XLSX.utils.json_to_sheet(flattenedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'UserData');

  // Generate a filename and trigger download
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  XLSX.writeFile(workbook, `Exported_User_Data_${timestamp}.xlsx`);
};