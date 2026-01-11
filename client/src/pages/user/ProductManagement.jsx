import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MoreVertical, Edit, Trash2, ImageIcon, Package, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetProductsByShop, useDeleteProduct } from '../../hooks/useProduct';
import useDebounce from '../../hooks/useDebounce';
import { ConfirmationModal } from '../../components/common/ConfirmationModel';
import { AuthContext } from '../../auth/authProvider';
import ProductFormModal from '../../components/product/ProductFormModal';
import { getBackendImageUrl } from '../../utils/backendImage';


const ProductStatusBadge = ({ quantity, reorderLevel }) => {
    let config = {
        text: 'In Stock',
        className: 'bg-green-100 text-green-800'
    };

    if (quantity === 0) {
        config = { text: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    } else if (quantity <= reorderLevel) {
        config = { text: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}>
            {config.text}
        </span>
    );
};

const ActionMenu = ({ onEdit, onDelete, isAbove = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-700">
                <MoreVertical size={20} />
            </button>
            {isOpen && (
                <div className={`absolute right-0 z-10 w-40 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 
                    ${isAbove ? 'bottom-10' : 'mt-2'}`}>
                    <div className="py-1">
                        <button onClick={onEdit} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Edit className="w-4 h-4 mr-3" /> Edit
                        </button>
                        <button onClick={onDelete} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-3" /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="ml-4">
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                        <div className="w-24 h-4 mt-2 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </td>
            <td className="hidden px-6 py-4 md:table-cell"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
            <td className="hidden px-6 py-4 sm:table-cell"><div className="w-24 h-6 bg-gray-200 rounded-full"></div></td>
            <td className="px-6 py-4"><div className="w-8 h-8 ml-auto bg-gray-200 rounded-full"></div></td>
        </tr>
    ))
);

const EmptyState = ({ onAddClick }) => (
    <div className="py-20 text-center">
        <Package className="w-16 h-16 mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-800">No Products Found</h3>
        <p className="mt-1 text-sm text-slate-500">Get started by adding a new product to your inventory.</p>
        <button onClick={onAddClick} className="inline-flex items-center px-4 py-2 mt-6 text-sm font-medium text-white transition-transform transform bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
            <Plus className="w-5 h-5 mr-2 -ml-1" />
            Add Your First Product
        </button>
    </div>
);


const ProductManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const { currentShop } = useContext(AuthContext);
    const shopId = currentShop?._id;

    const { data, isLoading, isError, error } = useGetProductsByShop({
        shopId,
        page: currentPage,
        search: debouncedSearchTerm,
        limit: 10,
    });

    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete._id, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setProductToDelete(null);
                }
            });
        }
    };

    const handleAddClick = () => {
        setProductToEdit(null); 
        setIsProductModalOpen(true);
    };

    const handleEditClick = (product) => {
        setProductToEdit(product); 
        setIsProductModalOpen(true);
    };

    const products = data?.data || [];
    const pagination = data?.pagination || {};

    return (
        <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="pb-5 mb-8 border-b border-gray-200 md:flex md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Product Inventory
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage, track, and organize all your products in one place.
                        </p>
                    </div>
                    <button onClick={handleAddClick} className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white transition-transform transform bg-indigo-600 border border-transparent rounded-lg shadow-sm md:mt-0 hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                        <Plus className="w-5 h-5 mr-2 -ml-1" />
                        Add Product
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full py-2 pl-10 pr-3 transition-colors border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Search by product name, category..." />
                </div>

                {/* Products Table */}
                <div className="overflow-hidden bg-white shadow-lg rounded-xl ring-1 ring-gray-900/5">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Product</th>
                                    <th className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase md:table-cell">Price (Sell/Buy)</th>
                                    <th className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">Stock</th>
                                    <th className="hidden px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase sm:table-cell">Status</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <TableSkeleton />
                                ) : isError ? (
                                    <tr><td colSpan="5" className="py-10 text-center text-red-500">{error.message}</td></tr>
                                ) : products.length === 0 ? (
                                     <tr><td colSpan="5"><EmptyState onAddClick={handleAddClick} /></td></tr>
                                ) : (
                                    products.map((product,index) => (
                                        <tr key={product._id} className="transition-colors duration-200 hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link to={`/products/${product._id}`} className="flex items-center group">
                                                    <div className="flex-shrink-0 w-12 h-12">
                                                        {product.image ? <img className="object-cover w-12 h-12 rounded-lg" src={getBackendImageUrl(product.image)} alt={product.name} /> : <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg"><ImageIcon className="w-6 h-6 text-slate-400" /></div>}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900 transition-colors group-hover:text-indigo-600 group-hover:underline">{product.name}</div>
                                                        <div className="text-sm text-gray-500">{product.category}</div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="hidden px-6 py-4 md:table-cell whitespace-nowrap"><div className="text-sm text-gray-900">Rs. {product.sellingPrice} <span className="text-gray-500">/ Rs. {product.purchasePrice}</span></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{product.quantity} units</div></td>
                                            <td className="hidden px-6 py-4 sm:table-cell whitespace-nowrap"><ProductStatusBadge quantity={product.quantity} reorderLevel={product.reorderLevel} /></td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <ActionMenu 
                                                    onEdit={() => handleEditClick(product)}
                                                    onDelete={() => handleDeleteClick(product)}
                                                    isAbove={index === products.length - 1}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                     {/* Pagination Controls */}
                    {products.length > 0 && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{pagination.totalPages}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || isLoading} className="inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === pagination.totalPages || isLoading} className="inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                productToEdit={productToEdit}
            />
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                isPending={isDeleting}
                title="Delete Product"
                message={`Are you sure you want to delete "${productToDelete?.name}"? This action is permanent.`}
                confirmText="Yes, Delete"
            />
        </div>
    );
};

export default ProductManagement;