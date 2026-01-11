
// AdminRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import FullPageLoader from "../components/ui/FullPageLoader";
import { AuthContext } from "../auth/authProvider";

const AdminRoute = () => {
  const { user, isLoading } = useContext(AuthContext);

  // Still show a loader while we are determining auth state
  if (isLoading) {
    return <FullPageLoader />;
  }

  // If not authenticated at all, redirect to the landing page (or login page)
  // This is a safety net. PrivateRoute should catch this first, but good to have here too.
  if (!user) {
    return <Navigate to="/" replace />; // Or to "/login" if you have one
  }

  // If authenticated but not an admin, redirect to the regular user dashboard
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and is an admin, allow access
  return <Outlet />;
};

export default AdminRoute;