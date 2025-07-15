import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { AuthUser, Role, UserRecord, UserData } from '../types';
import {
  loadUsersFromStorage,
  saveUsersToStorage,
  parseExcelFile,
  clearUsersFromStorage,
} from '../services/dataService';

interface UserContextType {
  authUser: AuthUser | null;
  users: UserRecord[];
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
  uploadAndAssignUsers: (file: File) => Promise<void>;
  updateUserRecord: (updatedRecord: UserRecord) => void;
  getUserById: (id: string) => UserRecord | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const storedUser = sessionStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const loadedUsers = loadUsersFromStorage();
    setUsers(loadedUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authUser) {
      sessionStorage.setItem('authUser', JSON.stringify(authUser));
    } else {
      sessionStorage.removeItem('authUser');
    }
  }, [authUser]);

  const login = useCallback(async (username: string, password: string): Promise<AuthUser | null> => {
    setError(null);
    if (username === 'SuperAdmin' && password === 'SuperAdmin') {
      const user = { username: 'SuperAdmin', role: Role.SUPER_ADMIN };
      setAuthUser(user);
      return user;
    }
    const volunteerMatch = username.match(/^V(\d+)$/);
    if (volunteerMatch) {
      const volunteerNum = parseInt(volunteerMatch[1], 10);
      if (volunteerNum >= 1 && volunteerNum <= 50 && password === username) {
        const user = { username, role: Role.VOLUNTEER, volunteerId: username };
        setAuthUser(user);
        return user;
      }
    }
    setError('Invalid username or password.');
    return null;
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    // Optional: decide if logout should clear all data
    // setUsers([]);
    // clearUsersFromStorage(); 
  }, []);

  const uploadAndAssignUsers = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const newUsers = await parseExcelFile(file);
      setUsers(newUsers);
      saveUsersToStorage(newUsers);
    } catch (err) {
      console.error(err);
      setError('Failed to process Excel file. Please ensure it is a valid .xlsx file.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRecord = useCallback((updatedRecord: UserRecord) => {
    const updatedUsers: UserRecord[] = users.map(user => 
      user.id === updatedRecord.id ? { ...updatedRecord, status: 'Updated' } : user
    );
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
  }, [users]);
  
  const getUserById = useCallback((id: string) => {
    return users.find(user => user.id === id);
  }, [users]);

  return (
    <UserContext.Provider value={{ authUser, users, loading, error, login, logout, uploadAndAssignUsers, updateUserRecord, getUserById }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
