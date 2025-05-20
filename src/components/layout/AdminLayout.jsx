import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useSelector } from "react-redux";
import axios from "axios";

const AdminLayout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [pendingSupports, setPendingSupports] = useState(0);
  const [pendingCases, setPendingCases] = useState(0);

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
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <AdminSidebar
          pendingSupports={pendingSupports}
          pendingCases={pendingCases}
        />
        <div className="flex-1">
          <Outlet context={{ pendingSupports, pendingCases }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
