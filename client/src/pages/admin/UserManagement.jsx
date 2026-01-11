import { useState } from 'react';
import { PlusCircle, Search, Users } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { useGetAllUsers, useDeleteUserByAdmin } from '../../hooks/admin/useManageUser';
import UserTable from '../../components/admin/UserTable'
import Pagination from '../../components/common/Pagination';
import UserModal from '../../components/admin/UserModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const UserManagement = () => {
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  
  const { 
    data, isLoading, isError,
    pageNumber, setPageNumber, 
    pageSize, 
    search, setSearch,
    sortField, setSortField,
    sortOrder, setSortOrder
  } = useGetAllUsers();

  const [debouncedSearch] = useDebounce(search, 500); // Debounce search input

  const { mutate: deleteUser } = useDeleteUserByAdmin();

  const handleSort = (field) => {
    const newSortOrder = (field === sortField && sortOrder === 'asc') ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };
  
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setUserModalOpen(true);
  };

  const handleDelete = () => {
    if (deletingUser) {
      deleteUser(deletingUser._id);
      setDeletingUser(null);
    }
  };

  const users = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
              <div className="p-2 bg-indigo-100 rounded-lg">
                 <Users size={24} className="text-indigo-600"/>
              </div>
              User Management
            </h1>
            <p className="mt-1 text-slate-500">Manage all users in the system.</p>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center px-4 py-2.5 font-bold text-white transition-all bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusCircle size={20} className="mr-2" />
            Add User
          </button>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="relative mb-4">
            <Search className="absolute text-slate-400 left-3 top-3" size={20} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full py-2.5 pl-10 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          
          <UserTable
            users={users}
            isLoading={isLoading}
            isError={isError}
            onEdit={handleOpenEditModal}
            onDelete={(user) => setDeletingUser(user)}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />

          {!isLoading && users.length > 0 && (
             <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setPageNumber}
             />
          )}
        </div>
      </div>
      
      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={editingUser}
      />

      <ConfirmationModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete the user ${deletingUser?.fname} ${deletingUser?.lname}? This action cannot be undone.`}
      />
    </>
  );
};

export default UserManagement;