import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminSidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { userInfo } = useSelector((state) => state.auth);
  
  // Trạng thái từ global state nếu có
  const pendingSupports = useSelector((state) => state.admin?.pendingSupports || 0);
  const pendingCases = useSelector((state) => state.admin?.pendingCases || 0);

  return (
    <div className="md:w-64 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-4">
      <h3 className="font-bold text-gray-700 mb-4 text-lg border-b pb-2">Quản trị</h3>
      <ul className="space-y-2">
        <li>
          <Link
            to="/admin"
            className={`flex items-center p-2 rounded-md ${
              path === "/admin" 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/admin/cases"
            className={`flex items-center p-2 rounded-md ${
              path === "/admin/cases" 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            Hoàn cảnh
          </Link>
        </li>
        <li>
          <Link
            to="/admin/cases/pending"
            className={`flex items-center p-2 rounded-md ${
              path === "/admin/cases/pending" 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Chờ duyệt</span>
            {pendingCases > 0 && (
              <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingCases}
              </span>
            )}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/supports"
            className={`flex items-center p-2 rounded-md ${
              path === "/admin/supports" 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            <span>Ủng hộ</span>
            {pendingSupports > 0 && (
              <span className="ml-auto bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingSupports}
              </span>
            )}
          </Link>
        </li>
        <li>
          <Link
            to="/admin/settings"
            className={`flex items-center p-2 rounded-md ${
              path === "/admin/settings" 
                ? "bg-indigo-50 text-indigo-700" 
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Cài đặt
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;