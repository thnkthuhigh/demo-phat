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
import UserDetailScreen from "./screens/UserDetailScreen";
import SupportersRankScreen from "./screens/SupportersRankScreen";
import CasesScreen from "./screens/CasesScreen";

// Admin Screens
import AdminCaseListScreen from "./screens/admin/AdminCaseListScreen";
import AdminSupportListScreen from "./screens/admin/AdminSupportListScreen";
import AdminDashboardScreen from "./screens/admin/AdminDashboardScreen";
import AdminPendingCasesScreen from "./screens/admin/AdminPendingCasesScreen";
import AdminSupportHistoryScreen from "./screens/admin/AdminSupportHistoryScreen";

// Auth
import PrivateRoute from "./components/layout/PrivateRoute";
import AdminRoute from "./components/layout/AdminRoute";
import ErrorBoundary from "./components/shared/ErrorBoundary";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - Separate Layout */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="" element={<AdminDashboardScreen />} />
          <Route path="cases" element={<AdminCaseListScreen />} />
          <Route path="cases/pending" element={<AdminPendingCasesScreen />} />
          <Route path="case/:id/edit" element={<EditCaseScreen />} />
          <Route path="supports" element={<AdminSupportListScreen />} />
          <Route path="history" element={<AdminSupportHistoryScreen />} />
        </Route>

        {/* Public Routes - With Header/Footer */}
        <Route
          path="*"
          element={
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomeScreen />} />
                  <Route path="/login" element={<LoginScreen />} />
                  <Route path="/register" element={<RegisterScreen />} />

                  {/* Đặt route hỗ trợ trước route chi tiết hoàn cảnh để ưu tiên xử lý */}
                  <Route path="" element={<PrivateRoute />}>
                    <Route path="/support/:id" element={
                      <div className="container mx-auto px-4 py-8">
                        <CreateSupportScreen />
                      </div>
                    } />
                  </Route>

                  {/* Route chi tiết hoàn cảnh đặt sau */}
                  <Route path="/case/:id" element={<CaseDetailScreen />} />

                  {/* Private Routes cho người dùng đã đăng nhập */}
                  <Route path="" element={<PrivateRoute />}>
                    <Route path="/profile" element={
                      <div className="container mx-auto px-4 py-8">
                        <ProfileScreen />
                      </div>
                    } />
                    <Route path="/create-case" element={
                      <div className="container mx-auto px-4 py-8">
                        <CreateCaseScreen />
                      </div>
                    } />
                    <Route path="/edit-case/:id" element={
                      <div className="container mx-auto px-4 py-8">
                        <EditCaseScreen />
                      </div>
                    } />
                    <Route path="/my-cases" element={
                      <div className="container mx-auto px-4 py-8">
                        <UserCasesScreen />
                      </div>
                    } />
                    <Route
                      path="/my-supports"
                      element={
                        <div className="container mx-auto px-4 py-8">
                          <ErrorBoundary>
                            <UserSupportsScreen />
                          </ErrorBoundary>
                        </div>
                      }
                    />
                  </Route>

                  {/* Route cho bảng xếp hạng người ủng hộ */}
                  <Route
                    path="/supporters-ranking"
                    element={
                      <div className="container mx-auto px-4 py-8">
                        <SupportersRankScreen />
                      </div>
                    }
                  />

                  {/* Route cho trang chi tiết người dùng (public) */}
                  <Route path="/user/:id" element={
                    <div className="container mx-auto px-4 py-8">
                      <UserDetailScreen />
                    </div>
                  } />

                  {/* Route cho trang danh sách hoàn cảnh - Full width */}
                  <Route path="/cases" element={<CasesScreen />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
