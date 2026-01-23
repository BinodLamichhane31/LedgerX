import React from 'react';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Calendar, CreditCard } from 'lucide-react';

const SubscriptionHistory = ({ payments, isLoading, isError }) => {
    if (isLoading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;
    if (isError) return <div className="p-6 text-center text-red-500">Failed to load payment history.</div>;
    if (!payments || payments.length === 0) return (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                <CreditCard className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-lg">No payment history found</p>
            <p className="text-slate-400 text-sm">Once you subscribe, your payments will appear here.</p>
        </div>
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'COMPLETE':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'PENDING':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'FAILED':
                return 'bg-red-50 text-red-700 border-red-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'COMPLETE': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'FAILED': return <XCircle size={14} className="text-red-500" />;
            default: return <AlertCircle size={14} className="text-amber-500" />;
        }
    };

    return (
        <div className="overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ref ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {payments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar size={14} className="text-slate-400" />
                                        {new Date(payment.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-slate-900">{payment.productCode}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-slate-900">Rs. {payment.amount.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 uppercase">
                                        {payment.paymentMethod}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyles(payment.status)}`}>
                                        <StatusIcon status={payment.status} />
                                        {payment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <code className="text-xs text-slate-400 font-mono">
                                        {payment.khaltiTransactionId || payment.transactionId || '---'}
                                    </code>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriptionHistory;
