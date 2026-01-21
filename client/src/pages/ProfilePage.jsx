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
  AlertCircle
} from 'lucide-react';

import { toast } from 'react-toastify';
import { AuthContext } from '../auth/authProvider';
import { 
  updateProfileService, 
  changePasswordService, 
  uploadProfileImageService,
  getProfileService
} from '../services/authService';
import { useDisableMFA } from '../hooks/auth/useTwoFactor';

import MFASetupModal from '../components/auth/MFASetupModal';
import DisableMFADialog from '../components/auth/DisableMFADialog';
import ChangePasswordDialog from '../components/auth/ChangePasswordDialog';

const API_IMAGE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:6060";

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('account'); // 'account' or 'security'
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
    if (user) {
      setProfileData({
        fname: user.fname || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updatedUser = await updateProfileService(profileData);
      setUser(updatedUser.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
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
      toast.error(error.message || 'Failed to change password');
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
      toast.error(error.message || 'Failed to upload image');
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
        
        {/* Header / Profile Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 relative">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-indigo-50 border border-slate-100 flex items-center justify-center bg-slate-100">
                {user?.image ? (
                  <img 
                    src={`${API_IMAGE_URL}${user.image}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 rounded-xl text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">{user?.fname}</h1>
              <p className="text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={14} className="text-slate-400" />
                {user?.email}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 uppercase tracking-wider">
                  {user?.role}
                </span>
                {user?.mfa?.enabled ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 flex items-center gap-1">
                    <ShieldCheck size={12} /> 2FA Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 flex items-center gap-1">
                    <ShieldAlert size={12} /> 2FA Disabled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'account' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User size={18} />
            Account Settings
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'security' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock size={18} />
            Security & MFA
          </button>
        </div>

        {/* Tab Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'account' ? (
              <motion.div
                key="account"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-500">Update your basic profile information.</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileData.fname}
                        onChange={(e) => setProfileData({ ...profileData, fname: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-sm font-semibold text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end pt-4 border-t border-slate-100 mt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Saving Changes...
                        </>
                      ) : (
                        'Save Profile Changes'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Password Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                          <KeyRound size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Account Password</h3>
                      </div>
                      <p className="text-sm text-slate-500 max-w-md">
                        Ensure your account is using a long, random password to stay secure.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsChangePasswordDialogOpen(true)}
                      className="px-5 py-2 text-sm font-bold text-indigo-600 border border-indigo-100 bg-indigo-50/50 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95 whitespace-nowrap"
                    >
                      Update Password
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-40" />
                </div>

                {/* MFA Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${user?.mfa?.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                          <Shield size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Two-Factor Authentication (MFA)</h3>
                      </div>
                      <p className="text-sm text-slate-500 max-w-md">
                        Add an extra layer of security to your account by requiring more than just a password to log in.
                      </p>
                    </div>
                    {user?.mfa?.enabled ? (
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                        <CheckCircle2 size={14} /> Active
                      </div>
                    ) : (
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
                        <AlertCircle size={14} /> Not Set Up
                      </div>
                    )}
                  </div>

                  <div className="mt-8 relative z-10">
                    {user?.mfa?.enabled ? (
                      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 border border-slate-200">
                            <ShieldCheck size={28} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">MFA via Authenticator App</p>
                            <p className="text-xs text-slate-500">Your account is secured with TOTP codes.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsDisableMfaDialogOpen(true)}
                          className="w-full sm:w-auto px-5 py-2 text-sm font-bold text-red-600 border border-red-100 bg-red-50/50 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                        >
                          Disable MFA
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-slate-200">
                            <Shield size={28} />
                          </div>
                          <div>
                            <p className="font-bold text-indigo-900">Protection is Off</p>
                            <p className="text-xs text-indigo-700/70">Enable MFA to secure your dashboard access.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsMfaModalOpen(true)}
                          className="w-full sm:w-auto px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group active:scale-95"
                        >
                          Enable 2FA <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Aesthetic backgrounds */}
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mb-24 -mr-24 opacity-50 blur-2xl" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <MFASetupModal 
        isOpen={isMfaModalOpen} 
        onClose={() => setIsMfaModalOpen(false)} 
      />
      <DisableMFADialog
        isOpen={isDisableMfaDialogOpen}
        onClose={() => setIsDisableMfaDialogOpen(false)}
        onConfirm={(data) => {
          disableMFA(data, {
            onSuccess: () => {
              setIsDisableMfaDialogOpen(false);
            }
          });
        }}
        isLoading={isDisablingMFA}
      />
      <ChangePasswordDialog
        isOpen={isChangePasswordDialogOpen}
        onClose={() => setIsChangePasswordDialogOpen(false)}
        onConfirm={handlePasswordUpdate}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProfilePage;
