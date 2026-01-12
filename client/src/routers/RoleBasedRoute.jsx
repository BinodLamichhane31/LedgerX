import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/authProvider";

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect logic based on role
    // If user tries to access admin route -> existing dashboard
    // If admin tries to access user route -> admin dashboard
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;
