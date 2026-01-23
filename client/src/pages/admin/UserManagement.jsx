import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Users, Download, Trash2, ShieldCheck, ShieldAlert, Eye } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { useGetAllUsers, useDeleteUserByAdmin, useBulkDeleteUsers, useBulkToggleUserStatus } from '../../hooks/admin/useManageUser';
import { useAuthContext } from '../../auth/authProvider';
import UserTable from '../../components/admin/UserTable'
import Pagination from '../../components/common/Pagination';
import UserModal from '../../components/admin/UserModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const UserManagement = () => {
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const { user: currentUser } = useAuthContext();
  
  const { 
    data, isLoading, isError,
    pageNumber, setPageNumber, 
    pageSize, 
    search, setSearch,
    sortField, setSortField,
    sortOrder, setSortOrder,
    role, setRole,
    status, setStatus,
    plan, setPlan
  } = useGetAllUsers();

  const [debouncedSearch] = useDebounce(search, 500); // Debounce search input

  const { mutate: deleteUser } = useDeleteUserByAdmin();
  const { mutate: bulkDelete } = useBulkDeleteUsers();
  const { mutate: bulkToggleStatus } = useBulkToggleUserStatus();

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

  const handleBulkDelete = () => {
    if (selectedIds.length > 0 && confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
        bulkDelete({ userIds: selectedIds }, {
            onSuccess: () => setSelectedIds([]) // Clear selection on success
        });
    }
  };

  const handleBulkStatus = (newStatus) => {
    if (selectedIds.length > 0) {
        bulkToggleStatus({ userIds: selectedIds, status: newStatus }, {
            onSuccess: () => setSelectedIds([]) // Clear selection on success
        });
    }
  };

  const handleExportCSV = () => {
      if (!data?.data) return;

      const headers = ["ID", "First Name", "Last Name", "Email", "Role", "Status", "Joined At"];
      const rows = data.data.map(user => [
          user._id,
          user.fname,
          user.lname,
          user.email,
          user.role,
          user.isActive ? 'Active' : 'Inactive',
          new Date(user.createdAt).toLocaleDateString()
      ]);

      const csvContent = [
          headers.join(","),
          ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "users_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          <div className="flex gap-2">
            <button
                onClick={handleExportCSV}
                className="flex items-center px-4 py-2.5 font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
                <Download size={20} className="mr-2" />
                Export
            </button>
            <button 
                onClick={handleOpenAddModal}
                className="flex items-center px-4 py-2.5 font-bold text-white transition-all bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <PlusCircle size={20} className="mr-2" />
                Add User
            </button>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          {selectedIds.length > 0 ? (
             <div className="flex items-center justify-between p-3 mb-4 text-indigo-700 bg-indigo-50 rounded-lg">
                 <span className="font-semibold">{selectedIds.length} users selected</span>
                 <div className="flex gap-2">
                     <button 
                        onClick={() => handleBulkStatus(true)}
                        className="flex items-center px-3 py-1.5 text-sm font-medium bg-white border border-indigo-200 rounded-md hover:bg-indigo-100 text-indigo-700"
                     >
                        <ShieldCheck size={16} className="mr-1" /> Activate
                     </button>
                     <button 
                        onClick={() => handleBulkStatus(false)}
                        className="flex items-center px-3 py-1.5 text-sm font-medium bg-white border border-indigo-200 rounded-md hover:bg-indigo-100 text-indigo-700"
                     >
                        <ShieldAlert size={16} className="mr-1" /> Deactivate
                     </button>
                     <button 
                        onClick={handleBulkDelete}
                        className="flex items-center px-3 py-1.5 text-sm font-medium bg-white border border-red-200 rounded-md hover:bg-red-50 text-red-600"
                     >
                        <Trash2 size={16} className="mr-1" /> Delete
                     </button>
                 </div>
             </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="relative flex-grow">
                    <Search className="absolute text-slate-400 left-3 top-3" size={20} />
                    <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full py-2.5 pl-10 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                </div>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="py-2.5 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="py-2.5 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="py-2.5 px-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">All Plans</option>
                    <option value="FREE">Free</option>
                    <option value="BASIC">Basic</option>
                    <option value="PRO">Pro</option>
                </select>
            </div>
          )}
          
          <UserTable
            users={users}
            isLoading={isLoading}
            isError={isError}
            onEdit={handleOpenEditModal}
            onViewDetails={(u) => navigate(`/admin/users/${u._id}`)}
            onDelete={(user) => setDeletingUser(user)}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            currentUser={currentUser}
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