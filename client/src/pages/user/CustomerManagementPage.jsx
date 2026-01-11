import React from 'react';
import { useParams } from 'react-router-dom';
import CustomerList from '../../components/customers/CustomerList';
import CustomerDetail from '../../components/customers/CustomerDetail';

const CustomerManagementPage = () => {
  const { customerId } = useParams();  

  return (
    <div className="flex w-full h-full">
      <div className="w-1/3 max-w-sm bg-white border-r border-gray-200">
        <CustomerList />
      </div>

      <div className="flex-1">
        <CustomerDetail customerId={customerId} />
      </div>
    </div>
  );
};

export default CustomerManagementPage;