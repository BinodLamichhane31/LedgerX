import { Store, MapPin, Phone, Edit, Trash2, CheckCircle } from 'lucide-react';

const ShopCard = ({ shop, onEdit, onDelete, isActive }) => {
  return (
    <div 
      className={`relative bg-white border rounded-xl shadow-sm transition-all duration-300 hover:shadow-md ${isActive ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
    >
      {isActive && (
        <div className="absolute flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full top-3 right-3 border border-emerald-100">
          <CheckCircle size={14} />
          Active
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50">
            <Store className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 truncate">{shop.name}</h3>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          {shop.address && (
            <div className="flex items-start gap-3">
              <MapPin size={16} className="flex-shrink-0 mt-1 text-gray-400" />
              <span>{shop.address}</span>
            </div>
          )}
          {shop.contactNumber && (
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400" />
              <span>{shop.contactNumber}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex border-t border-gray-100">
        <button 
          onClick={() => onEdit(shop)} 
          className="flex-1 px-4 py-3 text-sm font-medium text-center text-gray-600 transition-colors rounded-bl-lg hover:bg-gray-50 hover:text-blue-600"
        >
          <Edit size={16} className="inline-block mr-2" />
          Edit
        </button>
        <button 
          onClick={() => onDelete(shop)} 
          className="flex-1 px-4 py-3 text-sm font-medium text-center text-slate-600 transition-colors border-l border-slate-100 rounded-br-lg hover:bg-slate-50 hover:text-rose-600"
          // Prevent deleting the active shop for safety, or handle switching logic
          // disabled={isActive}
          // title={isActive ? "Cannot delete the active shop" : "Delete Shop"}
        >
          <Trash2 size={16} className="inline-block mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ShopCard;