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
  const [proofFiles, setProofFiles] = useState([]);
  const [uploadingProofs, setUploadingProofs] = useState(false);

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
    setProofFiles([]);
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

      // Nếu duyệt và có tải kèm minh chứng, tiến hành upload và gắn vào support
      if (newStatus === "completed" && proofFiles.length > 0) {
        try {
          setUploadingProofs(true);
          const form = new FormData();
          proofFiles.forEach((f) => form.append("image", f));
          const uploadRes = await axios.post(`/api/upload`, form, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${userInfo.token}`,
            },
          });
          const urls = uploadRes.data?.urls || uploadRes.data || [];
          await axios.post(
            `/api/supports/${selectedSupport._id}/proofs`,
            { images: urls, note: statusNote },
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
          );
        } catch (e) {
          console.error("Upload proof images error:", e);
        } finally {
          setUploadingProofs(false);
        }
      }

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
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Quản lý ủng hộ</h2>
            <p className="text-gray-600 text-sm">Theo dõi và quản lý tất cả các khoản ủng hộ trong hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8 min-w-[160px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="completed">Đã duyệt</option>
                <option value="failed">Đã hủy</option>
              </select>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error && <Message variant="error">{error}</Message>}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <Loader />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người ủng hộ</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoàn cảnh</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại hỗ trợ</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiền ủng hộ</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supports &&
                  supports.map((support) => (
                    <tr key={support._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {support._id && support._id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
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
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">Không có dữ liệu ủng hộ</p>
            </div>
          )}

          {supports && supports.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
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

              {/* Khu vực minh chứng hiện có */}
              {selectedSupport.proofImages && selectedSupport.proofImages.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-3">
                  <h4 className="font-medium mb-2">Minh chứng đã tải lên:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedSupport.proofImages.map((p, i) => (
                      <div key={i} className="border rounded overflow-hidden">
                        <img src={p.url} alt={`proof-${i}`} className="w-full h-24 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newStatus !== "view" && (
                <>
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

                  {/* Nếu đang duyệt thì cho phép đính kèm minh chứng */}
                  {newStatus === "completed" && (
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Hình ảnh xác nhận giao tặng (tuỳ chọn)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setProofFiles(Array.from(e.target.files || []))}
                        className="block w-full border border-gray-300 rounded p-2"
                      />
                      {proofFiles.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Đã chọn {proofFiles.length} ảnh</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Cho phép admin bổ sung minh chứng sau khi đã duyệt */}
              {newStatus === "view" && selectedSupport.status === "completed" && (
                <div className="mt-4 border-t border-gray-200 pt-3">
                  <h4 className="font-medium mb-2">Bổ sung minh chứng</h4>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      try {
                        setUploadingProofs(true);
                        const form = new FormData();
                        files.forEach((f) => form.append("image", f));
                        const uploadRes = await axios.post(`/api/upload`, form, {
                          headers: {
                            "Content-Type": "multipart/form-data",
                            Authorization: `Bearer ${userInfo.token}`,
                          },
                        });
                        const urls = uploadRes.data?.urls || uploadRes.data || [];
                        await axios.post(
                          `/api/supports/${selectedSupport._id}/proofs`,
                          { images: urls },
                          { headers: { Authorization: `Bearer ${userInfo.token}` } }
                        );
                        // refresh table by toggling refresh and also update selectedSupport locally
                        setRefresh((r) => !r);
                        setSelectedSupport({ ...selectedSupport, proofImages: [
                          ...(selectedSupport.proofImages || []),
                          ...urls.map((u) => ({ url: u }))
                        ] });
                      } catch (e) {
                        console.error("Add proofs error:", e);
                      } finally {
                        setUploadingProofs(false);
                        e.target.value = "";
                      }
                    }}
                    className="block w-full border border-gray-300 rounded p-2"
                  />
                  {uploadingProofs && (
                    <p className="text-xs text-gray-500 mt-1">Đang tải minh chứng...</p>
                  )}
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
