import React, { useState } from 'react';
import { useGetSubscriptions, useUpdateSubscription } from '../../hooks/admin/useSubscription';
import { Loader2, Edit2, X, Check } from 'lucide-react';

const SubscriptionManagementPage = () => {
    const { data: usersResponse, isLoading, isError } = useGetSubscriptions();
    const { mutate: updateSubscription, isPending: isUpdating } = useUpdateSubscription();
    
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ plan: '', status: '' });

    if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600"/></div>;
    if (isError) return <div className="text-center text-red-500">Failed to load subscriptions.</div>;

    const users = usersResponse?.data || [];

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            plan: user.subscription?.plan || 'FREE',
            status: user.subscription?.status || 'ACTIVE'
        });
    };

    const handleSave = () => {
        if (!editingUser) return;
        updateSubscription({
            userId: editingUser._id,
            data: formData
        }, {
            onSuccess: () => {
                setEditingUser(null);
            }
        });
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Subscription Management</h1>

            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Plan</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Expires At</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.fname} {user.lname}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                        user.subscription?.plan === 'PRO' ? 'bg-purple-100 text-purple-800' : 
                                        user.subscription?.plan === 'BASIC' ? 'bg-blue-100 text-blue-800' : 
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.subscription?.plan || 'FREE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                        user.subscription?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {user.subscription?.status || 'INACTIVE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                    {user.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                    <button onClick={() => handleEditClick(user)} className="text-indigo-600 hover:text-indigo-900">
                                        <Edit2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Edit Subscription</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">User</label>
                                <p className="mt-1 text-sm text-gray-900">{editingUser.fname} {editingUser.lname}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Plan</label>
                                <select 
                                    value={formData.plan}
                                    onChange={(e) => setFormData({...formData, plan: e.target.value})}
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="FREE">FREE</option>
                                    <option value="BASIC">BASIC</option>
                                    <option value="PRO">PRO</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="INACTIVE">INACTIVE</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-70"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Check className="w-4 h-4 mr-2"/>}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagementPage;
