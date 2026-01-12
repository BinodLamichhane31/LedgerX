// src/components/dashboard/Sidebar.js

import { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, Truck, ShieldCheck, UserCog, LogOut,
  ReceiptText, ShoppingBag, History, Crown,
  Store
} from 'lucide-react';
import { AuthContext } from '../../auth/authProvider';
import ShopSwitcher from './ShopSwitcher'; 
import { MdAddShoppingCart } from 'react-icons/md';
import Notification from '../notification/Notification';
import { useGetProfile } from '../../hooks/auth/useProfile';
import ShopFormModal from '../shop/ShopFormModal';
import ConfirmLogoutModal from '../ui/ConfirmLogoutModal';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:6060/api";

const ProfileSection = ({ user, logout }) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const filename = imagePath.split('/').pop();
    return `${API_URL}/uploads/${filename}`;
  };

  const imageUrl = getImageUrl(user?.profileImage);
  console.log(imageUrl);

  const handleLogout = () => {
    // Call logout directly from context - no API call needed
    logout();
  };

  return (
    <div className="p-2 pt-4 mt-auto border-t border-gray-200">
      <div className="flex items-center gap-3">
        <NavLink to="/profile" className="flex items-center flex-grow gap-3 p-1 -m-1 rounded-md hover:bg-gray-100" title="View Profile">
          {imageUrl ? (
            <img src={imageUrl} alt="Profile" className="object-cover rounded-full w-9 h-9" />
          ) : (
            <div className="flex items-center justify-center font-bold text-white bg-indigo-600 rounded-full w-9 h-9">
              {user?.fname?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-700">{user?.role === 'admin' ? 'Administrator' : `${user?.fname || ''} ${user?.lname || ''}`}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </NavLink>
        <button 
          onClick={handleLogout} 
          className="p-2 ml-auto rounded-md hover:bg-gray-100"
          aria-label="Logout"
        >
          <LogOut size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};


const Sidebar = () => {
  const { user, logout, switchShop, isLoggingOut } = useContext(AuthContext);
  const { data: profileData, isLoading: isProfileLoading, isError } = useGetProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Cleanup on unmount or when user becomes null
  useEffect(() => {
    if (!user) {
      setIsModalOpen(false);
      setIsLogoutModalOpen(false);
    }
  }, [user]);

  // Don't render if user is null or logging out
  if (!user || isLoggingOut) {
    return null;
  }

  const handleNewShopCreation = (newShop) => {
    if (newShop && newShop._id) {
      switchShop(newShop._id);
    }
  };

  const handleLogoutClick = () => {
    // Close any open modals first
    setIsModalOpen(false);
    
    // Open logout confirmation modal
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    // Close the confirmation modal
    setIsLogoutModalOpen(false);
    
    // Call logout
    logout();
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 group ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
    }`;

  const userLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/suppliers", label: "Suppliers", icon: Truck },
    { to: "/products", label: "Products", icon: Package },
    { to: "/sales", label: "Sales", icon: ReceiptText },
    { to: "/purchases", label: "Purchases", icon: ShoppingBag },
    { to: "/transactions", label: "Transactions", icon: History },
    { to: "/subscription", label: "Subscription", icon:  Crown},
    { to: "/shops", label: "Manage Shops", icon:  Store},
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "User Management", icon: UserCog },
    { to: "/admin/activity-logs", label: "Activity Logs", icon: ShieldCheck },
  ];

  return (
    <aside className="sticky top-0 z-20 flex flex-col h-screen bg-white border-r border-slate-200/60 w-72">
      
      <div className="p-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Ledger<span className="text-indigo-600">X</span></h1>
      </div>

      {user.role === 'user' &&
      <div className="px-4 mb-6">
        <div className="mb-3">
          <ShopSwitcher />
        </div>
        <button 
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
          title='Add New Shop'
          onClick={()=>setIsModalOpen(true)}
        >
          <MdAddShoppingCart size={16} />
          Add Shop
        </button>
      </div>
}

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {user?.role === 'user' && userLinks.map(link => (
          <NavLink to={link.to} className={navLinkClasses} key={link.to}>
            {({ isActive }) => (
              <>
                <link.icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"} strokeWidth={1.5} style={{ marginRight: '12px' }} />
                <span className="font-medium">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
        
        {user?.role === 'admin' && (
          <div className="mt-6">
            <p className="px-6 mb-3 text-xs font-bold tracking-wider uppercase text-slate-400">
              Admin Controls
            </p>
            {adminLinks.map(link => (
              <NavLink to={link.to} className={navLinkClasses} key={link.to}>
                 {({ isActive }) => (
                  <>
                    <link.icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"} strokeWidth={1.5} style={{ marginRight: '12px' }} />
                    <span className="font-medium">{link.label}</span>
                  </>
                 )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-100">
         <ProfileSection user={profileData?.data} logout={handleLogoutClick} />
      </div>
     

      {isModalOpen && (
        <ShopFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      )}

      {isLogoutModalOpen && (
        <ConfirmLogoutModal
          isOpen={isLogoutModalOpen}
          onClose={handleLogoutCancel}
          onConfirm={handleLogoutConfirm}
          isLoading={isLoggingOut}
        />
      )}
    </aside>
  );
};

export default Sidebar;