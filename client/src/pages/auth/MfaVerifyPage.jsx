import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { verifyLoginMFAService } from '../../services/mfaService';
import { useContext } from 'react';
import { AuthContext } from '../../auth/authProvider';
import { toast } from 'react-toastify';
import { Shield, ArrowRight, Lock } from 'lucide-react';

const MfaVerifyPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [code, setCode] = useState('');
    
    const tempToken = location.state?.tempToken;
    const email = location.state?.email;

    useEffect(() => {
        if (!tempToken) {
            toast.error("Invalid session. Please login again.");
            navigate('/login');
        }
    }, [tempToken, navigate]);

    const { mutate: verifyMFA, isLoading } = useMutation({
        mutationFn: ({ code, tempToken }) => verifyLoginMFAService(code, tempToken),
        onSuccess: (response) => {
            toast.success("Login Successful!");
            // Call login with the full response
            login(response);
            navigate('/dashboard');
        },
        onError: (error) => {
            // Show user-friendly error message
            const message = error.response?.data?.message;
            if (message === "Invalid token" || message === "Invalid TOTP code") {
                toast.error("Invalid code. Please try again.");
            } else if (message === "MFA not enabled for this user.") {
                toast.error("Two-factor authentication is not enabled for this account.");
            } else {
                toast.error("Verification failed. Please try again.");
            }
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code || code.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        verifyMFA({ code, tempToken });
    };

    return (
        <div className="flex w-full min-h-[calc(100vh-140px)] bg-slate-50">
           <div className="flex flex-col justify-center w-full p-8 lg:w-1/2 md:p-12 lg:p-16 mx-auto max-w-lg">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-50">
                            <Shield className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h2>
                        <p className="mt-2 text-slate-600">
                            Enter the 6-digit code from your authenticator app for {email || 'your account'}.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Authentication Code
                            </label>
                            <div className="relative">
                                <Lock className="absolute w-5 h-5 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="123456"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-lg tracking-wider text-center"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.length !== 6}
                            className="w-full flex items-center justify-center px-4 py-3.5 font-bold text-white transition-all transform bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Verify & Login <ArrowRight className="w-5 h-5 ml-2" />
                                </span>
                            )}
                        </button>
                    </form>

                     <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
           </div>
        </div>
    );
};

export default MfaVerifyPage;
