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
  const [searchTerm, setSearchTerm] = useState("");

  const { loading, error, cases, pages } = useSelector((state) => state.cases);

  useEffect(() => {
    dispatch(fetchCases({ page: currentPage, keyword: searchTerm, category }));
  }, [dispatch, currentPage, searchTerm, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    dispatch(fetchCases({ page: 1, keyword: searchTerm, category }));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header với background gradient */}
      <div className="mb-10 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Tất cả hoàn cảnh
            </h1>
            <p className="text-gray-600">
              Khám phá và hỗ trợ những hoàn cảnh khó khăn
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            {/* Category filter - Thiết kế đẹp hơn */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Search form - Thiết kế đẹp hơn */}
            <form onSubmit={handleSearch} className="flex flex-1">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
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
                  className="pl-10 pr-4 py-2.5 block w-full border border-gray-300 rounded-l-lg focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-r-lg shadow-sm transition-all duration-200 flex items-center"
              >
                <span>Tìm</span>
              </button>
            </form>
          </div>
        </div>
      </div>

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
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Xem tất cả
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Grid card với hiệu ứng hover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {cases.map((caseItem) => (
              <div
                key={caseItem._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100"
              >
                {/* Phần hình ảnh với hiệu ứng zoom khi hover */}
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={
                      caseItem.situationImages &&
                      caseItem.situationImages.length > 0
                        ? caseItem.situationImages[0]
                        : "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={caseItem.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlay cho phần dưới hình ảnh */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent opacity-60"></div>

                  {/* Featured badge với hiệu ứng glow */}
                  {caseItem.featured && (
                    <div className="absolute top-3 left-0 bg-gradient-to-r from-amber-500 to-amber-400 text-white px-4 py-1 text-xs font-semibold shadow-md rounded-r-full flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>Nổi bật</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        caseItem.status === "active"
                          ? "bg-green-100 text-green-800"
                          : caseItem.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
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

                {/* Phần nội dung */}
                <div className="p-6">
                  {/* Tiêu đề với hiệu ứng màu khi hover */}
                  <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    <Link to={`/case/${caseItem._id}`}>{caseItem.title}</Link>
                  </h3>

                  {/* Mô tả với giới hạn dòng */}
                  <p className="text-gray-600 text-sm mb-5 line-clamp-2 h-10">
                    {caseItem.description}
                  </p>

                  {/* Thanh tiến độ tài trợ với animation */}
                  <div className="mb-6 space-y-3">
                    {(caseItem.supportType === "money" ||
                      caseItem.supportType === "both") && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">
                            {formatCurrency(caseItem.currentAmount)}
                          </span>
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                            {Math.round(
                              (caseItem.currentAmount / caseItem.targetAmount) *
                                100
                            )}
                            %
                          </span>
                          <span className="text-gray-500">
                            {formatCurrency(caseItem.targetAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2.5 rounded-full relative"
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
                          >
                            <div className="absolute inset-0 bg-stripes animate-progress"></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                          <span>
                            <svg
                              className="w-3.5 h-3.5 inline mr-1 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                              />
                            </svg>
                            {caseItem.supportCount || 0} lượt ủng hộ
                          </span>
                          <span>
                            <svg
                              className="w-3.5 h-3.5 inline mr-1 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {getRemainingDays(caseItem.endDate)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Hiển thị tiến độ vật phẩm */}
                    {(caseItem.supportType === "items" ||
                      caseItem.supportType === "both") &&
                      caseItem.neededItems &&
                      caseItem.neededItems.length > 0 && (
                        <div
                          className={
                            caseItem.supportType === "both"
                              ? "mt-3 pt-3 border-t border-gray-100"
                              : ""
                          }
                        >
                          {caseItem.supportType === "both" && (
                            <p className="text-sm font-medium mb-1.5">
                              Vật phẩm:
                            </p>
                          )}
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full relative"
                              style={{
                                width: `${calculateItemsProgress(
                                  caseItem.neededItems
                                )}%`,
                              }}
                            >
                              <div className="absolute inset-0 bg-stripes animate-progress"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>
                              {countReceivedItems(caseItem.neededItems)} vật
                              phẩm đã nhận
                            </span>
                            <span>
                              {countTotalItems(caseItem.neededItems)} vật phẩm
                              cần
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Nút hành động */}
                  <div className="flex justify-center">
                    <Link
                      to={`/case/${caseItem._id}`}
                      className="inline-block w-full text-center bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-0.5"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination với thiết kế hiện đại */}
          {pages > 1 && (
            <div className="flex justify-center mt-10 mb-16">
              <nav className="flex items-center bg-white px-2 py-1.5 rounded-lg shadow-sm">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`mx-1 px-4 py-2 rounded-md flex items-center transition-colors ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Trước</span>
                </button>

                <div className="hidden sm:flex">
                  {[...Array(pages).keys()].map((x) => {
                    // Hiển thị giới hạn số trang nếu có nhiều trang
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
                          className={`mx-1 px-4 py-2 rounded-md font-medium transition-all ${
                            currentPage === x + 1
                              ? "bg-indigo-600 text-white"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
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
                        <span
                          key={x + 1}
                          className="mx-1 px-2 py-2 text-gray-500 self-center"
                        >
                          ...
                        </span>
                      );
                    } else {
                      return null;
                    }
                  })}
                </div>

                <div className="sm:hidden">
                  <span className="px-3 py-2 text-gray-700">
                    {currentPage} / {pages}
                  </span>
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, pages))
                  }
                  disabled={currentPage === pages}
                  className={`mx-1 px-4 py-2 rounded-md flex items-center transition-colors ${
                    currentPage === pages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <span>Tiếp</span>
                  <svg
                    className="w-5 h-5 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CasesScreen;
