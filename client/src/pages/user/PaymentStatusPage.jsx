import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useVerifyPayment } from '../../hooks/usePayment';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const PaymentStatusPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Independent state for UI control
    const [pageStatus, setPageStatus] = useState('pending'); // 'pending', 'success', 'error'

    const { mutate: verifyPayment } = useVerifyPayment();

    useEffect(() => {
        // Handle immediate failure from the URL
        if (window.location.pathname.includes('/failure')) {
            setPageStatus('error');
            return;
        }
        
        // Handle verification
        if (window.location.pathname.includes('/success')) {
            const pidx = searchParams.get('pidx');       
            const status = searchParams.get('status'); // 'Completed', 'User canceled', etc.

            // 1. Check for immediate cancellation/failure signals from query params
            if (!pidx || status === 'User canceled' || status === 'Failed' || status === 'Expired') {
                setPageStatus('error');
                return;
            }
            
            if (pidx) {
                setPageStatus('pending'); // Keep pending until verified by backend
                
                verifyPayment(
                    { pidx }, 
                    {
                        onSuccess: (data) => {
                            setPageStatus('success');
                            setTimeout(() => navigate('/subscription'), 3000);
                        },
                        onError: (error) => {
                            console.error("Payment verification failed:", error);
                            setPageStatus('error');
                        }
                    }
                );
            }
        }
    }, [searchParams, verifyPayment, navigate]);


    const renderContent = () => {
        // Render based on our persistent `pageStatus` state
        switch (pageStatus) {
            case 'success':
                return (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h1 className="mt-4 text-2xl font-bold text-gray-800">Payment Successful!</h1>
                        <p className="text-gray-600">Your account has been upgraded.</p>
                        <p className="mt-2 text-sm text-slate-500">Redirecting you shortly...</p>
                        <Link to="/subscription" className="inline-block px-4 py-2 mt-4 text-sm text-primary-600 underline hover:text-primary-800">
                            Continue Now
                        </Link>
                    </>
                );
            case 'error':
                return (
                    <>
                        <XCircle className="w-16 h-16 text-red-500" />
                        <h1 className="mt-4 text-2xl font-bold text-gray-800">Payment Failed</h1>
                        <p className="max-w-xs mx-auto text-gray-600">
                            The payment was cancelled or could not be verified. Please try again.
                        </p>
                        <Link to="/subscription" className="inline-block px-6 py-2 mt-6 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors">
                            Try Again
                        </Link>
                    </>
                );
            case 'pending':
            default:
                return (
                    <>
                        <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
                        <h1 className="mt-4 text-2xl font-bold text-gray-800">Verifying Your Payment...</h1>
                        <p className="text-gray-600">Please do not close this window.</p>
                    </>
                );
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center max-w-md p-8 text-center bg-white rounded-xl shadow-lg border border-slate-100">
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentStatusPage;