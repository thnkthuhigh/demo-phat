import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom"; // Thêm useOutletContext
import { useSelector } from "react-redux";
import Loader from "../../components/shared/Loader";
import Message from "../../components/shared/Message";
import axios from "axios";
import { toggleCaseFeature } from "../../services/caseService"; // Import the service function

const AdminCaseListScreen = () => {
  // Lấy giá trị từ context nếu cần
  const { pendingCases = 0 } = useOutletContext() || {};
  const { userInfo } = useSelector((state) => state.auth);

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        let url = `/api/cases?page=${currentPage}`;
        if (filterStatus !== "all") {
          url += `&status=${filterStatus}`;
        }

        const { data } = await axios.get(url, config);
        setCases(data.cases);
        setTotalPages(data.pages);
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
      fetchCases();
    }
  }, [userInfo, currentPage, filterStatus, refresh]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            Đang vận động
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            Hoàn thành
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
            Chờ duyệt
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
            Không xác định
          </span>
        );
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        await axios.delete(`/api/cases/${deleteId}`, config);
        setShowDeleteModal(false);
        setDeleteId(null);
        setRefresh(!refresh); // Trigger reloading the data
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        );
      }
    }
  };

  const handleToggleFeatured = async (id, featured) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(`/api/admin/cases/${id}/featured`, {}, config);
      setRefresh(!refresh);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  };

  const handleApproveCase = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(`/api/admin/cases/${id}/approve`, {}, config);
      setRefresh(!refresh);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  };

  const handleRejectCase = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(`/api/admin/cases/${id}/reject`, {}, config);
      setRefresh(!refresh);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  };

  const calculateItemsProgress = (neededItems) => {
    if (!neededItems || neededItems.length === 0) return 0;
    const totalItems = neededItems.length;
    const receivedItems = neededItems.filter(
      (item) => item.status === "received"
    ).length;
    return (receivedItems / totalItems) * 100;
  };

  const countReceivedItems = (neededItems) => {
    if (!neededItems || neededItems.length === 0) return 0;
    return neededItems.filter((item) => item.status === "received").length;
  };

  const countTotalItems = (neededItems) => {
    if (!neededItems || neededItems.length === 0) return 0;
    return neededItems.length;
  };

  const handleToggleFeature = async (id) => {
    try {
      await toggleCaseFeature(id);
      // Refresh the cases list
      dispatch(listCases());
      toast.success("Cập nhật trạng thái nổi bật thành công");
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái nổi bật");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý hoàn cảnh</h1>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-md py-1 px-3 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="active">Đang vận động</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <Link
            to="/admin/case/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tạo hoàn cảnh mới
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hoàn cảnh
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Người tạo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Trạng thái
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tiến độ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ngày tạo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((caseItem) => (
                  <tr key={caseItem._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={
                              caseItem.situationImages &&
                              caseItem.situationImages.length > 0
                                ? caseItem.situationImages[0]
                                : "https://via.placeholder.com/40"
                            }
                            alt={caseItem.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link
                              to={`/case/${caseItem._id}`}
                              className="hover:text-indigo-600"
                            >
                              {caseItem.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(caseItem.currentAmount)} /{" "}
                            {formatCurrency(caseItem.targetAmount)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {caseItem.user?.name || "Không rõ"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {caseItem.user?.email || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusLabel(caseItem.status)}
                      {caseItem.featured && (
                        <span className="ml-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                          Nổi bật
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(caseItem.supportType === "money" ||
                        caseItem.supportType === "both") && (
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  Math.round(
                                    (caseItem.currentAmount /
                                      caseItem.targetAmount) *
                                      100
                                  ),
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round(
                              (caseItem.currentAmount / caseItem.targetAmount) *
                                100
                            )}
                            % - {formatCurrency(caseItem.currentAmount)}
                          </div>
                        </div>
                      )}

                      {(caseItem.supportType === "items" ||
                        caseItem.supportType === "both") &&
                        caseItem.neededItems &&
                        caseItem.neededItems.length > 0 && (
                          <div
                            className={
                              caseItem.supportType === "both" ? "mt-2" : ""
                            }
                          >
                            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
                              <div
                                className="bg-green-500 h-2.5 rounded-full"
                                style={{
                                  width: `${calculateItemsProgress(
                                    caseItem.neededItems
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {calculateItemsProgress(caseItem.neededItems)}% -{" "}
                              {countReceivedItems(caseItem.neededItems)}/
                              {countTotalItems(caseItem.neededItems)} vật phẩm
                            </div>
                          </div>
                        )}

                      {caseItem.supportCount > 0 && (
                        <div className="text-xs text-gray-500 mt-2">
                          {caseItem.supportCount} lượt ủng hộ
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(caseItem.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {caseItem.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveCase(caseItem._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Phê duyệt
                            </button>
                            <button
                              onClick={() => handleRejectCase(caseItem._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        <h
                          onClick={() =>
                            handleToggleFeatured(
                              caseItem._id,
                              caseItem.featured
                            )
                          }
                          className={`${
                            caseItem.featured
                              ? "text-amber-600 hover:text-amber-900"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {caseItem.featured
                            ? "Bỏ nổi bật"
                            : "Đánh dấu nổi bật"}
                        </h>
                        <button
                          onClick={() => handleToggleFeature(caseItem._id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            caseItem.featured
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          disabled={loading}
                        >
                          {caseItem.featured ? (
                            <span className="flex items-center">
                              <svg
                                className="w-3.5 h-3.5 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Đã nổi bật
                            </span>
                          ) : (
                            "Đánh dấu nổi bật"
                          )}
                        </button>
                        <Link
                          to={`/admin/case/${caseItem._id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(caseItem._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 pb-6">
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Phân trang"
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Trước
                </button>

                {[...Array(totalPages).keys()].map((x) => (
                  <button
                    key={x + 1}
                    onClick={() => setCurrentPage(x + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === x + 1
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {x + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? "text-gray-300"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Tiếp
                </button>
              </nav>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Xác nhận xóa
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa hoàn cảnh này? Hành động này không
                  thể hoàn tác.
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCaseListScreen;
