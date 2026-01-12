import React from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, LayoutDashboard, Component, Settings } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import { useGetAllUsers, useGetUserGrowthStats } from '../../hooks/admin/useManageUser';
import { Link } from 'react-router-dom';
import UserGrowthChart from '../../components/dashboard/UserGrowthChart';
import RecentActivity from '../../components/dashboard/RecentActivity';

const AdminDashboard = () => {
    // We can use the existing hook to get user count from pagination/metadata if available, 
    // or just list length for now.Ideally we'd have a specific stats endpoint.
    const { data: userData, isLoading: isLoadingUsers } = useGetAllUsers();
    const { data: userGrowthData, isLoading: isLoadingGrowth } = useGetUserGrowthStats();
    
    // Placeholder values since we might not have a dedicated stats endpoint yet
    const systemHealth = "Operational"; 
    const totalUsers = userData?.pagination?.totalUsers || userData?.data?.length || 0;

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto space-y-8">
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div variants={itemVariants} className="items-start justify-between md:flex">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
                            <p className="mt-1 text-slate-500">System-wide performance and management.</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                           <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full ring-1 ring-inset ring-emerald-600/20">
                             System Status: {systemHealth}
                           </span>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 mt-8 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard icon={Users} title="Total Users" value={totalUsers} isLoading={isLoadingUsers} />
                        <StatCard icon={FileText} title="System Logs" value="View Logs" isLoading={false} />
                        {/* Placeholders for future stats */}
                        <StatCard icon={Component} title="Active Modules" value={4} isLoading={false} />
                         <StatCard icon={Settings} title="Version" value="v1.0.0" isLoading={false} />
                         <StatCard icon={Settings} title="Version" value="v1.0.0" isLoading={false} />
                    </motion.div>

                    {/* Charts and Activity Grid */}
                    <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                             <UserGrowthChart data={userGrowthData?.data} isLoading={isLoadingGrowth} />
                        </div>
                        <div>
                             <RecentActivity />
                        </div>
                    </div>

                    <motion.div variants={itemVariants} className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-2">
                        {/* Quick Actions / Navigation Card */}
                        <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-2xl">
                             <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
                             <p className="text-sm text-slate-500 mb-6">Manage the platform efficiently.</p>
                             
                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Link to="/admin/users" className="flex items-center p-4 transition-all border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-indigo-200 group">
                                    <div className="p-3 mr-4 transition-colors rounded-lg bg-indigo-50 group-hover:bg-indigo-100">
                                        <Users className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">User Management</h3>
                                        <p className="text-sm text-slate-500">View and manage users</p>
                                    </div>
                                </Link>

                                <Link to="/admin/system-logs" className="flex items-center p-4 transition-all border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-indigo-200 group">
                                    <div className="p-3 mr-4 transition-colors rounded-lg bg-indigo-50 group-hover:bg-indigo-100">
                                        <FileText className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">System Logs</h3>
                                        <p className="text-sm text-slate-500">Monitor system activity</p>
                                    </div>
                                </Link>
                             </div>
                        </div>

                         {/* System Info Card */}
                         <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-2xl">
                             <h2 className="text-lg font-semibold text-slate-800">System Information</h2>
                             <p className="text-sm text-slate-500 mb-6">Current deployment details.</p>
                             
                             <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-600">Environment</span>
                                    <span className="font-medium text-slate-900">Production</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-600">Last Deployment</span>
                                    <span className="font-medium text-slate-900">Jan 11, 2026</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-600">Database Status</span>
                                    <span className="font-medium text-emerald-600">Connected</span>
                                </div>
                             </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;