import { useState, useEffect } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom"; // Thêm useOutletContext
import { useSelector } from "react-redux";
import Loader from "../../components/shared/Loader";
import Message from "../../components/shared/Message";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Đăng ký Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboardScreen = () => {
  const location = useLocation();
  const path = location.pathname;
  // Lấy giá trị từ outlet context
  const { pendingSupports = 0 } = useOutletContext() || {};

  const { userInfo } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          `/api/admin/dashboard?timeFilter=${timeFilter}`,
          config
        );
        setStats(data);
        setLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
        setLoading(false);
      }
    };

    if (userInfo && userInfo.isAdmin) {
      fetchDashboardStats();
    }
  }, [userInfo, timeFilter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Dữ liệu biểu đồ ủng hộ theo tháng
  const chartData = stats?.monthlySupportData ? {
    labels: stats.monthlySupportData.map(item => item.label),
    datasets: [
      {
        label: 'Số tiền ủng hộ',
        data: stats.monthlySupportData.map(item => item.total),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2,
      }
    ],
  } : null;
  
  // Dữ liệu biểu đồ số hoàn cảnh theo trạng thái
  const caseStatusData = stats?.caseStatusCounts ? {
    labels: ['Đang vận động', 'Chờ duyệt', 'Đã hoàn thành', 'Đã hủy'],
    datasets: [
      {
        data: [
          stats.caseStatusCounts.active || 0,
          stats.caseStatusCounts.pending || 0,
          stats.caseStatusCounts.completed || 0,
          stats.caseStatusCounts.cancelled || 0,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bảng điều khiển quản trị</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Thời gian:</span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border rounded-md py-1 px-3 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : stats ? (
        <>
          {/* Stats Cards - Giữ nguyên thiết kế */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tổng số hoàn cảnh
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.caseStatusCounts
                      ? Object.values(stats.caseStatusCounts).reduce(
                          (a, b) => a + b,
                          0
                        )
                      : 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Đang vận động: </span>
                  <span className="font-medium">
                    {stats.caseStatusCounts?.active || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chờ duyệt: </span>
                  <span className="font-medium text-yellow-600">
                    {stats.caseStatusCounts?.pending || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tổng số tiền ủng hộ
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalDonations || 0)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lượt ủng hộ: </span>
                  <span className="font-medium">
                    {stats.donationCount || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chờ duyệt: </span>
                  <span className="font-medium text-red-600">
                    {pendingSupports || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tổng số người dùng
                  </p>
                  <p className="text-2xl font-bold">{stats.userCount || 0}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Hoàn cảnh chờ phê duyệt
                  </p>
                  <p className="text-2xl font-bold">
                    {stats.caseStatusCounts?.pending || 0}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/admin/cases/pending"
                  className="text-sm text-indigo-600 hover:underline inline-flex items-center"
                >
                  Xem danh sách chờ phê duyệt
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Biểu đồ ủng hộ theo tháng */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-bold mb-4">
                Ủng hộ theo tháng
              </h2>
              <div className="h-64">
                {chartData ? (
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => formatCurrency(value),
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: (context) => `${formatCurrency(context.parsed.y)}`,
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">Không có dữ liệu hiển thị</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Biểu đồ hoàn cảnh theo trạng thái */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-bold mb-4">
                Hoàn cảnh theo trạng thái
              </h2>
              <div className="h-64 flex items-center justify-center">
                {caseStatusData ? (
                  <Doughnut 
                    data={caseStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }}
                  />
                ) : (
                  <p className="text-gray-500">Không có dữ liệu hiển thị</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Thao tác nhanh */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="font-bold text-lg mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/supports?status=pending"
                className="relative flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                {pendingSupports > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                    {pendingSupports}
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-center text-sm font-medium">
                  Duyệt ủng hộ
                </span>
              </Link>

              <Link
                to="/admin/cases/pending"
                className="relative flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                {stats?.caseStatusCounts?.pending > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                    {stats.caseStatusCounts.pending}
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-center text-sm font-medium">
                  Duyệt hoàn cảnh
                </span>
              </Link>

              <Link
                to="/admin/cases/create"
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-center text-sm font-medium">
                  Tạo hoàn cảnh
                </span>
              </Link>

              <Link
                to="/admin/reports"
                className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-center text-sm font-medium">
                  Báo cáo
                </span>
              </Link>
            </div>
          </div>
          
          {/* Hoạt động gần đây */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-bold text-lg mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {/* Có thể thêm danh sách hoạt động gần đây nếu có dữ liệu */}
              <div className="flex items-start">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 mt-1.5"></div>
                <div className="ml-3">
                  <p className="text-sm">
                    <span className="font-medium">Hệ thống</span> đã cập nhật dữ liệu thống kê
                  </p>
                  <p className="text-xs text-gray-500">Vừa xong</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-1.5"></div>
                <div className="ml-3">
                  <p className="text-sm">
                    <span className="font-medium">Admin</span> đã duyệt một khoản ủng hộ mới
                  </p>
                  <p className="text-xs text-gray-500">15 phút trước</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 mt-1.5"></div>
                <div className="ml-3">
                  <p className="text-sm">
                    <span className="font-medium">Admin</span> đã duyệt một hoàn cảnh mới
                  </p>
                  <p className="text-xs text-gray-500">1 giờ trước</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Không có dữ liệu thống kê.</p>
        </div>
      )}
    </>
  );
};

export default AdminDashboardScreen;
