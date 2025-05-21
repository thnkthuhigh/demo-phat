import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/shared/Loader";
import Message from "../components/shared/Message";

const SupportersRankScreen = () => {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "month", "week"
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch top supporters data directly with axios
  const fetchTopSupporters = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);
        console.log(`Fetching supporters with filter: ${timeFilter}`);
        const { data } = await axios.get(
          `/api/supports/top-supporters?timeFilter=${timeFilter}&_=${Date.now()}`
        );
        console.log("API response:", data);
        setSupporters(data);
        setLastRefreshed(new Date());
      } catch (err) {
        console.error("Error fetching supporters:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [timeFilter]
  );

  // Fetch data on component mount and when filter changes
  useEffect(() => {
    fetchTopSupporters();
  }, [timeFilter, fetchTopSupporters]);

  // Set up auto refresh
  useEffect(() => {
    let refreshInterval;

    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        console.log("Auto refreshing supporter data...");
        fetchTopSupporters(false); // Don't show loading indicator for auto refresh
      }, 60000); // Refresh every 60 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, fetchTopSupporters]);

  const handleManualRefresh = () => {
    fetchTopSupporters(true); // Show loading indicator for manual refresh
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => !prev);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRefreshTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bảng xếp hạng người ủng hộ</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-3">
              Cập nhật lúc: {formatRefreshTime(lastRefreshed)}
            </span>
            <button
              onClick={handleManualRefresh}
              className="bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg flex items-center"
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 mr-2 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Đang cập nhật..." : "Cập nhật ngay"}
            </button>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={toggleAutoRefresh}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 mr-2"
              />
              <span className="text-sm text-gray-700">
                Tự động cập nhật (1 phút)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setTimeFilter("all")}
            className={`px-4 py-2 text-sm font-medium ${
              timeFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border border-gray-300 rounded-l-lg`}
          >
            Tất cả thời gian
          </button>
          <button
            onClick={() => setTimeFilter("month")}
            className={`px-4 py-2 text-sm font-medium ${
              timeFilter === "month"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border-t border-b border-r border-gray-300`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setTimeFilter("week")}
            className={`px-4 py-2 text-sm font-medium ${
              timeFilter === "week"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border border-gray-300 rounded-r-lg`}
          >
            Tuần này
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi khi tải dữ liệu</p>
          <p>{typeof error === "string" ? error : "Đã có lỗi xảy ra"}</p>
        </div>
      ) : !supporters || supporters.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-6 rounded text-center">
          <p className="font-medium">Chưa có dữ liệu người ủng hộ</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Hạng
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Người Ủng Hộ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tổng Ủng Hộ
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Lần Ủng Hộ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supporters.map((supporter, index) => (
                <tr
                  key={supporter._id}
                  className={index < 3 ? "bg-amber-50" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0
                          ? "bg-amber-400 text-white"
                          : index === 1
                          ? "bg-gray-300 text-gray-800"
                          : index === 2
                          ? "bg-amber-700 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <span className="font-medium">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={
                            supporter.userAvatar ||
                            "https://via.placeholder.com/40"
                          }
                          alt={supporter.userName}
                        />
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/user/${supporter.userId}`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                        >
                          {supporter.userName}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-indigo-600">
                    {formatCurrency(supporter.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {supporter.supportCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupportersRankScreen;
