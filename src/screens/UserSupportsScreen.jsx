import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../components/shared/Loader";
import Message from "../components/shared/Message";

const UserSupportsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [supports, setSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupports = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get("/api/supports/my-supports", config);
        setSupports(data);
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

    if (userInfo) {
      fetchSupports();
    }
  }, [userInfo]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Chờ duyệt
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Đã duyệt
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Bị từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Không xác định
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lịch sử ủng hộ</h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : supports.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md text-center">
          <p>Bạn chưa có khoản ủng hộ nào.</p>
          <Link
            to="/cases"
            className="text-indigo-600 hover:underline mt-2 inline-block"
          >
            Tìm hoàn cảnh để ủng hộ
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {supports.map((support) => (
              <li key={support._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    {support.case ? (
                      <Link
                        to={`/case/${support.case._id}`}
                        className="text-lg font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {support.case.title}
                      </Link>
                    ) : (
                      <span className="text-lg font-medium text-gray-500">
                        Hoàn cảnh đã bị xóa
                      </span>
                    )}
                    <div className="mt-1 flex items-center">
                      <span className="text-gray-500 text-sm">
                        {formatDate(support.createdAt)}
                      </span>
                      <span className="mx-2">&bull;</span>
                      <span className="text-gray-600 font-medium">
                        {formatCurrency(support.amount)}
                      </span>
                    </div>
                    {support.message && (
                      <p className="mt-1 text-sm text-gray-600">
                        "{support.message}"
                      </p>
                    )}
                    {support.anonymous && (
                      <p className="mt-1 text-xs text-gray-500">
                        Ủng hộ ẩn danh
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start sm:items-end">
                    <div className="mb-2">{getStatusBadge(support.status)}</div>
                    <div className="text-sm text-gray-500">
                      {support.paymentMethod === "transfer"
                        ? "Chuyển khoản"
                        : "MoMo"}
                      {support.transactionId && ` - ${support.transactionId}`}
                    </div>
                  </div>
                </div>

                {/* Hiển thị ghi chú admin nếu có */}
                {support.adminNote && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ghi chú: </span>
                      {support.adminNote}
                    </p>
                  </div>
                )}

                {/* Hiển thị lịch sử trạng thái nếu có */}
                {support.statusHistory && support.statusHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Lịch sử cập nhật:
                    </p>
                    <ul className="space-y-2">
                      {support.statusHistory.map((history, index) => (
                        <li key={index} className="text-xs text-gray-600">
                          {formatDate(history.updatedAt)} -{" "}
                          {history.status === "pending" && " Chờ duyệt"}
                          {history.status === "completed" && " Đã duyệt"}
                          {history.status === "failed" && " Từ chối"}
                          {history.note && ` - ${history.note}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserSupportsScreen;
