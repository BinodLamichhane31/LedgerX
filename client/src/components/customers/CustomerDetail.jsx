import React, { useContext, useState } from 'react';
import { useDeleteCustomer, useGetCustomerById } from '../../hooks/useCustomer';
import Table from '../common/Table'; 
import { User, FileText, Receipt, DollarSign, ShoppingBag, Calendar, UserCog, Pencil, Mail, Phone, MapPin, Trash } from 'lucide-react';
import { MdMoney } from 'react-icons/md';
import CustomerFormModal from './CustomerFormModal';
import { ConfirmationModal } from '../common/ConfirmationModel';
import { AuthContext } from '../../auth/authProvider';
import { useGetTransactions } from '../../hooks/useTransaction';
import TransactionsTable from '../transactions/TransactionsTable';

const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

const CustomerDetail = ({ customerId, onDeleteSuccess }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const { data: customer, isLoading, isError } = useGetCustomerById(customerId);
  const { mutate: deleteCustomer , isPending: isDeleting} = useDeleteCustomer();

  const handleConfirmDelete = () => {
    if (customerId) {
      deleteCustomer(customerId, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          if (onDeleteSuccess) {
            onDeleteSuccess(); 
          }
        }
      });
    }
  };

  if (!customerId) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="text-center text-slate-500">
          <UserCog size={48} className="mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-semibold text-slate-700">Select a Customer</h2>
          <p className="text-sm">Choose a customer from the list to see their details.</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (isError) return <div className="p-8 text-red-500">Error loading customer details.</div>;
  if (!customer) return <div className="p-8 text-slate-500">Customer not found.</div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
  ];

  return (
    <div className="h-full p-6 overflow-y-auto bg-slate-50">
      <div className="p-6 mb-8 bg-white shadow-sm rounded-2xl ring-1 ring-slate-900/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center w-20 h-20 text-3xl font-bold text-white shadow-lg bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl">
              {getInitials(customer.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <Calendar size={14} />
                <span>Customer since {new Date(customer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 sm:mt-0">
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 shadow-sm rounded-xl hover:bg-indigo-700 hover:shadow-md active:transform active:scale-95">
              <Pencil size={16} className="mr-2" />
              Edit Profile
            </button>
            <button onClick={() => setIsDeleteModalOpen(true)} className="inline-flex items-center px-4 py-2 text-sm font-medium transition-all bg-white border shadow-sm text-rose-600 border-rose-100 rounded-xl hover:bg-rose-50 hover:border-rose-200 active:transform active:scale-95">
              <Trash size={16} className="mr-2" />
              Delete
            </button>          
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="inline-flex p-1 bg-white border shadow-sm rounded-xl border-slate-200" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all focus:outline-none ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'overview' && <OverviewTab customer={customer} />}
        {activeTab === 'details' && <DetailsTab customer={customer} />}
        {activeTab === 'transactions' && <TransactionsTab customer={customer} />}
      </div>

      {isModalOpen && (
        <CustomerFormModal 
          onClose={() => setIsModalOpen(false)}
          customerToEdit={customer} 
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to permanently delete "${customer.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      />
      
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value }) => (
  <div className="flex items-center p-5 bg-white border border-slate-200 rounded-xl">
    <div className="flex items-center justify-center w-12 h-12 mr-4 bg-indigo-50 rounded-full">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

const OverviewTab = ({ customer }) => (  
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
    <StatCard
      icon={MdMoney}
      title="Total Received"
      value={`Rs. ${customer.totalSpent?.toFixed(2) || '0.00'}`}
    />

    <StatCard
      icon={DollarSign}
      title="Current Balance"
      value={`Rs. ${customer.currentBalance?.toFixed(2) || '0.00'}`}
    />
   
    <StatCard
      icon={Calendar}
      title="Registered Date"
      value={customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
    />
  </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 mt-1 text-slate-400" />
    <div>
      <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">{label}</p>
      <p className="text-sm text-slate-700">{value || 'N/A'}</p>
    </div>
  </div>
);

const DetailsTab = ({ customer }) => (
  <div className="p-8 bg-white shadow-sm border border-slate-200 rounded-2xl">
    <h3 className="pb-4 mb-6 text-lg font-semibold border-b text-slate-900 border-slate-100">Customer Information</h3>
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <DetailItem icon={User} label="Full Name" value={customer.name} />
      <DetailItem icon={Mail} label="Email Address" value={customer.email} />
      <DetailItem icon={Phone} label="Phone Number" value={customer.phone} />
      <DetailItem icon={MapPin} label="Shipping Address" value={customer.address} />
    </div>
  </div>
);

const TransactionsTab = ({ customer }) => {  
  const { currentShop } = useContext(AuthContext);

  const { data, isLoading, isError, error } = useGetTransactions({
    shopId: currentShop?._id,
    relatedCustomer: customer._id, 
    limit: 100 
  });

  const transactions = data?.data || [];

  return (
    <div className="bg-white">
      <h3 className="px-6 pt-6 mb-4 text-lg font-semibold text-slate-800">Transaction History for {customer.name}</h3>
      
      <TransactionsTable 
        transactions={transactions}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
    </div>
  );
};

export default CustomerDetail;