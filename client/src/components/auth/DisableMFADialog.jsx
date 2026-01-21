import React, { useState } from 'react';
import { X, Lock, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const DisableMFADialog = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!password) {
            toast.error("Please enter your password");
            return;
        }
        
        if (!code || code.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        onConfirm({ password, code });
    };

    const handleClose = () => {
        setPassword('');
        setCode('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
                <button 
                    onClick={handleClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10 disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    {/* Warning Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-50">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Disable Two-Factor Authentication</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            This will reduce your account security. Please verify your identity to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* TOTP Code Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Authentication Code
                            </label>
                            <div className="relative">
                                <Shield className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="123456"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-mono text-center tracking-wider"
                                    maxLength={6}
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Enter the 6-digit code from your authenticator app
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !password || code.length !== 6}
                                className="flex-1 px-4 py-2.5 font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Disabling..." : "Disable 2FA"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DisableMFADialog;
