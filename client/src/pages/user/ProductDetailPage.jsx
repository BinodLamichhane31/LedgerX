import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetProductById } from '../../hooks/useProduct'; 
import {
  ArrowLeft,
  Loader2,
  ServerCrash,
  ImageIcon,
  Package,
  DollarSign,
  Hash,
  Layers
} from 'lucide-react';
import { getBackendImageUrl } from '../../utils/backendImage';

const ProductStatusBadge = ({ quantity, reorderLevel }) => {
    let config = { text: 'In Stock', className: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20' };
    if (quantity === 0) {
        config = { text: 'Out of Stock', className: 'bg-rose-100 text-rose-800 ring-1 ring-rose-600/20' };
    } else if (quantity <= reorderLevel) {
        config = { text: 'Low Stock', className: 'bg-amber-100 text-amber-800 ring-1 ring-amber-600/20' };
    }
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
            {config.text}
        </span>
    );
};

const DetailItem = ({ icon: Icon, label, children }) => (
    <div className="p-4 rounded-lg bg-slate-50">
        <div className="flex items-center mb-1 text-sm font-medium text-slate-500">
            <Icon className="w-4 h-4 mr-2 text-indigo-500" />
            <span>{label}</span>
        </div>
        <div className="text-xl font-bold text-slate-900">
            {children}
        </div>
    </div>
);


const ProductDetailPage = () => {
    const { productId } = useParams();
    const { data: product, isLoading, isError, error } = useGetProductById(productId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50">
                <ServerCrash className="w-16 h-16 text-red-400" />
                <h2 className="mt-4 text-2xl font-bold text-gray-800">Product Not Found</h2>
                <p className="mt-2 text-gray-500">
                    {error?.message || "We couldn't find the product you're looking for."}
                </p>
                <Link to="/products" className="inline-flex items-center px-4 py-2 mt-6 text-sm font-medium text-white transition-colors bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 bg-slate-50 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Link to="/products" className="inline-flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Products
                    </Link>
                </div>

                <div className="overflow-hidden bg-white shadow-lg rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="flex items-center justify-center p-8 md:col-span-1 bg-slate-100/50">
                            {product.image ? (
                                <img src={getBackendImageUrl(product.image)} alt={product.name} className="object-contain w-full h-64 transition-transform duration-300 hover:scale-105" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-64 text-slate-300 bg-slate-200 rounded-2xl">
                                    <ImageIcon className="w-20 h-20" />
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:col-span-2">
                            <div className="flex items-start justify-between">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{product.name}</h1>
                                <ProductStatusBadge quantity={product.quantity} reorderLevel={product.reorderLevel} />
                            </div>
                            
                            {product.category && (
                                <div className="inline-flex items-center mt-3 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                    <Layers className="w-4 h-4 mr-2"/>
                                    {product.category}
                                </div>
                            )}

                            {product.description && (
                                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                                    {product.description}
                                </p>
                            )}

                            <div className="pt-8 mt-8 border-t border-slate-100">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                                    <DetailItem icon={DollarSign} label="Selling Price">Rs. {product.sellingPrice.toLocaleString()}</DetailItem>
                                    <DetailItem icon={DollarSign} label="Purchase Price">Rs. {product.purchasePrice.toLocaleString()}</DetailItem>
                                    <DetailItem icon={Hash} label="Stock Quantity">{product.quantity} units</DetailItem>
                                    <DetailItem icon={Hash} label="Reorder Level">{product.reorderLevel} units</DetailItem>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;