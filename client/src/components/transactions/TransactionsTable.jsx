import React from 'react';
import { Loader2, CircleAlert, ArrowRightLeft, TrendingUp, TrendingDown, ArrowDown, ArrowUp } from 'lucide-react';

const TransactionTypeIcon = ({ type }) => {
    if (type === 'CASH_IN') {
        return <TrendingUp className="w-5 h-5 text-green-500" />;
    }
    if (type === 'CASH_OUT') {
        return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
    return <ArrowRightLeft className="w-5 h-5 text-gray-500" />;
};

const TableSkeleton = () => (
    [...Array(10)].map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="px-6 py-4"><div className="w-8 h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4"><div className="w-40 h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4"><div className="w-32 h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4 text-right"><div className="w-20 h-4 ml-auto bg-gray-200 rounded"></div></td>
        </tr>
    ))
);

const EmptyState = () => (
    <tr>
        <td colSpan="5" className="py-20 text-center">
            <ArrowRightLeft className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-800">No Transactions Found</h3>
            <p className="mt-1 text-sm text-gray-500">No records match the current filters.</p>
        </td>
    </tr>
);

const TransactionsTable = ({ transactions, isLoading, isError, error, simpleView = false }) => {
    
    if (simpleView) {
        if (isLoading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse"/>)}</div>;
        if (transactions.length === 0) return <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200"><p className="text-slate-500 text-sm">No recent transactions</p></div>;
        
        return (
             <div className="space-y-3">
                {transactions.map(tx => (
                    <div key={tx._id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors shadow-sm">
                        <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'CASH_IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {tx.type === 'CASH_IN' ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
                             </div>
                             <div>
                                 <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{tx.category.replace(/_/g, ' ')}</p>
                                 <p className="text-xs text-slate-500">{new Date(tx.transactionDate).toLocaleDateString()}</p>
                             </div>
                        </div>
                        <div className={`text-sm font-bold ${tx.type === 'CASH_IN' ? 'text-emerald-600' : 'text-slate-800'}`}>
                             {tx.type === 'CASH_OUT' && '- '}
                             Rs. {tx.amount.toLocaleString()}
                        </div>
                    </div>
                ))}
             </div>
        );
    }
    
    return (
        <div className="overflow-hidden bg-white shadow-sm border border-slate-200 rounded-xl">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="w-12 px-6 py-3"></th>
                            <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-slate-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-slate-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-slate-500 uppercase">Category / Related</th>
                            <th className="px-6 py-3 text-xs font-bold tracking-wider text-right text-slate-500 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {isLoading ? (
                            <TableSkeleton />
                        ) : isError ? (
                            <tr><td colSpan="5" className="py-10 text-center text-red-600"><div className="flex flex-col items-center justify-center gap-2"><CircleAlert className="w-8 h-8"/><span>{error.message || 'Failed to load data.'}</span></div></td></tr>
                        ) : transactions.length === 0 ? (
                            <EmptyState />
                        ) : (
                            transactions.map(tx => (
                                <tr key={tx._id} className="transition-colors duration-200 hover:bg-slate-50">
                                    <td className="px-6 py-4"><TransactionTypeIcon type={tx.type} /></td>
                                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">{tx.description}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <span className="font-semibold block text-slate-700">{tx.category.replace(/_/g, ' ')}</span>
                                        {tx.relatedCustomer && <div className="text-xs text-indigo-500 mt-0.5">To: {tx.relatedCustomer.name}</div>}
                                        {tx.relatedSupplier && <div className="text-xs text-indigo-500 mt-0.5">From: {tx.relatedSupplier.name}</div>}
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${tx.type === 'CASH_IN' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {tx.type === 'CASH_OUT' && '- '}
                                        Rs. {tx.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsTable;