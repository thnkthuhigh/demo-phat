import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useOutletContext } from "react-router-dom";
import Loader from "../../components/shared/Loader";
import Message from "../../components/shared/Message";
import Pagination from "../../components/shared/Pagination";
import axios from "axios";

const AdminSupportListScreen = () => {
  // Lấy giá trị từ context nếu cần
  const { pendingSupports = 0 } = useOutletContext() || {};
  const { userInfo } = useSelector((state) => state.auth);

  const [supports, setSupports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchSupports = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        let url = `/api/supports?page=${currentPage}`;
        if (filterStatus !== "all") {
          url += `&status=${filterStatus}`;
        }

        const { data } = await axios.get(url, config);
        setSupports(data.supports || []);
        setTotalPages(data.pages || 1);
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
      fetchSupports();
    }
  }, [userInfo, currentPage, refresh, filterStatus]);

  const openStatusModal = (support, status) => {
    setSelectedSupport(support);
    setNewStatus(status);
    setStatusNote("");
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedSupport(null);
  };

  const updateSupportStatus = async () => {
    if (!selectedSupport) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(
        `/api/supports/${selectedSupport._id}/status`,
        {
          status: newStatus,
          note: statusNote,
        },
        config
      );

      closeStatusModal();
      setRefresh(!refresh);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý ủng hộ</h1>
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-md px-3 py-1"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="completed">Đã duyệt</option>
            <option value="failed">Đã hủy</option>
          </select>
        </div>
      </div>

      {error && <Message variant="error">{error}</Message>}

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Người ủng hộ</th>
                  <th className="py-2 px-4 text-left">Hoàn cảnh</th>
                  <th className="py-2 px-4 text-left">Loại hỗ trợ</th>
                  <th className="py-2 px-4 text-left">Tiền ủng hộ</th>
                  <th className="py-2 px-4 text-left">Ngày tạo</th>
                  <th className="py-2 px-4 text-left">Trạng thái</th>
                  <th className="py-2 px-4 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {supports &&
                  supports.map((support) => (
                    <tr key={support._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <span className="text-xs font-mono">
                          {support._id && support._id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {support.user && (
                          <div className="flex items-center">
                            <img
                              src={
                                support.anonymous
                                  ? "https://via.placeholder.com/30"
                                  : support.user.avatar ||
                                    "https://via.placeholder.com/30"
                              }
                              alt={
                                support.anonymous ? "Anonymous" : support.user.name
                              }
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <span>
                              {support.anonymous
                                ? "Ẩn danh"
                                : support.user?.name || "Người dùng"}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {support.case && (
                          <Link
                            to={`/case/${support.case._id}`}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {support.case.title && support.case.title.length > 25
                              ? support.case.title.substring(0, 25) + "..."
                              : support.case.title || "N/A"}
                          </Link>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        {support.amount > 0 && support.items && support.items.length > 0
                          ? "Tiền + Vật phẩm"
                          : support.amount > 0
                          ? "Tiền"
                          : support.items && support.items.length > 0
                          ? "Vật phẩm"
                          : "N/A"}
                      </td>
                      <td className="py-2 px-4">
                        {support.amount > 0 ? (
                          <span>{formatCurrency(support.amount)}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                        {support.items && support.items.length > 0 && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                            +{support.items.length} vật phẩm
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4">
                        <span>{formatDate(support.createdAt)}</span>
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            support.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : support.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {support.status === "completed"
                            ? "Đã duyệt"
                            : support.status === "pending"
                            ? "Chờ duyệt"
                            : "Đã hủy"}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openStatusModal(support, "completed")}
                            className={`text-xs px-2 py-1 rounded ${
                              support.status === "completed"
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            disabled={support.status === "completed"}
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => openStatusModal(support, "failed")}
                            className={`text-xs px-2 py-1 rounded ${
                              support.status === "failed"
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                            disabled={support.status === "failed"}
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => {
                              // Hiển thị modal chi tiết ủng hộ
                              setSelectedSupport(support);
                              setShowStatusModal(true);
                              setNewStatus("view");
                            }}
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {supports && supports.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg mt-4">
              <p className="text-gray-500">Không có dữ liệu ủng hộ</p>
            </div>
          )}

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </>
      )}

      {/* Modal cập nhật trạng thái hoặc xem chi tiết */}
      {showStatusModal && selectedSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {newStatus === "view"
                  ? "Chi tiết ủng hộ"
                  : newStatus === "completed"
                  ? "Duyệt ủng hộ"
                  : "Từ chối ủng hộ"}
              </h3>

              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono">{selectedSupport._id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Người ủng hộ:</span>
                  <span>
                    {selectedSupport.anonymous
                      ? "Ẩn danh"
                      : selectedSupport.user?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span>{formatDate(selectedSupport.createdAt)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      selectedSupport.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : selectedSupport.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedSupport.status === "completed"
                      ? "Đã duyệt"
                      : selectedSupport.status === "pending"
                      ? "Chờ duyệt"
                      : "Đã hủy"}
                  </span>
                </div>
                {selectedSupport.amount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tiền ủng hộ:</span>
                    <span>{formatCurrency(selectedSupport.amount)}</span>
                  </div>
                )}
                {selectedSupport.paymentMethod && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Phương thức thanh toán:</span>
                    <span>
                      {selectedSupport.paymentMethod === "transfer"
                        ? "Chuyển khoản"
                        : selectedSupport.paymentMethod === "momo"
                        ? "MoMo"
                        : selectedSupport.paymentMethod === "cash"
                        ? "Tiền mặt"
                        : "Khác"}
                    </span>
                  </div>
                )}
                {selectedSupport.transactionId && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-mono">{selectedSupport.transactionId}</span>
                  </div>
                )}

                {/* Hiển thị thông tin vật phẩm nếu có */}
                {selectedSupport.items && selectedSupport.items.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-3">
                    <h4 className="font-medium mb-2">Vật phẩm ủng hộ:</h4>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-1 px-2 text-left">Tên vật phẩm</th>
                          <th className="py-1 px-2 text-right">Số lượng</th>
                          <th className="py-1 px-2 text-left">Đơn vị</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSupport.items.map((item, index) => (
                          <tr key={index} className="border-t border-gray-100">
                            <td className="py-1 px-2">{item.name}</td>
                            <td className="py-1 px-2 text-right">{item.quantity}</td>
                            <td className="py-1 px-2">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedSupport.message && (
                  <div className="mt-4 border-t border-gray-200 pt-3">
                    <h4 className="font-medium mb-2">Lời nhắn:</h4>
                    <p className="text-gray-700 italic bg-gray-50 p-2 rounded">
                      "{selectedSupport.message}"
                    </p>
                  </div>
                )}
              </div>

              {newStatus !== "view" && (
                <div className="mb-4">
                  <label className="block mb-1">
                    Ghi chú:
                    {newStatus === "failed" && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2"
                    rows="3"
                    required={newStatus === "failed"}
                    placeholder={
                      newStatus === "completed"
                        ? "Ghi chú khi duyệt (nếu có)"
                        : "Lý do từ chối"
                    }
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                {newStatus !== "view" && (
                  <button
                    onClick={updateSupportStatus}
                    className={`px-4 py-2 text-white rounded ${
                      newStatus === "completed"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    disabled={newStatus === "failed" && !statusNote.trim()}
                  >
                    {newStatus === "completed" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
                  </button>
                )}
                <button
                  onClick={closeStatusModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  {newStatus === "view" ? "Đóng" : "Hủy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportListScreen;
