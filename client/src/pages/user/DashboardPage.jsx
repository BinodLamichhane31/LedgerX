// src/pages/user/DashboardPage.jsx

import React, { useContext, useState } from 'react';
import { AuthContext } from '../../auth/authProvider';
import { useGetDashboardStats, useGetDashboardChart } from '../../hooks/useDashboard';
import { useGetTransactions } from '../../hooks/useTransaction';
import { motion } from 'framer-motion';

import StatCard from '../../components/dashboard/StatCard';
import DashboardChart from '../../components/dashboard/DashboardChart';
import TransactionsTable from '../../components/transactions/TransactionsTable';
import CustomerSelectionModal from '../../components/cash/CustomerSelectionModal';
import SupplierSelectionModal from '../../components/cash/SupplierSelectionModal';
import PaymentFormModal from '../../components/cash/PaymentFormModal';

import { Users, Truck, DollarSign, TrendingUp, TrendingDown, ArrowDown, ArrowUp } from 'lucide-react';

const DashboardPage = () => {
    const { currentShop, user } = useContext(AuthContext);
    const shopId = currentShop?._id;

    // Time/Date state could be added here if needed, but static date is fine for now
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentHour = today.getHours();
    const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

    const [modalStep, setModalStep] = useState('closed'); 
    const [paymentType, setPaymentType] = useState('CASH_IN'); 
    const [selectedParty, setSelectedParty] = useState(null); 

    const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats({ shopId });
    const { data: chartData, isLoading: isLoadingChart } = useGetDashboardChart({ shopId });
    const { data: transactionResponse, isLoading: isLoadingTransactions } = useGetTransactions({ shopId, limit: 5 });

    const latestTransactions = transactionResponse?.data || [];
    
    const handleOpenSelection = (type) => {
        setPaymentType(type);
        setModalStep('selecting');
    };

    const handlePartySelect = (party) => {
        setSelectedParty(party);
        setModalStep('paying');
    };

    const handleCloseModals = () => {
        setModalStep('closed');
        setSelectedParty(null);
    };

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
        <>
            <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        
                        {/* 1. Welcome Header */}
                        <motion.div variants={itemVariants} className="flex flex-col mb-8 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold tracking-wider text-indigo-600 uppercase mb-1">{formattedDate}</p>
                                <h1 className="text-3xl font-bold text-slate-900">{greeting}, {user?.fname}!</h1>
                                <p className="mt-2 text-slate-500">Here's what's happening in <span className="font-semibold text-slate-700">{currentShop?.name}</span> today.</p>
                            </div>
                            {/* Optional: Add a date picker or filter here later */}
                        </motion.div>

                        {/* 2. Quick Actions & Stats Grid */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
                            {/* Quick Actions Column */}
                            <motion.div variants={itemVariants} className="lg:col-span-1 grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleOpenSelection('CASH_IN')}
                                    className="flex flex-col items-center justify-center p-6 bg-white border border-emerald-100 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group col-span-1 h-40"
                                >
                                    <div className="w-12 h-12 mb-3 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ArrowDown size={24} />
                                    </div>
                                    <span className="font-bold text-slate-800">Cash In</span>
                                    <span className="text-xs text-slate-500 mt-1">Receive Money</span>
                                </button>

                                <button 
                                    onClick={() => handleOpenSelection('CASH_OUT')}
                                    className="flex flex-col items-center justify-center p-6 bg-white border border-rose-100 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-200 transition-all group col-span-1 h-40"
                                >
                                    <div className="w-12 h-12 mb-3 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ArrowUp size={24} />
                                    </div>
                                    <span className="font-bold text-slate-800">Cash Out</span>
                                    <span className="text-xs text-slate-500 mt-1">Pay Money</span>
                                </button>
                                
                                {/* Placeholder for more actions or summary */}
                                <div className="col-span-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-200">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-medium">Net Balance</p>
                                        <p className="text-3xl font-bold mt-1">
                                            Rs. {((stats?.receivableAmount || 0) - (stats?.payableAmount || 0)).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                        <DollarSign size={24} className="text-white" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats Cards Column */}
                            <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <StatCard icon={TrendingUp} title="Total Receivable" value={stats?.receivableAmount} isLoading={isLoadingStats} formatAsCurrency={true} />
                                <StatCard icon={TrendingDown} title="Total Payable" value={stats?.payableAmount} isLoading={isLoadingStats} formatAsCurrency={true} />
                                <StatCard icon={Users} title="Active Customers" value={stats?.totalCustomers} isLoading={isLoadingStats} />
                                <StatCard icon={Truck} title="Active Suppliers" value={stats?.totalSuppliers} isLoading={isLoadingStats} />
                            </motion.div>
                        </div>

                        {/* 3. Charts & Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Performance Over Time</h2>
                                        <p className="text-sm text-slate-500">Sales vs Purchase trends</p>
                                    </div>
                                    <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2">
                                        <option>Last 12 Months</option>
                                        <option>Last 30 Days</option>
                                    </select>
                                </div>
                                <div className="h-80">
                                    <DashboardChart data={chartData} isLoading={isLoadingChart} />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="lg:col-span-1">
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
                                <TransactionsTable transactions={latestTransactions} isLoading={isLoadingTransactions} simpleView={true} />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
            
            {paymentType === 'CASH_IN' ? (
                <CustomerSelectionModal 
                    isOpen={modalStep === 'selecting'}
                    onClose={handleCloseModals}
                    onSelect={handlePartySelect}
                />
            ) : (
                <SupplierSelectionModal
                    isOpen={modalStep === 'selecting'}
                    onClose={handleCloseModals}
                    onSelect={handlePartySelect}
                />
            )}

            {selectedParty && (
                <PaymentFormModal
                    isOpen={modalStep === 'paying'}
                    onClose={handleCloseModals}
                    party={selectedParty}
                    type={paymentType}
                />
            )}
        </>
    );
};

export default DashboardPage;