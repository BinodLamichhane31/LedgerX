import { Dialog } from '@headlessui/react';
import { AlertTriangle, XCircle, Loader2 } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, isLoading, itemName }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
          <div className="flex">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-rose-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                Delete Shop
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <strong className="text-gray-700">"{itemName}"</strong>? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white transition-all border border-transparent rounded-lg shadow-sm bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-rose-400 active:scale-95"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ConfirmDeleteModal;