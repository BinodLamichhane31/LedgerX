import React from 'react';

const LogoutOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Logging out...</h2>
        <p className="text-gray-500">Please wait while we secure your session</p>
      </div>
    </div>
  );
};

export default LogoutOverlay; 