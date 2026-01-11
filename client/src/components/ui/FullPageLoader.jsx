import React from "react";

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
      <div className="w-12 h-12 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  );
};

export default FullPageLoader;
