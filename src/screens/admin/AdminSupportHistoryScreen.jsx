import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Loader from "../../components/shared/Loader";
import Message from "../../components/shared/Message";
import ImageViewerModal from "../../components/shared/ImageViewerModal";
import SupportDetailModal from "../../components/admin/SupportDetailModal";

const formatDateTime = (d) =>
  new Date(d).toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminSupportHistoryScreen = () => {
  const { userInfo } = useSelector((s) => s.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [caseSearch, setCaseSearch] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/supports?page=${page}&status=completed`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setItems(data.supports || []);
        setPages(data.pages || 1);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo?.isAdmin) fetchData();
  }, [userInfo, page]);

  // Filter items
  const filteredItems = items.filter((item) => {
    // Search by user name
    if (searchTerm && !item.anonymous) {
      const userName = item.user?.name?.toLowerCase() || "";
      if (!userName.includes(searchTerm.toLowerCase())) return false;
    }
    
    // Search by case title
    if (caseSearch) {
      const caseTitle = item.case?.title?.toLowerCase() || "";
      if (!caseTitle.includes(caseSearch.toLowerCase())) return false;
    }
    
    // Filter by amount range
    if (minAmount && item.amount < parseFloat(minAmount)) return false;
    if (maxAmount && item.amount > parseFloat(maxAmount)) return false;
    
    // Filter by date range
    const itemDate = new Date(item.statusHistory?.find((h) => h.status === "completed")?.updatedAt || item.updatedAt);
    if (dateFrom && itemDate < new Date(dateFrom)) return false;
    if (dateTo && itemDate > new Date(dateTo + "T23:59:59")) return false;
    
    return true;
  });

  const handleViewImages = (images, index = 0) => {
    setSelectedImages(images);
    setInitialImageIndex(index);
    setImageModalOpen(true);
  };

  const handleViewDetail = (support) => {
    setSelectedSupport(support);
    setDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCaseSearch("");
    setMinAmount("");
    setMaxAmount("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Lịch sử ủng hộ</h2>
          <p className="text-gray-600 text-sm">Xem lại các khoản ủng hộ đã được xác nhận</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Bộ lọc tìm kiếm</h3>
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Đặt lại
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search by user name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên người ủng hộ
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search by case */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hoàn cảnh
            </label>
            <input
              type="text"
              value={caseSearch}
              onChange={(e) => setCaseSearch(e.target.value)}
              placeholder="Tìm theo hoàn cảnh..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date from */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Min amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền từ (đ)
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Max amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền đến (đ)
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="999,999,999"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Filter results count */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{filteredItems.length}</span> / {items.length} kết quả
          </p>
        </div>
      </div>

      {error && <Message variant="error">{error}</Message>}
      
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <Loader />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">
            {items.length === 0 ? "Chưa có dữ liệu lịch sử ủng hộ" : "Không tìm thấy kết quả phù hợp"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian duyệt</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người ủng hộ</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hoàn cảnh</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại hỗ trợ</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minh chứng</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((sp) => (
                  <tr key={sp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(sp.statusHistory?.find((h) => h.status === "completed")?.updatedAt || sp.updatedAt)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {sp.anonymous ? (
                        <span className="italic text-gray-500 text-sm">Ẩn danh</span>
                      ) : (
                        <div className="flex items-center">
                          <img className="w-8 h-8 rounded-full mr-3" src={sp.user?.avatar || "https://via.placeholder.com/32"} alt="" />
                          <span className="text-sm font-medium text-gray-900">{sp.user?.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900 line-clamp-2 max-w-xs">{sp.case?.title}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {sp.items && sp.items.length > 0 ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {sp.items.length} vật phẩm
                          </span>
                        </div>
                      ) : sp.amount > 0 ? (
                        <span className="text-sm font-semibold text-green-600">
                          {sp.amount.toLocaleString("vi-VN")} đ
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {(sp.proofImages?.length || 0) > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {(sp.proofImages || []).slice(0, 3).map((p, i) => (
                            <button
                              key={i}
                              onClick={() => handleViewImages(sp.proofImages, i)}
                              className="block group relative"
                            >
                              <img 
                                src={p.url} 
                                className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-colors" 
                                alt="" 
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                            </button>
                          ))}
                          {(sp.proofImages?.length || 0) > 3 && (
                            <button
                              onClick={() => handleViewImages(sp.proofImages, 3)}
                              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center transition-colors"
                            >
                              <span className="text-xs text-gray-600 font-medium">+{sp.proofImages.length - 3}</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Không có</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleViewDetail(sp)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 flex justify-end gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trang trước
            </button>
            <span className="px-2 py-1 text-sm">{page}/{pages}</span>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        images={selectedImages}
        initialIndex={initialImageIndex}
      />

      {/* Support Detail Modal */}
      <SupportDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        support={selectedSupport}
        onViewImages={handleViewImages}
      />
    </div>
  );
};

export default AdminSupportHistoryScreen;