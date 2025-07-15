import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserForm from './components/UserForm';

const ProtectedRoute: React.FC = () => {
  const { authUser, loading } = useUser();
  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }
  return authUser ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/form/:id" element={<UserForm />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </UserProvider>
  );
};

export default App;
