import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar"; 
import Header from "../components/dashboard/Header";  
import { useContext } from "react";
import { AuthContext } from "../auth/authProvider";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;