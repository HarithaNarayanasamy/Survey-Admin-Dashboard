import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import * as XLSX from 'xlsx';
import { User, Genders, Gender } from '../types';

const USERS_PER_VOLUNTEER = 40;
const LOCAL_STORAGE_KEY = 'survey_app_data';

interface UserContextType {
  users: User[];
  columnHeaders: Record<string, string>;
  loading: boolean;
  loadUsersFromFile: (file: File) => Promise<void>;
  updateUser: (userId: number, updatedData: Partial<Omit<User, 'id' | 'volunteerId'>>) => void;
  resetData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [columnHeaders, setColumnHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUsers(parsedData.users || []);
        setColumnHeaders(parsedData.headers || {});
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
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

      if (json.length === 0) {
        alert("The file is empty or could not be read.");
        setLoading(false);
        return;
      }

      const fileKeys = Object.keys(json[0]);
      const newColumnHeaders: Record<string, string> = {};

      const keywordMap: Record<keyof Omit<User, 'id' | 'volunteerId' | 'status'>, string[]> = {
          name: ['name', 'பெயர்'],
          email: ['email', 'மின்னஞ்சல்'],
          phone: ['phone', 'தொலைபேசி'],
          gender: ['gender', 'பாலினம்'],
          city: ['city', 'நகரம்'],
          country: ['country', 'நாடு'],
      };

      for (const [internalField, keywords] of Object.entries(keywordMap)) {
        const foundKey = fileKeys.find(key => 
            keywords.some(keyword => key.toLowerCase().includes(keyword.toLowerCase()))
        );
        if (foundKey) {
            newColumnHeaders[internalField] = foundKey;
        }
      }
      
      if (!newColumnHeaders.name) {
          alert("Could not find a 'Name' column. Please ensure your file has a column for user names (e.g., 'Name' or 'பெயர்').");
          setLoading(false);
          return;
      }

      const processedUsers: User[] = json.map((row, index) => ({
        id: index,
        volunteerId: Math.floor(index / USERS_PER_VOLUNTEER) + 1,
        name: row[newColumnHeaders.name] || '',
        email: row[newColumnHeaders.email] || '',
        phone: String(row[newColumnHeaders.phone] || ''),
        gender: Genders.includes(row[newColumnHeaders.gender]) ? row[newColumnHeaders.gender] : 'Prefer not to say',
        city: row[newColumnHeaders.city] || '',
        country: row[newColumnHeaders.country] || '',
        status: 'Not Updated',
      }));

      setUsers(processedUsers);
      setColumnHeaders(newColumnHeaders);

      const dataToStore = { users: processedUsers, headers: newColumnHeaders };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));

    } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to process the file. Please ensure it's a valid .xlsx, .xls, or .csv file.");
    } finally {
        setLoading(false);
    }
  }, []);

  const updateUser = useCallback((userId: number, updatedData: Partial<Omit<User, 'id' | 'volunteerId'>>) => {
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user =>
        user.id === userId ? { ...user, ...updatedData, status: 'Updated' as const } : user
      );
      const dataToStore = { users: newUsers, headers: columnHeaders };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
      return newUsers;
    });
  }, [columnHeaders]);

  const resetData = useCallback(() => {
    if (window.confirm("Are you sure you want to reset? This will clear all uploaded data and updates.")) {
      setLoading(true);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUsers([]);
      setColumnHeaders({});
      setLoading(false);
      alert("All data has been cleared.");
    }
  }, []);

  return (
    <UserContext.Provider value={{ users, columnHeaders, loading, updateUser, resetData, loadUsersFromFile }}>
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