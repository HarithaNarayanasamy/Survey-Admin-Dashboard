import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import * as XLSX from 'xlsx';
import { User, Genders, Gender } from '../types';

const USERS_PER_VOLUNTEER = 40;
const LOCAL_STORAGE_KEY = 'survey_users_data';

interface UserContextType {
  users: User[];
  loading: boolean;
  loadUsersFromFile: (file: File) => Promise<void>;
  updateUser: (userId: number, updatedData: Partial<Omit<User, 'id' | 'volunteerId'>>) => void;
  resetData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        setUsers(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const loadUsersFromFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      // Helper function to find a value by checking for bilingual keywords in column headers.
      // This makes parsing flexible, e.g., it can find 'Name' in "Name / பெயர்".
      const findValue = (row: any, keywords: string[]): any => {
          const rowKeys = Object.keys(row);
          for (const keyword of keywords) {
              const matchingKey = rowKeys.find(key => key.toLowerCase().includes(keyword.toLowerCase()));
              if (matchingKey && row[matchingKey] !== undefined) {
                  return row[matchingKey];
              }
          }
          return undefined;
      };

      const processedUsers: User[] = json.map((row, index) => {
        const name = findValue(row, ['name', 'பெயர்']) || '';
        const email = findValue(row, ['email', 'மின்னஞ்சல்']) || '';
        const phone = String(findValue(row, ['phone', 'தொலைபேசி']) || '');
        const genderValue = findValue(row, ['gender', 'பாலினம்']);
        const gender = Genders.includes(genderValue) ? genderValue : 'Prefer not to say';
        const city = findValue(row, ['city', 'நகரம்']) || '';
        const country = findValue(row, ['country', 'நாடு']) || '';

        return {
          id: index,
          volunteerId: Math.floor(index / USERS_PER_VOLUNTEER) + 1,
          name,
          email,
          phone,
          gender: gender as Gender,
          city,
          country,
          status: 'Not Updated',
        };
      });

      setUsers(processedUsers);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(processedUsers));

    } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the file. Please ensure it's a valid .xlsx, .xls, or .csv file with the required columns.");
    } finally {
        setLoading(false);
    }
  }, []);

  const updateUser = useCallback((userId: number, updatedData: Partial<Omit<User, 'id' | 'volunteerId'>>) => {
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user =>
        user.id === userId ? { ...user, ...updatedData, status: 'Updated' as const } : user
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUsers));
      return newUsers;
    });
  }, []);

  const resetData = useCallback(() => {
    if (window.confirm("Are you sure you want to reset? This will clear all uploaded data and updates.")) {
      setLoading(true);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUsers([]);
      setLoading(false);
      alert("All data has been cleared.");
    }
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, updateUser, resetData, loadUsersFromFile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};