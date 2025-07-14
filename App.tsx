
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Dashboard from './components/Dashboard';
import Form from './components/Form';

const App: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('survey_theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('survey_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <UserProvider>
      <HashRouter>
        <div className="min-h-screen text-gray-800 dark:text-gray-200">
          <Routes>
            <Route path="/" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/form/:userId" element={<Form />} />
          </Routes>
        </div>
      </HashRouter>
    </UserProvider>
  );
};

export default App;