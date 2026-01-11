import UserForm from './UserForm';

const UserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  const isEditMode = !!user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg p-8 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit User' : 'Add New User'}
        </h2>
        <UserForm user={user} onClose={onClose} />
      </div>
    </div>
  );
};

export default UserModal;
