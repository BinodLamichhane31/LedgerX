import React from 'react';
import { useGetRevenueStats } from '../../hooks/admin/useRevenue';
import { Loader2, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenuePage = () => {
    const { data, isLoading, isError } = useGetRevenueStats();

    if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary-600"/></div>;
    if (isError) return <div className="text-center text-red-500">Failed to load revenue data.</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Revenue Analytics</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <IndianRupee size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900">₹{data?.totalRevenue || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Monthly Revenue</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.monthlyRevenue || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default RevenuePage;
