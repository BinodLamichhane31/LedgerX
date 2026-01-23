// src/pages/ProfilePage.jsx

import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  KeyRound,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  History
} from 'lucide-react';

import { toast } from 'react-toastify';
import { AuthContext } from '../auth/authProvider';
import { 
  updateProfileService, 
  changePasswordService, 
  uploadProfileImageService
} from '../services/authService';
import { useGetProfile } from '../hooks/auth/useProfile';
import { useDisableMFA } from '../hooks/auth/useTwoFactor';
import { useGetPaymentHistory } from '../hooks/usePayment';

import MFASetupModal from '../components/auth/MFASetupModal';
import DisableMFADialog from '../components/auth/DisableMFADialog';
import ChangePasswordDialog from '../components/auth/ChangePasswordDialog';
import SubscriptionHistory from '../components/user/SubscriptionHistory';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6060/api";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const { data: dbProfile } = useGetProfile();
  const { data: paymentsResponse, isLoading: isPaymentsLoading } = useGetPaymentHistory();
  
  const currentUser = dbProfile?.data || user;
  const payments = paymentsResponse?.data || [];

  const [activeTab, setActiveTab] = useState('account'); // 'account', 'security', or 'history'
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    fname: user?.fname || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // MFA & Security states
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isDisableMfaDialogOpen, setIsDisableMfaDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const { mutate: disableMFA, isLoading: isDisablingMFA } = useDisableMFA();

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        fname: currentUser.fname || '',
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
      
      if (dbProfile?.data && JSON.stringify(dbProfile.data) !== JSON.stringify(user)) {
        setUser(dbProfile.data);
      }
    }
  }, [currentUser, dbProfile, user, setUser]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const filename = imagePath.split(/[/\\]/).pop();
    return `${API_URL}/uploads/${filename}`;
  };

  const imageUrl = getImageUrl(currentUser?.profileImage);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await updateProfileService(profileData);
      setUser(updatedUser.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = error.response?.status === 400 ? error.message : "Something went wrong while updating your profile.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (data) => {
    setIsLoading(true);
    try {
      await changePasswordService(data);
      toast.success('Password changed successfully');
      setIsChangePasswordDialogOpen(false);
    } catch (error) {
      const errorMessage = error.response?.status === 401 ? "Incorrect current password." : "An error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const response = await uploadProfileImageService(formData);
      setUser(response.data);
      toast.success('Profile image updated');
    } catch (error) {
      toast.error("Could not upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 relative">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-indigo-50 border border-slate-100 flex items-center justify-center bg-slate-100 uppercase font-black text-2xl text-slate-400">
                {imageUrl ? (
                  <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  currentUser?.fname?.charAt(0) || 'U'
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-xl text-white shadow-xl cursor-pointer hover:bg-indigo-700 transition-all ring-4 ring-white">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">{currentUser?.fname} {currentUser?.lname}</h1>
              <p className="text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={14} className="text-slate-400" />
                {currentUser?.email}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 uppercase tracking-wider">
                  {currentUser?.role}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                    currentUser?.subscription?.plan === 'PRO' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    currentUser?.subscription?.plan === 'BASIC' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-slate-50 text-slate-700 border-slate-100'
                }`}>
                    Plan: {currentUser?.subscription?.plan || 'FREE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'account' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User size={18} />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'security' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock size={18} />
            Security
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History size={18} />
            Payments
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'account' && (
            <motion.div key="account" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Personal Details</h3>
              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-tighter text-xs">Full Name</label>
                  <input type="text" value={profileData.fname} onChange={(e) => setProfileData({...profileData, fname: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-tighter text-xs">Email</label>
                  <input type="email" value={profileData.email} readOnly className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-tighter text-xs">Phone</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2 flex justify-end">
                   <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                     {isLoading ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'security' && (
             <motion.div key="security" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><KeyRound size={24} /></div>
                      <div>
                        <h3 className="font-bold">Password Management</h3>
                        <p className="text-sm text-slate-500">Last updated recently</p>
                      </div>
                   </div>
                   <button onClick={() => setIsChangePasswordDialogOpen(true)} className="px-5 py-2 text-sm font-bold text-indigo-600 border border-indigo-100 bg-indigo-50 rounded-xl">Update Password</button>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldCheck size={24} /></div>
                      <div>
                        <h3 className="font-bold">Two-Factor Authentication</h3>
                        <p className="text-sm text-slate-500">{currentUser?.mfa?.enabled ? 'Active and protecting your account' : 'Enable for extra security'}</p>
                      </div>
                   </div>
                   {currentUser?.mfa?.enabled ? (
                     <button onClick={() => setIsDisableMfaDialogOpen(true)} className="w-full py-3 text-red-600 font-bold bg-red-50 rounded-2xl border border-red-100">Disable 2FA</button>
                   ) : (
                     <button onClick={() => setIsMfaModalOpen(true)} className="w-full py-3 text-white font-bold bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">Setup 2FA <ChevronRight size={18} /></button>
                   )}
                </div>
             </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
               <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Transaction History</h3>
                  <SubscriptionHistory payments={payments} isLoading={isPaymentsLoading} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MFASetupModal isOpen={isMfaModalOpen} onClose={() => setIsMfaModalOpen(false)} />
      <DisableMFADialog isOpen={isDisableMfaDialogOpen} onClose={() => setIsDisableMfaDialogOpen(false)} onConfirm={disableMFA} isLoading={isDisablingMFA} />
      <ChangePasswordDialog isOpen={isChangePasswordDialogOpen} onClose={() => setIsChangePasswordDialogOpen(false)} onConfirm={handlePasswordUpdate} isLoading={isLoading} />
    </div>
  );
};

export default ProfilePage;
