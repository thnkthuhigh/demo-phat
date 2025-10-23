import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import AdminBreadcrumb from "./AdminBreadcrumb";
import { useSelector } from "react-redux";
import axios from "axios";

const AdminLayout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [pendingSupports, setPendingSupports] = useState(0);
  const [pendingCases, setPendingCases] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchPendingData = async () => {
      if (!userInfo || !userInfo.isAdmin) return;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      try {
        // Lấy số lượng ủng hộ chờ duyệt
        const supportRes = await axios.get(
          "/api/supports?status=pending&countOnly=true",
          config
        );
        setPendingSupports(supportRes.data.count || 0);

        // Lấy số lượng hoàn cảnh chờ duyệt
        const caseRes = await axios.get(
          "/api/admin/cases/pending?countOnly=true",
          config
        );
        setPendingCases(caseRes.data.count || 0);
      } catch (error) {
        console.error("Error fetching pending data:", error);
      }
    };

    fetchPendingData();
  }, [userInfo]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Navigation */}
      <AdminNavbar 
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        pendingSupports={pendingSupports}
        pendingCases={pendingCases}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar 
          collapsed={sidebarCollapsed}
          pendingSupports={pendingSupports}
          pendingCases={pendingCases}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="px-4 py-4">
              <AdminBreadcrumb />
            </div>
            <div className="flex-1 px-4 pb-4 overflow-auto">
              <Outlet context={{ pendingSupports, pendingCases }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
