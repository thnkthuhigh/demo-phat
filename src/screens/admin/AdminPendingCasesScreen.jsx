import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useOutletContext } from "react-router-dom"; // Thêm useOutletContext
import axios from "axios";
import Loader from "../../components/shared/Loader";
import Message from "../../components/shared/Message";
import Pagination from "../../components/shared/Pagination";

const AdminPendingCasesScreen = () => {
  // Lấy giá trị từ context nếu cần
  const { pendingCases = 0 } = useOutletContext() || {};
  const { userInfo } = useSelector((state) => state.auth);

  const [pendingCasesData, setPendingCasesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchPendingCases = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          `/api/admin/cases/pending?page=${currentPage}`,
          config
        );
        setPendingCasesData(data.cases || []);
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

    fetchPendingCases();
  }, [userInfo, currentPage, refresh]);

  const approveHandler = async (id) => {
    try {
      if (!window.confirm("Bạn có chắc chắn muốn phê duyệt hoàn cảnh này?")) {
        return;
      }

      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/admin/cases/${id}/approve`, {}, config);

      setRefresh(!refresh);
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

  const openRejectModal = (caseItem) => {
    setSelectedCase(caseItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCase(null);
    setRejectionReason("");
  };

  const rejectHandler = async () => {
    try {
      if (!rejectionReason.trim()) {
        alert("Vui lòng nhập lý do từ chối");
        return;
      }

      setLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(
        `/api/admin/cases/${selectedCase._id}/reject`,
        { reason: rejectionReason },
        config
      );

      closeModal();
      setRefresh(!refresh);
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getSupportTypeLabel = (supportType) => {
    switch (supportType) {
      case "money":
        return "Tiền mặt";
      case "items":
        return "Vật phẩm";
      case "both":
        return "Tiền + Vật phẩm";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Hoàn cảnh chờ duyệt</h1>

      {error && <Message variant="error">{error}</Message>}

      {loading ? (
        <Loader />
      ) : (
        <>
          {!pendingCasesData || pendingCasesData.length === 0 ? (
            <div className="bg-blue-50 p-4 rounded-md text-center">
              <p className="text-blue-700">
                Không có hoàn cảnh nào đang chờ duyệt
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left">ID</th>
                      <th className="py-3 px-4 text-left">Tiêu đề</th>
                      <th className="py-3 px-4 text-left">Người tạo</th>
                      <th className="py-3 px-4 text-left">Loại hỗ trợ</th>
                      <th className="py-3 px-4 text-left">Mục tiêu</th>
                      <th className="py-3 px-4 text-left">
                        Vật phẩm cần hỗ trợ
                      </th>
                      <th className="py-3 px-4 text-left">Ngày tạo</th>
                      <th className="py-3 px-4 text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingCasesData.map((caseItem) => (
                      <tr key={caseItem._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {caseItem._id && caseItem._id.substring(0, 10)}...
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/case/${caseItem._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {caseItem.title && caseItem.title.substring(0, 30)}
                            {caseItem.title &&
                              caseItem.title.length > 30 &&
                              "..."}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {caseItem.user?.name || "Người dùng"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {getSupportTypeLabel(caseItem.supportType)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {(caseItem.supportType === "money" ||
                              caseItem.supportType === "both") &&
                            caseItem.targetAmount > 0
                              ? formatCurrency(caseItem.targetAmount)
                              : "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {(caseItem.supportType === "items" ||
                            caseItem.supportType === "both") &&
                          caseItem.neededItems &&
                          caseItem.neededItems.length > 0 ? (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                              {caseItem.neededItems.length} vật phẩm
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Không có
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">
                            {caseItem.createdAt &&
                              formatDate(caseItem.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveHandler(caseItem._id)}
                              className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => openRejectModal(caseItem)}
                              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                            >
                              Từ chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Modal từ chối */}
      {showModal && selectedCase && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Từ chối hoàn cảnh
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Bạn đang từ chối hoàn cảnh:{" "}
                  <strong>{selectedCase?.title}</strong>
                </p>
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Lý do từ chối <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reason"
                    rows="4"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nhập lý do từ chối hoàn cảnh này..."
                  ></textarea>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={rejectHandler}
                >
                  Xác nhận từ chối
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingCasesScreen;
