import React, { useState } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import PasswordStrengthMeter from '../common/PasswordStrengthMeter';

const PasswordInput = ({ label, name, value, show, onToggle, placeholder, onChange, isLoading }) => (
    <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type={show ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900"
                placeholder={placeholder}
                disabled={isLoading}
            />
            <button
                type="button"
                onClick={() => onToggle(name.replace('Password', ''))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    </div>
);

const ChangePasswordDialog = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!passwordData.currentPassword) {
            toast.error("Please enter your current password");
            return;
        }
        
        if (passwordData.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        onConfirm({
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
    };

    const handleClose = () => {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswords({ current: false, new: false, confirm: false });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
                <button 
                    onClick={handleClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-20 disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-50 text-indigo-600">
                            <KeyRound className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
                        <p className="mt-2 text-sm text-slate-600 text-balance">
                            Ensure your account is using a long, random password to stay secure.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <PasswordInput 
                            label="Current Password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            show={showPasswords.current}
                            onToggle={() => togglePasswordVisibility('current')}
                            placeholder="••••••••"
                            onChange={handleChange}
                            isLoading={isLoading}
                        />

                        <div className="space-y-4 border-t border-slate-100 pt-4">
                            <PasswordInput 
                                label="New Password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                show={showPasswords.new}
                                onToggle={() => togglePasswordVisibility('new')}
                                placeholder="••••••••"
                                onChange={handleChange}
                                isLoading={isLoading}
                            />
                            
                            <PasswordStrengthMeter password={passwordData.newPassword} />

                            <PasswordInput 
                                label="Confirm New Password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                show={showPasswords.confirm}
                                onToggle={() => togglePasswordVisibility('confirm')}
                                placeholder="••••••••"
                                onChange={handleChange}
                                isLoading={isLoading}
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordDialog;
