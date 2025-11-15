import React, { useState, useMemo } from 'react';
import { User } from '../../../types';

const UserManagementTab: React.FC<{ allUsers: User[] }> = ({ allUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return allUsers;
        return allUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.businessEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, searchTerm]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-brand-border">
                <h2 className="text-xl font-bold">User Management</h2>
                <p className="text-sm text-gray-500">{allUsers.length} total users</p>
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full mt-4 p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                />
            </div>
            <div className="flex-grow overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-brand-card-light sticky top-0">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Name</th>
                            <th className="px-6 py-3 font-semibold">Email</th>
                            <th className="px-6 py-3 font-semibold">Persona</th>
                            <th className="px-6 py-3 font-semibold">Plan</th>
                            <th className="px-6 py-3 font-semibold">Enterprise</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                    <span className="font-medium">{user.name}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.businessEmail}</td>
                                <td className="px-6 py-4">{user.persona}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        user.subscriptionPlan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                                        user.subscriptionPlan === 'Pro' ? 'bg-blue-100 text-blue-800' :
                                        user.subscriptionPlan === 'Basic' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.subscriptionPlan}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.company}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementTab;
