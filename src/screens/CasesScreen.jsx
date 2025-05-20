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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Tất cả hoàn cảnh</h1>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Tìm hoàn cảnh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-l-md"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-r-md"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : !cases || cases.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center shadow-sm">
          <p className="text-gray-600 mb-4">Không tìm thấy hoàn cảnh nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cases.map((caseItem) => (
              <div
                key={caseItem._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={
                      caseItem.situationImages &&
                      caseItem.situationImages.length > 0
                        ? caseItem.situationImages[0]
                        : "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={caseItem.title}
                    className="w-full h-full object-cover"
                  />
                  {caseItem.featured && (
                    <div className="absolute top-3 left-0 bg-amber-500 text-white px-3 py-1 text-xs font-semibold shadow-md rounded-r-lg flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Nổi bật
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2">
                    <Link
                      to={`/case/${caseItem._id}`}
                      className="text-gray-900 hover:text-indigo-600"
                    >
                      {caseItem.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {caseItem.description}
                  </p>

                  {/* Hiển thị tiến độ quyên góp */}
                  <div className="mb-4">{renderProgress(caseItem)}</div>

                  <Link
                    to={`/case/${caseItem._id}`}
                    className="inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center mt-8 mb-12">
              <nav className="flex items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                >
                  Trước
                </button>

                {[...Array(pages).keys()].map((x) => (
                  <button
                    key={x + 1}
                    onClick={() => setCurrentPage(x + 1)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === x + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                  >
                    {x + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, pages))
                  }
                  disabled={currentPage === pages}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === pages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                >
                  Tiếp
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
