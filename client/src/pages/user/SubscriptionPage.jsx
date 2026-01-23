import React, { useContext } from 'react';
import { AuthContext } from '../../auth/authProvider';
import { useInitiateSubscription } from '../../hooks/usePayment';
import { Crown, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useGetProfile } from '../../hooks/auth/useProfile';

const SubscriptionPage = () => {
    const { data: profileResponse, isLoading: isProfileLoading, isError } = useGetProfile();
    const { mutate: initiatePayment, isPending } = useInitiateSubscription();

    const handleUpgradeClick = (plan) => {
        initiatePayment(plan);
    };

    const currentPlan = profileResponse?.data.subscription?.plan || 'FREE';
    const isBasic = currentPlan === 'BASIC';
    const isPro = currentPlan === 'PRO';

    const FeatureItem = ({ included, text }) => (
        <li className={`flex items-center gap-2 ${included ? 'text-slate-600' : 'text-slate-400'}`}>
            {included ? (
                <CheckCircle className="w-5 h-5 text-secondary-500" />
            ) : (
                <XCircle className="w-5 h-5 text-slate-300" />
            )}
            <span className={included ? '' : 'line-through'}>{text}</span>
        </li>
    );

    return (
        <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="pb-5 mb-8 border-b border-gray-200">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Subscription Plans</h1>
                    <p className="mt-1 text-sm text-slate-500">Choose the perfect plan for your business needs.</p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Free Plan */}
                    <div className={`p-6 bg-white border-2 rounded-xl transition-all ${currentPlan === 'FREE' ? 'border-primary-500 shadow-md ring-1 ring-primary-100' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-800">Free</h2>
                            {currentPlan === 'FREE' && <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">CURRENT</span>}
                        </div>
                        <p className="mt-4 text-4xl font-bold font-heading">₹0 <span className="text-lg font-normal text-slate-500">/ forever</span></p>
                        <ul className="mt-6 space-y-3 text-sm">
                            <FeatureItem included={true} text="1 Shop" />
                            <FeatureItem included={true} text="10 Customers" />
                            <FeatureItem included={true} text="10 Suppliers" />
                            <FeatureItem included={false} text="AI Assistant" />
                            <FeatureItem included={true} text="Standard Support" />
                        </ul>
                    </div>

                    {/* Basic Plan */}
                    <div className={`p-6 bg-white border-2 rounded-xl transition-all ${isBasic ? 'border-primary-500 shadow-md ring-1 ring-primary-100' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-primary-600">Basic</h2>
                            {isBasic && <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">CURRENT</span>}
                        </div>
                        <p className="mt-4 text-4xl font-bold font-heading">₹500 <span className="text-lg font-normal text-slate-500">/ year</span></p>
                        <ul className="mt-6 space-y-3 text-sm">
                            <FeatureItem included={true} text="3 Shops" />
                            <FeatureItem included={true} text="50 Customers" />
                            <FeatureItem included={true} text="50 Suppliers" />
                            <FeatureItem included={false} text="AI Assistant" />
                            <FeatureItem included={true} text="Standard Support" />
                        </ul>
                        {!isBasic && !isPro && (
                            <button onClick={() => handleUpgradeClick('BASIC')} disabled={isPending} className="inline-flex items-center justify-center w-full px-4 py-2 mt-8 text-sm font-medium text-white transition-colors rounded-md shadow-sm bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400">
                                {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : null}
                                {isPending ? 'Processing...' : 'Upgrade to Basic'}
                            </button>
                        )}
                        {isPro && <p className="mt-8 text-sm text-center text-slate-500">Included in Pro</p>}
                    </div>

                    {/* Pro Plan */}
                    <div className={`p-6 bg-white border-2 rounded-xl transition-all ${isPro ? 'border-primary-500 shadow-md ring-1 ring-primary-100' : 'border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                             <h2 className="text-xl font-semibold text-purple-600">Pro</h2>
                             {isPro && <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full text-purple-700 bg-purple-100"><Crown size={12}/> CURRENT</span>}
                        </div>
                        <p className="mt-4 text-4xl font-bold font-heading">₹1000 <span className="text-lg font-normal text-slate-500">/ year</span></p>
                        <ul className="mt-6 space-y-3 text-sm">
                            <FeatureItem included={true} text="Unlimited Shops" />
                            <FeatureItem included={true} text="Unlimited Customers" />
                            <FeatureItem included={true} text="Unlimited Suppliers" />
                            <FeatureItem included={true} text="AI Assistant" />
                            <FeatureItem included={true} text="Priority Support" />
                        </ul>
                        {!isPro && (
                            <button onClick={() => handleUpgradeClick('PRO')} disabled={isPending} className="inline-flex items-center justify-center w-full px-4 py-2 mt-8 text-sm font-medium text-white transition-colors rounded-md shadow-sm bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400">
                                {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <Crown className="w-5 h-5 mr-2"/>}
                                {isPending ? 'Processing...' : 'Upgrade to Pro'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;