import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchCases } from "../features/cases/caseActions";
import Loader from "../components/shared/Loader";
import Message from "../components/shared/Message";

const CasesScreen = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState("");
  const [supportType, setSupportType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const { loading, error, cases, pages } = useSelector((state) => state.cases);

  useEffect(() => {
    dispatch(
      fetchCases({
        page: currentPage,
        keyword: searchTerm,
        category,
        supportType,
      })
    );
  }, [dispatch, currentPage, searchTerm, category, supportType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(
      fetchCases({ page: 1, keyword: searchTerm, category, supportType })
    );
  };

  const openItemsModal = (items) => {
    setSelectedItems(items);
    setShowItemsModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const categories = [
    { value: "", label: "Tất cả" },
    { value: "medical", label: "Y tế" },
    { value: "education", label: "Giáo dục" },
    { value: "disaster", label: "Thiên tai" },
    { value: "animal", label: "Động vật" },
    { value: "environmental", label: "Môi trường" },
    { value: "community", label: "Cộng đồng" },
    { value: "other", label: "Khác" },
  ];

  const renderProgress = (caseItem) => {
    return (
      <div className="space-y-2">
        {/* Tiến độ quyên góp tiền */}
        {(caseItem.supportType === "money" ||
          caseItem.supportType === "both") && (
          <div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatCurrency(caseItem.currentAmount)}</span>
              <span>{formatCurrency(caseItem.targetAmount)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    Math.round(
                      (caseItem.currentAmount / caseItem.targetAmount) * 100
                    ),
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Tiến độ vật phẩm */}
        {(caseItem.supportType === "items" ||
          caseItem.supportType === "both") &&
          caseItem.neededItems &&
          caseItem.neededItems.length > 0 && (
            <div>
              {caseItem.supportType === "both" && (
                <p className="text-xs text-gray-500 mt-1 mb-1">Vật phẩm:</p>
              )}

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${calculateItemsProgress(caseItem.neededItems)}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {countReceivedItems(caseItem.neededItems)} vật phẩm đã nhận
                </span>
                <span>
                  {countTotalItems(caseItem.neededItems)} vật phẩm cần
                </span>
              </div>
            </div>
          )}
      </div>
    );
  };

  // Thêm các hàm helper sau vào component
  const calculateItemsProgress = (items) => {
    if (!items || items.length === 0) return 0;

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const receivedQuantity = items.reduce(
      (sum, item) => sum + (item.receivedQuantity || 0),
      0
    );

    return Math.min(Math.round((receivedQuantity / totalQuantity) * 100), 100);
  };

  const countTotalItems = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const countReceivedItems = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
  };

  // Thêm hàm này vào component để hiển thị thời gian còn lại
  const getRemainingDays = (endDate) => {
    if (!endDate) return "Không có hạn";

    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Đã hết hạn";
    if (diffDays === 0) return "Còn hôm nay";
    if (diffDays === 1) return "Còn 1 ngày";
    return `Còn ${diffDays} ngày`;
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header Section - Enhanced */}
      <div className="bg-gradient-to-br from-red-50 via-white to-red-50 py-12">
        <div className="max-w-full px-8 lg:px-32 xl:px-40">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Tất cả hoàn cảnh
            </h1>
            <p className="text-lg text-gray-700">
              Khám phá và hỗ trợ những hoàn cảnh khó khăn
            </p>
          </div>

          {/* Filters - Enhanced Design */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-red-200 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Category filter */}
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border-2 border-red-200 rounded-2xl bg-white text-gray-700 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-red-400"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Support Type filter */}
              <select
                value={supportType}
                onChange={(e) => {
                  setSupportType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 border-2 border-red-200 rounded-2xl bg-white text-gray-700 text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-red-400"
              >
                <option value="">Tất cả loại hỗ trợ</option>
                <option value="money">Quyên góp tiền</option>
                <option value="items">Hỗ trợ vật phẩm</option>
                <option value="both">Cả hai</option>
              </select>

              {/* Search form */}
              <form onSubmit={handleSearch} className="flex flex-1">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm hoàn cảnh..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 block w-full border-2 border-red-200 rounded-l-2xl text-sm font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-red-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-r-2xl transition-all shadow-lg hover:shadow-xl text-sm"
                >
                  Tìm
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full px-8 lg:px-32 xl:px-40 py-12">

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-red-100">
          <svg
            className="w-12 h-12 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Đã xảy ra lỗi
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : !cases || cases.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-gray-100">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy hoàn cảnh nào
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Không có hoàn cảnh nào phù hợp với tìm kiếm của bạn. Hãy thử tìm
            kiếm với từ khóa khác hoặc xem tất cả hoàn cảnh.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm("");
                setCategory("");
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Xem tất cả
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Cases Grid - Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {cases.map((caseItem) => (
              <div
                key={caseItem._id}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-red-400 transform hover:-translate-y-2 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={
                      caseItem.situationImages?.[0] || "https://via.placeholder.com/400x300"
                    }
                    alt={caseItem.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Featured Badge */}
                  {caseItem.featured && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Nổi bật
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold shadow-lg ${
                        caseItem.status === "active"
                          ? "bg-red-500 text-white"
                          : caseItem.status === "completed"
                          ? "bg-red-600 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {caseItem.status === "active"
                        ? "Đang vận động"
                        : caseItem.status === "completed"
                        ? "Hoàn thành"
                        : caseItem.status === "pending"
                        ? "Chờ duyệt"
                        : "Đã hủy"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <Link to={`/case/${caseItem._id}`}>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors leading-tight min-h-[3.5rem]">
                      {caseItem.title}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {caseItem.description}
                  </p>

                  {/* Progress Section */}
                  <div className="space-y-3 mb-4 flex-grow">
                    {/* Money Progress */}
                    {(caseItem.supportType === "money" || caseItem.supportType === "both") && (
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-xl font-extrabold text-gray-900">{formatCurrency(caseItem.currentAmount)}</span>
                          <span className="text-xs text-gray-500 font-medium">
                            / {formatCurrency(caseItem.targetAmount)}
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(Math.round((caseItem.currentAmount / caseItem.targetAmount) * 100), 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 mt-2">
                          <span className="inline-flex items-center font-medium">
                            <svg className="w-3.5 h-3.5 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {caseItem.supportCount || 0} lượt
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                            {Math.min(Math.round((caseItem.currentAmount / caseItem.targetAmount) * 100), 100)}% đạt được
                          </span>
                          <span className="inline-flex items-center font-medium">
                            <svg className="w-3.5 h-3.5 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {getRemainingDays(caseItem.endDate)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Items Progress */}
                    {(caseItem.supportType === "items" || caseItem.supportType === "both") &&
                      caseItem.neededItems?.length > 0 && (
                        <div className={caseItem.supportType === "both" ? "pt-3 border-t border-gray-100" : ""}>
                          {caseItem.supportType === "both" && (
                            <p className="text-xs font-bold text-gray-700 mb-2">Vật phẩm cần hỗ trợ</p>
                          )}
                          
                          {/* Hiển thị danh sách vật phẩm */}
                          <div className="space-y-2 mb-3">
                            {caseItem.neededItems.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-gray-800 truncate flex-1 mr-2">
                                  {item.name}
                                </span>
                                <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                                  <span className="text-red-500">{item.receivedQuantity || 0}</span>
                                  <span className="text-gray-400 mx-1">/</span>
                                  <span>{item.quantity}</span>
                                </span>
                              </div>
                            ))}
                            {caseItem.neededItems.length > 2 && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  openItemsModal(caseItem.neededItems);
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline flex items-center gap-1"
                              >
                                <span>+{caseItem.neededItems.length - 2} vật phẩm khác</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Progress bar tổng */}
                          <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500"
                              style={{
                                width: `${calculateItemsProgress(caseItem.neededItems)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1.5 font-medium">
                            <span>{countReceivedItems(caseItem.neededItems)} đã nhận</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                              {calculateItemsProgress(caseItem.neededItems)}% đạt được
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Action Button - Luôn ở cuối */}
                  <div className="mt-auto">
                    <Link
                      to={`/case/${caseItem._id}`}
                      className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                    >
                      Ủng hộ ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Enhanced */}
          {pages > 1 && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-xl border-2 border-red-200">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl font-bold transition-all ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1.5">
                  {[...Array(pages).keys()].map((x) => {
                    if (
                      pages <= 7 ||
                      x + 1 === 1 ||
                      x + 1 === pages ||
                      (x + 1 >= currentPage - 1 && x + 1 <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={x + 1}
                          onClick={() => setCurrentPage(x + 1)}
                          className={`min-w-[2.5rem] h-10 rounded-xl font-bold text-sm transition-all ${
                            currentPage === x + 1
                              ? "bg-red-600 text-white shadow-lg scale-110"
                              : "text-gray-700 hover:bg-red-50"
                          }`}
                        >
                          {x + 1}
                        </button>
                      );
                    } else if (
                      (x + 1 === currentPage - 2 && currentPage > 3) ||
                      (x + 1 === currentPage + 2 && currentPage < pages - 2)
                    ) {
                      return (
                        <span key={x + 1} className="px-1.5 text-gray-400 font-bold text-sm">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pages))}
                  disabled={currentPage === pages}
                  className={`p-2 rounded-xl font-bold transition-all ${
                    currentPage === pages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>

      {/* Modal hiển thị danh sách vật phẩm đầy đủ */}
      {showItemsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-red-200">
              <h3 className="text-xl font-bold text-gray-900">Danh sách vật phẩm cần hỗ trợ</h3>
              <button
                onClick={() => setShowItemsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {selectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-bold text-gray-600">
                        <span className="text-xl text-red-500">{item.receivedQuantity || 0}</span>
                        <span className="text-gray-400 mx-2">/</span>
                        <span className="text-xl text-gray-900">{item.quantity}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {Math.round(((item.receivedQuantity || 0) / item.quantity) * 100)}% đạt được
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t-2 border-red-200 bg-gray-50 rounded-b-3xl">
              <button
                onClick={() => setShowItemsModal(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasesScreen;
