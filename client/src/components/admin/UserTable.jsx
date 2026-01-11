import { Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useToggleUserStatus } from '../../hooks/admin/useManageUser';

const SortableHeader = ({ children, field, onSort, sortField, sortOrder }) => {
  const isSorted = sortField === field;
  return (
    <th 
      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center">
        {children}
        {isSorted ? (
          sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
        ) : null}
      </div>
    </th>
  );
};

const UserTable = ({ users, isLoading, onEdit, onDelete, onSort, sortField, sortOrder }) => {
  const { mutate: toggleStatus, isLoading: isToggling } = useToggleUserStatus();

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading users...</div>;
  }
  
  if (!users || users.length === 0) {
    return <div className="py-8 text-center text-gray-500">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader field="fname" {...{ onSort, sortField, sortOrder }}>Name</SortableHeader>
            <SortableHeader field="email" {...{ onSort, sortField, sortOrder }}>Email</SortableHeader>
            <SortableHeader field="role" {...{ onSort, sortField, sortOrder }}>Role</SortableHeader>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap">{`${user.fname} ${user.lname}`}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.isActive}
                    onChange={() => toggleStatus(user._id)}
                    disabled={isToggling}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                <button onClick={() => onEdit(user)} className="p-2 text-indigo-600 hover:text-indigo-900">
                  <Edit size={18} />
                </button>
                <button onClick={() => onDelete(user)} className="p-2 ml-2 text-red-600 hover:text-red-900">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;