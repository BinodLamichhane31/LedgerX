import { useState, useContext } from 'react';
import { useGetShops, useDeleteShop } from '../../hooks/useShop';
import { AuthContext } from '../../auth/authProvider';
import ShopCard from '../../components/shop/ShopCard';
import ShopFormModal from '../../components/shop/ShopFormModal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import { PlusCircle, Store, AlertCircle } from 'lucide-react';
import {toast} from 'react-toastify';

const SkeletonCard = () => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="w-2/3 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="w-5/6 h-4 mt-4 bg-gray-200 rounded"></div>
    <div className="w-4/6 h-4 mt-2 bg-gray-200 rounded"></div>
    <div className="flex mt-6 border-t border-gray-100">
      <div className="flex-1 h-10 bg-gray-100 rounded-bl-lg"></div>
      <div className="flex-1 h-10 bg-gray-100 border-l border-white rounded-br-lg"></div>
    </div>
  </div>
);

const ShopManagementPage = () => {
  const { data: shops, isLoading, isError } = useGetShops();
  const { mutate: deleteShop, isLoading: isDeleting } = useDeleteShop();
  const { currentShop } = useContext(AuthContext);

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  const handleAddNew = () => {
    setSelectedShop(null);
    setFormModalOpen(true);
  };

  const handleEdit = (shop) => {
    setSelectedShop(shop);
    setFormModalOpen(true);
  };

  const handleDelete = (shop) => {
    if (shop._id === currentShop?._id) {
        toast.error("You cannot delete the currently active shop. Please switch to another shop first.");
        return;
    }
    setSelectedShop(shop);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteShop(selectedShop._id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedShop(null);
      },
    });
  };

  return (
    <div className="container p-4 mx-auto sm:p-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shop Management</h1>
          <p className="mt-1 text-slate-500">Manage all your business locations from here.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
          <PlusCircle size={20} />
          Add New Shop
        </button>
      </div>

      {isError && (
        <div className="p-4 text-center text-red-700 bg-red-100 border border-red-200 rounded-lg">
          <AlertCircle className="inline-block mr-2" />
          Failed to load shops. Please try refreshing the page.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        
        {!isLoading && shops?.map((shop) => (
          <ShopCard
            key={shop._id}
            shop={shop}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isActive={shop._id === currentShop?._id}
          />
        ))}
      </div>
      
      {!isLoading && shops?.length === 0 && (
          <div className="col-span-1 p-12 text-center border-2 border-dashed rounded-lg md:col-span-2 lg:col-span-3 border-gray-300/80">
              <Store size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-xl font-medium text-gray-800">No shops found</h3>
              <p className="mt-1 text-gray-500">Get started by adding your first shop.</p>
          </div>
      )}

      {isFormModalOpen && (
        <ShopFormModal
          isOpen={isFormModalOpen}
          onClose={() => setFormModalOpen(false)}
          shop={selectedShop}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          isLoading={isDeleting}
          itemName={selectedShop?.name}
        />
      )}
    </div>
  );
};

export default ShopManagementPage;