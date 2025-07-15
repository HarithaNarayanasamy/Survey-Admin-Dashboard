import React, { useState, useMemo, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Role, UserRecord } from '../types';
import { exportUsersToExcel } from '../services/dataService';
import { UploadIcon, DownloadIcon, CopyIcon, LogoutIcon, CheckCircleIcon, PendingIcon } from './icons';

const Dashboard: React.FC = () => {
  const { authUser, users, loading, uploadAndAssignUsers, logout, error } = useUser();
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('V1');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAndAssignUsers(file);
    }
  };
  
  const handleCopyLink = (userId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/form/${userId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredUsers = useMemo(() => {
    if (!authUser) return [];
    if (authUser.role === Role.SUPER_ADMIN) {
      return users.filter(u => u.volunteerId === selectedVolunteer);
    }
    if (authUser.role === Role.VOLUNTEER) {
      return users.filter(u => u.volunteerId === authUser.volunteerId);
    }
    return [];
  }, [authUser, users, selectedVolunteer]);

  const tableHeaders = useMemo(() => {
    if (users.length > 0) {
      return Object.keys(users[0].data);
    }
    return [];
  }, [users]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {authUser?.role === Role.SUPER_ADMIN ? 'Super Admin' : 'Volunteer'} Dashboard
          </h1>
          <div className="flex items-center space-x-4">
             <span className="text-gray-600 dark:text-gray-300">Welcome, {authUser?.username}</span>
             <button onClick={handleLogout} className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400">
                <LogoutIcon className="w-5 h-5" />
                <span>Logout</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {authUser?.role === Role.SUPER_ADMIN && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" ref={fileInputRef} />
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <UploadIcon className="w-5 h-5 mr-2" />
                Upload Excel
              </button>
              <button onClick={() => exportUsersToExcel(users)} className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <DownloadIcon className="w-5 h-5 mr-2" />
                Export All to Excel
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="volunteer-select" className="text-sm font-medium">View as Volunteer:</label>
              <select
                id="volunteer-select"
                value={selectedVolunteer}
                onChange={e => setSelectedVolunteer(e.target.value)}
                className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50 bg-white dark:bg-gray-700"
              >
                {Array.from({ length: 50 }, (_, i) => `V${i + 1}`).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
             <button onClick={() => navigate('/login')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
               Open Volunteer Login
             </button>
          </div>
        )}
        
        {loading && <p className="text-center">Loading data...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  {tableHeaders.map(header => (
                    <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                  ))}
                  {authUser?.role === Role.VOLUNTEER && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length > 0 ? filteredUsers.map((user: UserRecord) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'Updated' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {user.status === 'Updated' ? <CheckCircleIcon className="w-4 h-4 mr-1"/> : <PendingIcon className="w-4 h-4 mr-1"/>}
                        {user.status}
                      </span>
                    </td>
                    {tableHeaders.map(header => (
                      <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.data[header]}</td>
                    ))}
                    {authUser?.role === Role.VOLUNTEER && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleCopyLink(user.id)} className="inline-flex items-center text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                          <CopyIcon className="w-4 h-4 mr-1" />
                          {copiedId === user.id ? 'Copied!' : 'Copy Link'}
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={tableHeaders.length + 2} className="text-center py-10 text-gray-500">
                            {users.length === 0 ? "No data found. Please upload an Excel file." : "No records assigned to this volunteer."}
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
