import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminLayout from "./AdminLayout";

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Kiểm tra người dùng có đăng nhập và là admin không
  if (!userInfo || !userInfo.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
};

export default AdminRoute;
