import React, { useState } from 'react';
import { useSetupMFA, useVerifySetup } from '../../hooks/auth/useTwoFactor';
import { toast } from 'react-toastify';
import { Shield, X, CheckCircle, Download, Lock } from 'lucide-react';

const MFASetupModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1); // 1: QR, 2: Verify, 3: Recovery
    const [secretData, setSecretData] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);

    const { mutate: setupMFA, isLoading: isSetupLoading } = useSetupMFA();
    const { mutate: verifySetup, isLoading: isVerifying } = useVerifySetup();

    React.useEffect(() => {
        if (isOpen && step === 1 && !secretData) {
            setupMFA({}, {
                onSuccess: (data) => {
                    setSecretData(data);
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to start setup");
                    onClose();
                }
            });
        }
    }, [isOpen, step, secretData]);

    const handleVerify = (e) => {
        e.preventDefault();
        if (!verifyCode || verifyCode.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        verifySetup(verifyCode, {
            onSuccess: (data) => {
                setRecoveryCodes(data.recoveryCodes);
                setStep(3);
            }
        });
    };

    const handleDownloadCodes = () => {
        const text = `LedgerX Recovery Codes:\n\n${recoveryCodes.join('\n')}\n\nKEEP THESE SAFE!`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ledgerx-recovery-codes.txt';
        a.click();
        toast.success("Codes downloaded");
    };
    
    const handleClose = () => {
        setStep(1);
        setSecretData(null);
        setVerifyCode('');
        setRecoveryCodes([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden">
                <button 
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                  <X size={20} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                         <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-indigo-50">
                            <Shield className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h2>
                    </div>

                    {/* Step 1 & 2: QR Scan & Verify */}
                    {(step === 1 || step === 2) && (
                        <div className="space-y-6">
                            {isSetupLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : secretData ? (
                                <>
                                    <div className="text-center space-y-4">
                                        <p className="text-sm font-medium text-slate-500">Scan this QR code with your authenticator app</p>
                                        <div className="flex justify-center">
                                            <img src={secretData.qrCode} alt="QR Code" className="border-4 border-white shadow-lg rounded-xl" />
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            <p>Or enter code manually:</p>
                                            <code className="bg-slate-100 px-2 py-1 rounded select-all font-mono">{secretData.secret}</code>
                                        </div>
                                    </div>
                                     
                                    <div className="border-t border-slate-100 pt-6">
                                        <form onSubmit={handleVerify} className="space-y-4">
                                            <label className="block text-sm font-medium text-slate-700">Enter verification code</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={verifyCode}
                                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="123456"
                                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono tracking-widest text-lg"
                                                    maxLength={6}
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isVerifying || verifyCode.length !== 6}
                                                    className="px-6 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                                >
                                                    {isVerifying ? "..." : "Verify"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Step 3: Recovery Codes */}
                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Setup Complete!</h3>
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-left">
                                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Save your recovery codes
                                </h4>
                                <p className="text-sm text-amber-900/80 mb-4">
                                    If you lose your device, you can use these single-use codes to access your account.
                                </p>
                                <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-white p-3 rounded border border-amber-100">
                                    {recoveryCodes.map((code, i) => (
                                        <div key={i} className="text-slate-600">{code}</div>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadCodes}
                                className="w-full h-12 flex items-center justify-center gap-2 font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                                <Download className="w-4 h-4" /> Download Codes
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full py-3 font-semibold text-slate-600 hover:text-slate-900"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MFASetupModal;
