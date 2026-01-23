import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUserById, useGetUserPaymentHistory } from '../../hooks/admin/useManageUser';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Clock,
  CheckCircle2,
  XCircle,
  History,
  CreditCard
} from 'lucide-react';
import SubscriptionHistory from '../../components/user/SubscriptionHistory';

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoading: isUserLoading } = useGetUserById(id);
    const { data: paymentsResponse, isLoading: isPaymentsLoading } = useGetUserPaymentHistory(id);
    const [activeTab, setActiveTab] = useState('profile');

    if (isUserLoading) return <div className="flex items-center justify-center min-h-screen"><Clock className="animate-spin text-indigo-600" /></div>;

    const payments = paymentsResponse?.data || [];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-900">
            {/* Nav */}
            <button 
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
            >
                <ArrowLeft size={18} />
                Back to User Management
            </button>

            {/* Header Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                
                <div className="relative">
                    <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 ring-4 ring-indigo-50">
                        <User size={40} />
                    </div>
                    {user.isActive ? (
                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-xl ring-4 ring-white">
                            <CheckCircle2 size={16} className="text-white" />
                        </div>
                    ) : (
                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-red-500 rounded-xl ring-4 ring-white">
                            <XCircle size={16} className="text-white" />
                        </div>
                    )}
                </div>

                <div className="text-center md:text-left space-y-2 relative">
                    <h1 className="text-3xl font-bold">{user.fname} {user.lname}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 uppercase tracking-wider">
                            {user.role}
                        </span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                            user.subscription?.plan === 'PRO' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            user.subscription?.plan === 'BASIC' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                            Plan: {user.subscription?.plan || 'FREE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        activeTab === 'profile' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <User size={18} />
                    User Profile
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        activeTab === 'payments' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <History size={18} />
                    Subscription History
                </button>
            </div>

            {/* Content */}
            <div className="transition-all duration-300">
                {activeTab === 'profile' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Shield size={20} className="text-indigo-600" />
                                Account Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Mail className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Email Address</p>
                                        <p className="font-semibold">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Phone className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Phone Number</p>
                                        <p className="font-semibold">{user.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Calendar className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Member Since</p>
                                        <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <CreditCard size={20} className="text-indigo-600" />
                                Current Subscription
                            </h3>
                            <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <CreditCard size={100} />
                                </div>
                                <div className="relative space-y-4">
                                    <div>
                                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Active Plan</p>
                                        <h4 className="text-2xl font-black">{user.subscription?.plan || 'FREE'}</h4>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Expires On</p>
                                            <p className="font-bold">
                                                {user.subscription?.expiresAt ? new Date(user.subscription.expiresAt).toLocaleDateString() : 'Never'}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase">
                                            {user.subscription?.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <SubscriptionHistory payments={payments} isLoading={isPaymentsLoading} />
                )}
            </div>
        </div>
    );
};

export default UserDetailPage;
