import React from 'react';
import { useParams } from 'react-router-dom';
import CustomerList from '../../components/suppliers/SuppliersList.jsx';
import SupplierList from '../../components/suppliers/SuppliersList.jsx';
import SupplierDetail from '../../components/suppliers/SupplierDetail.jsx';

const SupplierManagementPage = () => {
  const { supplierId } = useParams();  

  return (
    <div className="flex w-full h-full">
      
      <div className="w-1/3 max-w-sm bg-white border-r border-gray-200">
        <SupplierList />
      </div>

      <div className="flex-1">
        <SupplierDetail supplierId={supplierId} />
      </div>
    </div>
  );
};

export default SupplierManagementPage;