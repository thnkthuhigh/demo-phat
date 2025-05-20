import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Screens
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CreateCaseScreen from "./screens/CreateCaseScreen";
import EditCaseScreen from "./screens/EditCaseScreen";
import CaseDetailScreen from "./screens/CaseDetailScreen";
import CreateSupportScreen from "./screens/CreateSupportScreen";
import UserCasesScreen from "./screens/UserCasesScreen";
import UserSupportsScreen from "./screens/UserSupportsScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import SupportersRankScreen from "./screens/SupportersRankScreen";
import CasesScreen from "./screens/CasesScreen";

// Admin Screens
import AdminCaseListScreen from "./screens/admin/AdminCaseListScreen";
import AdminSupportListScreen from "./screens/admin/AdminSupportListScreen";
import AdminDashboardScreen from "./screens/admin/AdminDashboardScreen";
import AdminPendingCasesScreen from "./screens/admin/AdminPendingCasesScreen";

// Auth
import PrivateRoute from "./components/layout/PrivateRoute";
import AdminRoute from "./components/layout/AdminRoute";
import ErrorBoundary from "./components/shared/ErrorBoundary";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            {/* Đặt route hỗ trợ trước route chi tiết hoàn cảnh để ưu tiên xử lý */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/support/:id" element={<CreateSupportScreen />} />
            </Route>

            {/* Route chi tiết hoàn cảnh đặt sau */}
            <Route path="/case/:id" element={<CaseDetailScreen />} />

            {/* Private Routes cho người dùng đã đăng nhập */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/create-case" element={<CreateCaseScreen />} />
              <Route path="/edit-case/:id" element={<EditCaseScreen />} />
              <Route path="/my-cases" element={<UserCasesScreen />} />
              <Route
                path="/my-supports"
                element={
                  <ErrorBoundary>
                    <UserSupportsScreen />
                  </ErrorBoundary>
                }
              />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminDashboardScreen />} />
              <Route path="cases" element={<AdminCaseListScreen />} />
              <Route
                path="cases/pending"
                element={<AdminPendingCasesScreen />}
              />
              <Route path="supports" element={<AdminSupportListScreen />} />
            </Route>

            {/* Route cho bảng xếp hạng người ủng hộ */}
            <Route
              path="/supporters-ranking"
              element={<SupportersRankScreen />}
            />

            {/* Route cho trang chi tiết người dùng */}
            <Route path="/user/:id" element={<UserProfileScreen />} />

            {/* Route cho trang danh sách hoàn cảnh */}
            <Route path="/cases" element={<CasesScreen />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer />
    </Router>
  );
}

export default App;
