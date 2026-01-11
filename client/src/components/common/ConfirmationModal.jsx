import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}) => {
  // Return null if the modal is not open to prevent it from rendering
  if (!isOpen) {
    return null;
  }

  // Effect to handle the 'Escape' key press to close the modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Cleanup the event listener when the component unmounts or isOpen changes
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Style classes for the confirm button based on whether the action is destructive
  const confirmButtonClasses = isDestructive
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

  return (
    // The Modal Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity bg-black bg-opacity-60"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // Close modal if overlay is clicked
    >
      {/* The Modal Content */}
      <div
        className="w-full max-w-md p-6 mx-4 transition-all transform bg-white rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside it
      >
        <div className="flex items-start">
          {isDestructive && (
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
            </div>
          )}
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg font-bold leading-6 text-gray-900" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col-reverse gap-3 mt-5 sm:flex-row sm:justify-end sm:gap-0 sm:space-x-4">
          <button
            type="button"
            className="w-full px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${confirmButtonClasses}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;