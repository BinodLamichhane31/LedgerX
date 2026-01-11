// src/routes/PrivateRoute.jsx (Updated)

import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import FullPageLoader from "../components/ui/FullPageLoader";
import { AuthContext } from "../auth/authProvider";

const PrivateRoute = () => {
  // Destructure everything we need from the context
  const { user, shops, loading, isLoggingOut } = useContext(AuthContext);
  const location = useLocation();

  // Don't show loading if we're logging out
  if (loading && !isLoggingOut) {
    return <FullPageLoader />;
  }

  // If logging out, show logout overlay
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Logging out...</h2>
          <p className="text-gray-500">Please wait while we secure your session</p>
        </div>
      </div>
    );
  }

  // 1. If not authenticated, redirect to the landing page (or login page)
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. NEW: If user is authenticated but has no shops, redirect to the create-shop page
  // We add a check to prevent an infinite redirect loop if they are already on that page.
  if (
    user.role !== 'admin' && 
    shops.length === 0 && 
    location.pathname !== '/create-first-shop'
  ) {
    return <Navigate to="/create-first-shop" replace />;
  }

  // 3. If all checks pass, allow access to the requested private route
  return <Outlet />;
};

export default PrivateRoute;