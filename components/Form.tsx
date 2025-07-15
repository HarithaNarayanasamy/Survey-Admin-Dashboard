import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { User, Gender, Genders } from '../types';
import { BackIcon } from './icons';

const Form: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { users, updateUser, loading } = useUserContext();

    const [formData, setFormData] = useState<Partial<User>>({});
    const [user, setUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && users.length > 0) {
            const id = parseInt(userId || '', 10);
            if (!isNaN(id)) {
                const foundUser = users.find(u => u.id === id);
                if (foundUser) {
                    setUser(foundUser);
                    setFormData(foundUser);
                }
            }
        }
    }, [userId, users, loading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            updateUser(user.id, formData);
            setStatus("Saved!");
            setTimeout(() => setStatus(null), 2000);
        }
    };

    if (loading) {
        return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6">
                <BackIcon className="w-5 h-5 mr-2" />
                Back to Dashboard
            </Link>
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Edit Your Information</h2>
                <p className="mb-6 text-gray-500 dark:text-gray-400">Please review and update your details below.</p>

                {status && <p className="text-green-500 text-sm mb-4">{status}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(formData).map(([key, value]) => (
                            <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {key}
                                </label>
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={value as string}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Form;
