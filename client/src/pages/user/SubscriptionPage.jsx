import React, { useContext } from 'react';
import { AuthContext } from '../../auth/authProvider';
import { useInitiateSubscription } from '../../hooks/usePayment';
import { Crown, CheckCircle, Loader2 } from 'lucide-react';
import { useGetProfile } from '../../hooks/auth/useProfile';

const SubscriptionPage = () => {
    const { data: profileResponse, isLoading: isProfileLoading, isError } = useGetProfile();
    
    const { mutate: initiatePayment, isPending } = useInitiateSubscription();
    
    const handleUpgradeClick = () => {
        initiatePayment();
    };

    const isPro = profileResponse?.data.subscription?.plan === 'PRO';
    
    
    return (
        <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                <div className="pb-5 mb-8 border-b border-gray-200">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Subscription Plan</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage your Ledger X subscription and unlock pro features.</p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className={`p-6 bg-white border-2 rounded-xl transition-all ${!isPro ? 'border-primary-500 shadow-md ring-1 ring-primary-100' : 'border-slate-200'}`}>
                        <h2 className="text-xl font-semibold text-slate-800">Free Plan</h2>
                        <p className="mt-4 text-4xl font-bold font-heading">₹0 <span className="text-lg font-normal text-slate-500">/ forever</span></p>
                        <ul className="mt-6 space-y-3 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary-500" /> Up to 2 Shops</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary-500" /> Unlimited Transactions</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary-500" /> Basic Reporting</li>
                        </ul>
                        {!isPro && <p className="mt-8 text-sm font-medium text-center text-slate-500">Your current plan</p>}
                    </div>

                    <div className={`p-6 bg-white border-2 rounded-xl transition-all ${isPro ? 'border-primary-500 shadow-md ring-1 ring-primary-100' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-primary-600">Pro Plan</h2>
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full text-primary-700 bg-primary-100"><Crown size={12}/> PRO</span>
                        </div>
                        <p className="mt-4 text-4xl font-bold font-heading">₹1000 <span className="text-lg font-normal text-slate-500">/ year</span></p>
                        <ul className="mt-6 space-y-3 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary-500" /> Unlimited Shops</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary-500" /> Ledger AI Assistant</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary-500" /> Priority Support</li>
                        </ul>
                        {isPro ? (
                             <p className="mt-8 text-sm font-medium text-center text-green-600">Your plan is active!</p>
                        ) : (
                            <button onClick={handleUpgradeClick} disabled={isPending} className="inline-flex items-center justify-center w-full px-4 py-2 mt-8 text-sm font-medium text-white transition-colors rounded-md shadow-sm bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400">
                                {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Crown className="w-5 h-5 mr-2"/>}
                                {isPending ? 'Redirecting...' : 'Upgrade to Pro'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;