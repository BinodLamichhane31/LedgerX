import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useFormikContext } from 'formik';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { useGetProductsByShop } from '../../hooks/useProduct';
import useDebounce from '../../hooks/useDebounce';
import { AuthContext } from '../../auth/authProvider';
import { Search, X, Loader2, Package, CircleAlert, Plus, Check } from 'lucide-react';

export default function ProductSelectionModalForPurchase({ isOpen, onClose }) {
    const { values, setFieldValue } = useFormikContext();
    const { currentShop } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState({});
    const debouncedSearch = useDebounce(searchTerm, 300);

    const { data: productResponse, isLoading, isError } = useGetProductsByShop({
        shopId: currentShop?._id,
        search: debouncedSearch,
    });
    const products = productResponse?.data || [];

    const existingItemIds = useMemo(() => new Set(values.items.map(item => item.productId)), [values.items]);

    useEffect(() => {
        if (isOpen) {
            setSelectedProducts({});
        }
    }, [isOpen]);

    const handleToggleProduct = (product) => {
        if (existingItemIds.has(product._id)) {
            toast.info(`${product.name} is already in the purchase list.`);
            return;
        }
        setSelectedProducts(prev => {
            const newSelected = { ...prev };
            if (newSelected[product._id]) delete newSelected[product._id];
            else newSelected[product._id] = product;
            return newSelected;
        });
    };
    
    const handleAddItems = () => {
        const newItems = Object.values(selectedProducts).map(product => ({
            productId: product._id,
            name: product.name,
            quantity: 1, 
            unitCost: product.purchasePrice || 0, 
        }));

        if(newItems.length > 0) {
            setFieldValue('items', [...values.items, ...newItems]);
        }
        onClose();
    };
    
    const selectedCount = Object.keys(selectedProducts).length;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl flex flex-col h-[90vh] bg-white rounded-xl shadow-2xl">
                    <div className="flex-shrink-0 p-4 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-semibold text-slate-800">Add Products to Purchase</Dialog.Title>
                            <button onClick={onClose} className="p-1 text-slate-500 rounded-full hover:bg-slate-100"><X size={20} /></button>
                        </div>
                        <div className="relative mt-2">
                            <Search className="absolute w-5 h-5 text-slate-400 -translate-y-1/2 left-3 top-1/2" />
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                placeholder="Search products..." 
                                className="w-full py-2.5 pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex-grow px-4 overflow-y-auto">
                        {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>}
                        {isError && <div className="p-4 text-center text-red-600"><CircleAlert className="inline-block mr-2" /> Could not load products.</div>}
                        {!isLoading && !isError && products.length === 0 && <div className="p-4 text-center text-slate-500"><Package className="inline-block mr-2" /> No products found.</div>}
                        <ul className="py-4 space-y-2">
                            {products.map(product => {
                                const isAlreadyInCart = existingItemIds.has(product._id);
                                const isSelected = !!selectedProducts[product._id];
                                return (
                                    <li 
                                        key={product._id} 
                                        onClick={() => !isAlreadyInCart && handleToggleProduct(product)} 
                                        className={`flex items-center p-3 transition-all rounded-lg 
                                            ${isSelected ? 'bg-indigo-50 ring-1 ring-indigo-500' : 'hover:bg-slate-50'} 
                                            ${isAlreadyInCart ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`
                                        }
                                    >
                                        <input 
                                            type="checkbox" 
                                            readOnly 
                                            checked={isSelected || isAlreadyInCart} 
                                            disabled={isAlreadyInCart} 
                                            className="w-5 h-5 mr-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:text-gray-400"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-medium text-slate-800">{product.name}</p>
                                            <p className="text-sm text-slate-500">Current Stock: {product.quantity}</p>
                                        </div>
                                        {isAlreadyInCart && (
                                            <span className="flex items-center text-xs font-semibold text-green-700">
                                                <Check size={14} className="mr-1" /> Added
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                     <div className="flex-shrink-0 p-4 border-t bg-slate-50">
                        <button 
                            onClick={handleAddItems} 
                            disabled={selectedCount === 0} 
                            className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                           <Plus className="w-5 h-5 mr-2" /> Add {selectedCount > 0 ? `${selectedCount} Item(s)` : 'Items'} to Purchase
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}