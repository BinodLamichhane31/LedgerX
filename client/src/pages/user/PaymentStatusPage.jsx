import React, { useEffect, useContext, useRef, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useVerifySubscription } from '../../hooks/usePayment';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useGetProfile } from '../../hooks/auth/useProfile';
import { AuthContext } from '../../auth/authProvider';

const PaymentStatusPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const { refetch: refetchProfile } = useGetProfile();
    const verificationTriggered = useRef(false);

    // This state will control our UI and will persist across re-renders.
    const [pageStatus, setPageStatus] = useState('pending'); // 'pending', 'success', 'error'

    const { mutate: verifyPayment } = useVerifySubscription();

    useEffect(() => {
        // Prevent this effect from running more than once.
        if (verificationTriggered.current) {
            return;
        }

        // Handle immediate failure from the URL
        if (window.location.pathname.includes('/failure')) {
            setPageStatus('error');
            return;
        }
        
        // Handle success verification
        if (window.location.pathname.includes('/success')) {
            const pidx = searchParams.get('pidx');       
            const status = searchParams.get('status');

            // Also check for status if available from Khalti redirect (usually 'Completed' or similar)
            // But we mainly rely on verification API.
            
            if (pidx) {
                verificationTriggered.current = true;
                setPageStatus('pending') // Keep pending until verified by our backend
                
                verifyPayment(
                    { pidx }, 
                    {
                        onSuccess: async (data) => {
                            setPageStatus('success');
                            try {
                                const { data: updatedUserData } = await refetchProfile();
                                if (updatedUserData) {
                                    login({ data: updatedUserData });
                                }
                            } catch (e) {
                                console.error("Failed to update profile after payment:", e);
                            } finally {
                                setTimeout(() => navigate('/subscription'), 3000);
                            }
                        },
                        onError: () => {
                            setPageStatus('error');
                        }
                    }
                );
            } else {
                setPageStatus('error');
            }
        }
    }, [searchParams, verifyPayment, refetchProfile, login, navigate]);


    const renderContent = () => {
        // Render based on our persistent `pageStatus` state, not the transient hook state.
        switch (pageStatus) {
            case 'success':
                return (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <h1 className="mt-4 text-2xl font-bold text-gray-800">Payment Successful!</h1>
                        <p className="text-gray-600">Your account has been upgraded.</p>
                        <p className="mt-2 text-sm text-gray-500">Redirecting you shortly...</p>
                        <Link to="/subscription" className="inline-block px-4 py-2 mt-4 text-sm text-orange-600 underline hover:text-orange-800">
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
                        <Link to="/subscription" className="inline-block px-6 py-2 mt-6 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600">
                            Try Again
                        </Link>
                    </>
                );
            case 'pending':
            default:
                return (
                    <>
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
                        <h1 className="mt-4 text-2xl font-bold text-gray-800">Verifying Your Payment...</h1>
                        <p className="text-gray-600">Please do not close this window.</p>
                    </>
                );
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center max-w-md p-8 text-center bg-white rounded-lg shadow-xl">
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentStatusPage;