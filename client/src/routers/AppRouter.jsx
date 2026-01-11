import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import LandingPage from "../pages/Landing";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import UserDashboard from "../pages/user/DashboardPage";
import CustomerManagementPage from "../pages/user/CustomerManagementPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import NotFound from "../pages/NotFound";
import { AuthContext } from "../auth/authProvider";
import { useContext } from "react";
import SystemLogsPage from "../pages/admin/SystemLogs";
import FullPageLoader from "../components/ui/FullPageLoader";
import CreateFirstShop from "../pages/user/CreateFirstShop";
import SupplierManagementPage from "../pages/user/SupplierManagementPage";
import ProductManagement from "../pages/user/ProductManagement";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import SalesPage from "../pages/user/SalesPage";
import CreateSalePage from "../pages/user/CreateSalePage";
import SaleDetailsPage from "../pages/user/SaleDetailsPage";
import PurchasesPage from "../pages/user/PurchasePage";
import PurchaseDetailsPage from "../pages/user/PurchaseDetailPage";
import CreatePurchasePage from "../pages/user/CreatePurchasePage";
import TransactionsPage from "../pages/TransactionsPage";
import HisabAssistant from "../components/bot/HisabAssistant";
import SubscriptionPage from "../pages/user/SubscriptionPage";
import PaymentStatusPage from "../pages/user/PaymentStatusPage";
import ShopManagementPage from "../pages/user/ShopManagementPage";
import ProfilePage from "../pages/ProfilePage";

function AppRouter() {
  const { user, loading, isLoggingOut } = useContext(AuthContext);

  // Show logout overlay if logging out
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

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              user
                ? (user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />)
                : <LandingPage />
            }
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/" replace /> : <SignupPage />} 
          />
        </Route>

        {/* ---------------- PRIVATE USER ROUTES ---------------- */}
        <Route element={<PrivateRoute />}>
          {/* Routes WITH the Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/shops" element={<ShopManagementPage />} />
            <Route path="/customers" element={<CustomerManagementPage />} />
            <Route path="/customers/:customerId" element={<CustomerManagementPage />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/suppliers" element={<SupplierManagementPage />} />
            <Route path="/suppliers/:supplierId" element={<SupplierManagementPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/new" element={<CreateSalePage />} />
            <Route path="/sales/:id" element={<SaleDetailsPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/purchases/:id" element={<PurchaseDetailsPage />} />
            <Route path="/purchases/new" element={<CreatePurchasePage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
             <Route path="/subscription" element={<SubscriptionPage />} />
          </Route>

          {/* Route WITHOUT the Dashboard Layout (but still private) */}
          <Route path="/create-first-shop" element={<CreateFirstShop />} />
          <Route path="/payment/success" element={<PaymentStatusPage />} />
          <Route path="/payment/failure" element={<PaymentStatusPage />} />
        </Route>

        {/* ----------------- PRIVATE ADMIN ROUTES ----------------- */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard/>} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/system-logs" element={<SystemLogsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <HisabAssistant />}
    </>
  );
}

export default AppRouter;