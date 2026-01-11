import React, { useState, useContext } from 'react';
import { useFormikContext } from 'formik';
import { Dialog } from '@headlessui/react';
import { useGetCustomersByShop } from '../../hooks/useCustomer';
import useDebounce from '../../hooks/useDebounce';
import { AuthContext } from '../../auth/authProvider';
import { Search, X, Loader2, User, CircleAlert } from 'lucide-react';

export default function CustomerSelectionModal({ isOpen, onClose }) {
    const { setFieldValue } = useFormikContext();
    const { currentShop } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);

    const { data: customers, isLoading, isError } = useGetCustomersByShop({
        shopId: currentShop?._id,
        search: debouncedSearch,
    });

    const handleSelect = (customer) => {
        setFieldValue('customerId', customer._id);
        setFieldValue('customerName', customer.name);
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg mx-auto bg-white shadow-lg rounded-xl">
                    <div className="flex items-center justify-between p-4 border-b">
                        <Dialog.Title className="text-lg font-semibold text-gray-800">Select Customer</Dialog.Title>
                        <button onClick={onClose} className="p-1 text-gray-500 rounded-full hover:bg-gray-100"><X size={20} /></button>
                    </div>
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or phone..." className="w-full py-2 pl-10 pr-3 border-gray-300 rounded-lg"/>
                        </div>
                    </div>
                    <div className="px-4 pb-4 overflow-y-auto max-h-96">
                        {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>}
                        {isError && <div className="p-4 text-center text-red-600"><CircleAlert className="inline-block mr-2" /> Could not load customers.</div>}
                        {!isLoading && !isError && customers?.length === 0 && <div className="p-4 text-center text-gray-500"><User className="inline-block mr-2" /> No customers found.</div>}
                        <ul className="space-y-2">
                            {customers?.map(customer => (
                                <li key={customer._id} onClick={() => handleSelect(customer)} className="flex items-center p-3 transition-colors rounded-lg cursor-pointer hover:bg-indigo-50 group">
                                    <div className="flex items-center justify-center w-10 h-10 mr-4 font-bold text-indigo-600 transition-colors bg-indigo-100 rounded-full group-hover:bg-indigo-200">{customer.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-medium text-gray-800">{customer.name}</p>
                                        <p className="text-sm text-gray-500">{customer.phone}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}