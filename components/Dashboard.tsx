import React, { useState, useMemo } from 'react';
import { useUserContext } from '../context/UserContext';
import { exportToXlsx } from '../services/dataService';
import { User } from '../types';
import { CopyIcon, CheckIcon, ExportIcon, ResetIcon, UploadIcon, SunIcon, MoonIcon } from './icons';

const USERS_PER_VOLUNTEER = 40;

interface DashboardProps {
  theme: string;
  toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ theme, toggleTheme }) => {
  const { users, loading, resetData, loadUsersFromFile, columnHeaders } = useUserContext();
  const [selectedVolunteer, setSelectedVolunteer] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<number | null>(null);

  const totalVolunteers = useMemo(() => {
    return users.length > 0 ? Math.ceil(users.length / USERS_PER_VOLUNTEER) : 0;
  }, [users]);
  
  const displayedUsers = useMemo(() => {
    const startIndex = (selectedVolunteer - 1) * USERS_PER_VOLUNTEER;
    const endIndex = startIndex + USERS_PER_VOLUNTEER;
    return users.slice(startIndex, endIndex);
  }, [selectedVolunteer, users]);

  const handleCopyLink = (user: User) => {
    const uniqueUrl = `${window.location.origin}${window.location.pathname}#/form/${user.id}`;
    const message = `Hi ${user.name}, please update your info here: ${uniqueUrl}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;

    navigator.clipboard.writeText(whatsappLink).then(() => {
      setCopiedLink(user.id);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  const handleExport = () => {
    const updatedUsers = users.filter(u => u.status === 'Updated');
    if (updatedUsers.length > 0) {
      exportToXlsx(updatedUsers, 'updated_user_records.xlsx');
    } else {
      alert("No updated records to export.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadUsersFromFile(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Processing...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Survey Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
          {users.length > 0 && (
            <>
              <button onClick={handleExport} className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition-colors duration-200">
                <ExportIcon className="w-5 h-5 mr-2" />
                Export Updated
              </button>
              <button onClick={resetData} className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors duration-200">
                <ResetIcon className="w-5 h-5 mr-2" />
                Reset Data
              </button>
            </>
          )}
        </div>
      </header>

      {users.length === 0 ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center p-8 md:p-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Upload Your User Data</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload an .xlsx, .xls, or .csv file to begin.</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Columns can have English/Tamil headers.</p>
                <div className="mt-6">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <UploadIcon className="w-5 h-5 mr-2"/>
                    Select File
                </label>
                </div>
            </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label htmlFor="volunteer-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Volunteer:</label>
            <select
              id="volunteer-select"
              value={selectedVolunteer}
              onChange={(e) => setSelectedVolunteer(Number(e.target.value))}
              className="block w-full md:w-1/2 lg:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            >
              {Array.from({ length: totalVolunteers }, (_, i) => i + 1).map(v => (
                <option key={v} value={v}>Volunteer {v}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID / ஐடி</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{columnHeaders.name || 'Name'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status / நிலை</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action / செயல்</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {displayedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.status === 'Updated' ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Updated</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">Not Updated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button onClick={() => handleCopyLink(user)} className="flex items-center justify-center w-full text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                        {copiedLink === user.id ? (
                          <>
                            <CheckIcon className="w-5 h-5 mr-1 text-green-500" /> Copied!
                          </>
                        ) : (
                          <>
                            <CopyIcon className="w-5 h-5 mr-1" /> Copy Link
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;