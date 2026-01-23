import React from 'react';
import { useGetRevenueStats } from '../../hooks/admin/useRevenue';
import { Loader2, IndianRupee, TrendingUp, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenuePage = () => {
    const { data, isLoading, isError } = useGetRevenueStats();

    if (isLoading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;
    if (isError) return <div className="p-6 text-center text-red-500">Failed to load revenue data.</div>;

    const handleExportCSV = () => {
        if (!data?.monthlyRevenue) return;

        const headers = ["Month", "Revenue"];
        const rows = data.monthlyRevenue.map(item => [
            item.name,
            item.total
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "revenue_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp size={24} className="text-green-600"/>
                        </div>
                        Revenue Analytics
                    </h1>
                    <p className="mt-1 text-slate-500">Monitor your financial growth and track earnings.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center px-4 py-2.5 font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                    <Download size={20} className="mr-2" />
                    Export Report
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-6 transition-all bg-white border shadow-sm border-slate-200 rounded-xl hover:shadow-md">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                            <IndianRupee size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-slate-900">Rs. {data?.totalRevenue?.toLocaleString() || 0}</h3>
                        </div>
                    </div>
                </div>

                 {/* Placeholder Card 1 */}
                 <div className="p-6 transition-all bg-white border shadow-sm border-slate-200 rounded-xl hover:shadow-md">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 text-orange-600 bg-orange-100 rounded-full">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Growth (MoM)</p>
                            <h3 className="text-2xl font-bold text-slate-900">+12.5%</h3>
                        </div>
                    </div>
                </div>

                 {/* Placeholder Card 2 */}
                 <div className="p-6 transition-all bg-white border shadow-sm border-slate-200 rounded-xl hover:shadow-md">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 text-blue-600 bg-blue-100 rounded-full">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Current Month</p>
                            <h3 className="text-2xl font-bold text-slate-900">Rs. {data?.monthlyRevenue?.[data.monthlyRevenue.length - 1]?.total?.toLocaleString() || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Monthly Revenue Overview</h2>
                </div>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.monthlyRevenue || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#64748b', fontSize: 12}}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#64748b', fontSize: 12}}
                                tickFormatter={(value) => `Rs. ${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                }}
                                cursor={{ fill: '#f8fafc' }}
                                formatter={(value) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Bar 
                                dataKey="total" 
                                fill="#4f46e5" 
                                radius={[6, 6, 0, 0]} 
                                barSize={50}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default RevenuePage;
