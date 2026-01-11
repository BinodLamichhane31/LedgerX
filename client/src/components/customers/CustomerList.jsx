import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetCustomersByShop } from '../../hooks/useCustomer';
import { AuthContext } from '../../auth/authProvider';
import { Search, Plus, Loader2, Users } from 'lucide-react';
import CustomerFormModal from './CustomerFormModal';

const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { customerId: activeCustomerId } = useParams();
  
  const { currentShop } = useContext(AuthContext);
  const shopId = currentShop?._id;
  
  const { data: customers, isLoading, isError } = useGetCustomersByShop({
    shopId: shopId,
    search: searchTerm,
  });

  useEffect(() => {
    if (activeCustomerId) {
      navigate('/customers');
    }
  }, [shopId]);
  
  const handleCustomerClick = (id) => {
    navigate(`/customers/${id}`);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white border-r border-gray-200">
        
        <div className="p-3 border-b border-gray-200">
          <div className='p-2'>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Customers
                        </h1>
                    </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pr-4 text-sm transition-all bg-slate-100 border-transparent rounded-lg pl-9 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center p-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-colors"
              title="Add New Customer"
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
              <p>Failed to load customers.</p>
            </div>
          )}
          {customers && customers.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-400">
              <Users size={48} className="mb-2"/>
              <p className="font-semibold text-gray-600">No Customers Found</p>
              <p className="text-sm">Add a new customer to get started.</p>
            </div>
          )}
          <ul>
            {/* THIS BLOCK IS NOW CORRECT */}
            {customers?.map((customer) => {
              const isActive = customer._id === activeCustomerId;
              return (
                <li key={customer._id}>
                  <button
                    onClick={() => handleCustomerClick(customer._id)}
                    className={`w-full flex items-center gap-3 text-left p-3 border-b border-slate-100 focus:outline-none transition-colors duration-200 ${
                      isActive ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-9 h-9 text-sm font-bold rounded-full flex-shrink-0 ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {getInitials(customer.name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      
      {isModalOpen && (
        <CustomerFormModal
          shopId={shopId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default CustomerList;