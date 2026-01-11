import { useContext, useState, useRef, useEffect } from "react";
import { useLogoutUser } from "../../hooks/auth/useLogoutUser";
import { ChevronDown, LogOut, User } from "lucide-react";
import { AuthContext } from "../../auth/authProvider";
import ShopSwitcher from "./ShopSwitcher";

const Header = () => {
  const { user } = useContext(AuthContext);
  const { mutate: logoutUser, isLoading: isLoggingOut } = useLogoutUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleLogout = () => {
    logoutUser();
  };

  return (
    <header className="flex items-center justify-end p-4 shadow-sm bg-gray-50">
            {user?.role !== 'admin' && <ShopSwitcher />}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center p-2 space-x-2 transition rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-indigo-600 rounded-full">
            {user?.fname?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden font-medium text-slate-700 md:block">
            {user?.fname} {user?.lname}
          </span>
          <ChevronDown size={20} className="text-slate-500" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-white border rounded-md shadow-lg">
            <div className="px-4 py-2 text-sm text-gray-700 border-b">
              <p className="font-semibold">Signed in as</p>
              <p className="truncate">{user?.email}</p>
            </div>
            <a
              href="#" 
              className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              <User size={16} className="mr-2" />
              Profile
            </a>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <LogOut size={16} className="mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;