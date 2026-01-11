import React, { useState, useEffect, useContext } from 'react';
import { useGetTransactions } from '../hooks/useTransaction';
import useDebounce from '../hooks/useDebounce';
import { AuthContext } from '../auth/authProvider';
import TransactionsTable from '../components/transactions/TransactionsTable'; 
import { Search, ChevronLeft, ChevronRight, ArrowRightLeft } from 'lucide-react';

const transactionCategories = [
    'SALE_PAYMENT', 'PURCHASE_PAYMENT', 'EXPENSE_RENT', 'EXPENSE_SALARY', 
    'EXPENSE_UTILITIES', 'OWNER_DRAWING', 'CAPITAL_INJECTION', 
    'OTHER_INCOME', 'OTHER_EXPENSE', 'SALE_RETURN', 'PURCHASE_RETURN'
];

const TransactionsPage = () => {
    const { currentShop } = useContext(AuthContext);
    const shopId = currentShop?._id;

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        category: '',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearch = useDebounce(filters.search, 500);

    const { data, isLoading, isError, error } = useGetTransactions({
        shopId,
        page: currentPage,
        search: debouncedSearch,
        ...filters, 
        limit: 15,
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const transactions = data?.data || [];
    const pagination = data?.pagination || {};

    return (
        <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                <div className="pb-5 mb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transaction Ledger</h1>
                    <p className="mt-1 text-sm text-gray-500">A complete history of all money moving in and out of your shop.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-5">
                    <div className="relative lg:col-span-2">
                        <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                        <input type="text" name="search" value={filters.search} onChange={handleFilterChange} className="w-full py-2 pl-10 pr-3 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Search descriptions..."/>
                    </div>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full py-2 bg-white border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="">All Types</option>
                        <option value="CASH_IN">Cash In</option>
                        <option value="CASH_OUT">Cash Out</option>
                    </select>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full py-2 bg-white border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full py-2 bg-white border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>

                {/* Reusable Table Component in Action */}
                <TransactionsTable
                    transactions={transactions}
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                />

                {/* Pagination Controls */}
                {transactions.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="hidden text-sm text-gray-700 sm:block">Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{pagination.totalPages}</span></div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || isLoading} className="inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === pagination.totalPages || isLoading} className="inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;