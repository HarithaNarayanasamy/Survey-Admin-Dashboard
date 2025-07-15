import React, { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { UserRecord, UserData } from '../types';
import { CheckCircleIcon } from './icons';

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getUserById, updateUserRecord, loading } = useUser();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [formData, setFormData] = useState<UserData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      const foundUser = getUserById(id);
      if (foundUser) {
        setUser(foundUser);
        setFormData(foundUser.data);
      }
    }
  }, [id, getUserById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (user) {
      setIsSaving(true);
      const updatedUser = { ...user, data: formData };
      updateUserRecord(updatedUser);
      setTimeout(() => {
        setIsSaving(false);
        setIsSaved(true);
        // Reset saved message after a few seconds
        setTimeout(() => setIsSaved(false), 3000);
      }, 1000); // Simulate save delay
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading form...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen text-red-500">User not found. The link may be invalid.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">Update Your Information</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Please review and edit your details below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {key}
                </label>
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-50 dark:bg-gray-700"
                />
              </div>
            ))}
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving || isSaved}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 dark:disabled:bg-primary-800 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : (isSaved ? 'Saved Successfully!' : 'Save Changes')}
            </button>
          </div>
        </form>

        {isSaved && (
          <div className="mt-6 flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircleIcon className="w-6 h-6 mr-2" />
            <p>Your information has been updated.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserForm;
