
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Dashboard from './components/Dashboard';
import Form from './components/Form';

const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <div className="min-h-screen text-gray-800 dark:text-gray-200">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/form/:userId" element={<Form />} />
          </Routes>
        </div>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
