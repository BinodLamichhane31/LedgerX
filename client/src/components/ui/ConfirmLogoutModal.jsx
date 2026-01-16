import React, { useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmLogoutModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="relative z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={!isLoading ? onClose : undefined}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm overflow-hidden pointer-events-auto bg-white shadow-2xl rounded-2xl ring-1 ring-gray-900/5"
            >
              <div className="p-6">
                <h3 className="text-base font-semibold text-slate-900">
                  Sign out
                </h3>
                
                <p className="mt-1 text-sm text-slate-500">
                  Are you sure you want to sign out?
                </p>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-3 py-2 text-sm font-medium transition-colors rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-rose-600 rounded-lg shadow-sm hover:bg-rose-700 active:scale-95 disabled:opacity-70 disabled:pointer-events-none hover:shadow-md shadow-rose-200"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      'Sign out'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmLogoutModal; 