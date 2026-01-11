// src/components/dashboard/StatCard.jsx

import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, isLoading, formatAsCurrency = false }) => {
  const displayValue = () => {
    if (isLoading) {
      return <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>;
    }
    if (value === null || value === undefined) {
      return <span className="text-3xl font-bold text-gray-400">0</span>;
    }
    const formattedValue = formatAsCurrency 
      ? `Rs. ${value.toLocaleString()}`
      : value.toLocaleString();
      
    return <span className="text-xl font-bold text-gray-800">{formattedValue}</span>;
  };

  return (
    <motion.div className="p-6 transition-all bg-white border border-slate-200 shadow-sm rounded-2xl hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
           <p className="text-sm font-medium text-slate-500">{title}</p>
           <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {displayValue()}
           </div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </div>
    </motion.div>
  );     
};

export default StatCard;