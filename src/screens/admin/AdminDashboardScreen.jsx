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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản Trị</h1>
        <p className="text-gray-600 mt-2">Tổng quan hoạt động và quản lý hệ thống</p>
      </div>

      {/* Time Filter */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 px-4 py-2">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border-none bg-transparent text-gray-700 text-sm focus:outline-none cursor-pointer"
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
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Card 1 - Tổng hoàn cảnh */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Tổng hoàn cảnh</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.caseStatusCounts
                      ? Object.values(stats.caseStatusCounts).reduce((a, b) => a + b, 0)
                      : 0}
                  </p>
                  <div className="flex items-center mt-2 space-x-4 text-xs">
                    <span className="text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Đang vận động: {stats.caseStatusCounts?.active || 0}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 space-x-4 text-xs">
                    <span className="text-yellow-600 flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                      Chờ duyệt: {stats.caseStatusCounts?.pending || 0}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2 - Tổng ủng hộ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Tổng ủng hộ</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats.totalDonations || 0)}
                  </p>
                  <div className="flex items-center mt-2 space-x-4 text-xs">
                    <span className="text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Lượt ủng hộ: {stats.donationCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 space-x-4 text-xs">
                    <span className="text-red-600 flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      Chờ duyệt: {pendingSupports || 0}
                    </span>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 3 - Người dùng */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Người dùng</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.userCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">Tổng số thành viên đã đăng ký</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 4 - Cần xử lý */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl shadow-sm text-white p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-100 mb-1">Cần xử lý</p>
                  <p className="text-3xl font-bold text-white">
                    {(stats.caseStatusCounts?.pending || 0) + (pendingSupports || 0)}
                  </p>
                  <div className="mt-4 space-y-1">
                    <Link
                      to="/admin/cases/pending"
                      className="inline-flex items-center text-sm bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 transition-colors mr-2"
                    >
                      Hoàn cảnh ({stats.caseStatusCounts?.pending || 0})
                    </Link>
                    <Link
                      to="/admin/supports?status=pending"
                      className="inline-flex items-center text-sm bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 transition-colors"
                    >
                      Ủng hộ ({pendingSupports || 0})
                    </Link>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Thao tác nhanh</h2>
              <span className="text-sm text-gray-500">Các tính năng thường dùng</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                to="/admin/supports?status=pending"
                className="group relative flex flex-col items-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all transform hover:scale-105 border border-red-200"
              >
                {pendingSupports > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow-lg">
                    {pendingSupports}
                  </span>
                )}
                <div className="bg-red-500 text-white p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-center text-sm font-semibold text-red-700">Duyệt ủng hộ</span>
              </Link>

              <Link
                to="/admin/cases/pending"
                className="group relative flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:from-yellow-100 hover:to-yellow-200 transition-all transform hover:scale-105 border border-yellow-200"
              >
                {stats?.caseStatusCounts?.pending > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow-lg">
                    {stats.caseStatusCounts.pending}
                  </span>
                )}
                <div className="bg-yellow-500 text-white p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-center text-sm font-semibold text-yellow-700">Duyệt hoàn cảnh</span>
              </Link>

              <Link
                to="/admin/history"
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all transform hover:scale-105 border border-indigo-200"
              >
                <div className="bg-indigo-500 text-white p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-center text-sm font-semibold text-indigo-700">Lịch sử</span>
              </Link>

              <Link
                to="/admin/cases"
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-105 border border-green-200"
              >
                <div className="bg-green-500 text-white p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-center text-sm font-semibold text-green-700">Quản lý</span>
              </Link>

              <Link
                to="/admin/supports"
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all transform hover:scale-105 border border-purple-200"
              >
                <div className="bg-purple-500 text-white p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-center text-sm font-semibold text-purple-700">Ủng hộ</span>
              </Link>

              <Link
                to="/admin/users"
                className="group flex flex-col items-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all transform hover:scale-105 border border-teal-200"
              >
                <div className="bg-teal-500 text-white p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-center text-sm font-semibold text-teal-700">Người dùng</span>
              </Link>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Monthly Support Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Ủng hộ theo tháng</h2>
                <span className="text-sm text-gray-500">12 tháng gần nhất</span>
              </div>
              <div className="h-80">
                {chartData ? (
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => formatCurrency(context.parsed.y),
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: '#f3f4f6' },
                          ticks: {
                            callback: (value) => formatCurrency(value),
                            font: { size: 11 }
                          }
                        },
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 11 } }
                        }
                      },
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">Không có dữ liệu hiển thị</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Case Status Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Hoàn cảnh theo trạng thái</h2>
                <span className="text-sm text-gray-500">Tình trạng hiện tại</span>
              </div>
              <div className="h-80 flex items-center justify-center">
                {caseStatusData ? (
                  <Doughnut 
                    data={caseStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { 
                            font: { size: 12 },
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className="text-gray-500">Không có dữ liệu hiển thị</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Hệ thống đã cập nhật dữ liệu thống kê
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Dữ liệu dashboard đã được cập nhật tự động
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Vừa xong
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Admin đã duyệt một khoản ủng hộ mới
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Khoản ủng hộ 500,000 VND đã được xác nhận
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      15 phút trước
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Admin đã duyệt một hoàn cảnh mới
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Hoàn cảnh khó khăn mới đã được công bố
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      1 giờ trước
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">Không có dữ liệu thống kê.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardScreen;
