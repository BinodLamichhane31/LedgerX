import { useContext, useState, useEffect, useRef } from "react";
import { Store, ChevronDown, Check, LogOut } from "lucide-react";
import { AuthContext } from "../../auth/authProvider";

const ShopSwitcher = () => {
  const { shops, currentShop, switchShop, loading } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [switcherRef]);
  

  if (loading || !currentShop) {
    return (
      <div className="flex items-center w-full max-w-xs p-2 space-x-3 rounded-lg animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
          <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
        </div>

      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="flex items-center w-full max-w-xs p-2 text-sm text-gray-500">
        <Store className="mr-2" size={18} />
        <span>No shops found.</span>
      </div>
    );
  }

  const handleSelectShop = (shopId) => {
    if (shopId !== currentShop?._id) {
      switchShop(shopId);
    }
    setIsOpen(false);
  };

  return (
    <div ref={switcherRef} className="relative w-full max-w-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full p-2 text-left transition-colors duration-200 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-3 text-indigo-600 bg-indigo-50 rounded-lg">
          <Store size={20} />
        </div>
        
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">{currentShop.name}</p>
            <p className="text-xs text-slate-500">Current Shop</p>
          </div>
          <ChevronDown
            size={16}
            className={`ml-1 text-slate-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute z-10 w-full p-1 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl"
          role="listbox"
        >
          <ul>
            {shops.map((shop) => (
              <li key={shop._id}>
                <button
                  onClick={() => handleSelectShop(shop._id)}
                  className="flex items-center w-full px-3 py-2 text-sm text-left text-slate-700 rounded-md hover:bg-indigo-50 hover:text-indigo-600"
                  role="option"
                  aria-selected={shop._id === currentShop._id}
                >
                  <span className="flex-1 truncate">{shop.name}</span>
                  {shop._id === currentShop._id && (
                    <Check size={16} className="ml-2 text-indigo-500" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShopSwitcher;