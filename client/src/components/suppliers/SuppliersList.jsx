import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetSuppliersByShop } from '../../hooks/useSupplier';
import { AuthContext } from '../../auth/authProvider';
import { Search, Plus, Loader2, Users } from 'lucide-react';
import AddSupplierModal from './SupplierFormModal';

const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

const SupplierList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { supplierId: activeSupplierId } = useParams();

  const { currentShop } = useContext(AuthContext);
  const shopId = currentShop?._id;

  const { data: suppliersResponse, isLoading, isError } = useGetSuppliersByShop({
    shopId: shopId,
    search: searchTerm,
  });
  const suppliers = suppliersResponse?.data || [];


  useEffect(() => {
    if (activeSupplierId) {
      navigate('/suppliers');
    }
  }, [shopId]);

  const handleSupplierClick = (id) => {
    navigate(`/suppliers/${id}`);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white border-r border-gray-200">
        <div className="p-3 border-b border-gray-200">
           <div className='p-2'>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Suppliers
                        </h1>
                    </div>
          <div className="flex items-center gap-2">
           
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pr-4 text-sm transition-all bg-slate-100 border-transparent rounded-lg pl-9 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center p-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors"
              title="Add New Supplier"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          )}
          {isError && (
            <div className="p-4 text-center text-red-500">
              <p>Failed to load suppliers.</p>
            </div>
          )}
          {suppliers && suppliers.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-400">
              <Users size={48} className="mb-2"/>
              <p className="font-semibold text-gray-600">No Suppliers Found</p>
              <p className="text-sm">Add a new supplier to get started.</p>
            </div>
          )}
          <ul>
            {suppliers?.map((supplier) => {
              const isActive = supplier._id === activeSupplierId;
              return (
                <li key={supplier._id}>
                  <button
                    onClick={() => handleSupplierClick(supplier._id)}
                    className={`w-full flex items-center gap-3 text-left p-3 border-b border-slate-100 focus:outline-none transition-colors duration-200 ${
                      isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-9 h-9 text-sm font-bold rounded-full flex-shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {getInitials(supplier.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {supplier.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{supplier.email}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {isModalOpen && (
        <AddSupplierModal
          shopId={shopId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default SupplierList;
