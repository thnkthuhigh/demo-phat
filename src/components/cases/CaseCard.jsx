import React, { useState } from "react";
import { Link } from "react-router-dom";

const CaseCard = ({ caseItem }) => {
  // Add a state to track image loading errors
  const [imageError, setImageError] = useState(false);

  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((caseItem.currentAmount / caseItem.targetAmount) * 100),
    100
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Determine status color
  let statusColor = "bg-gray-500";
  if (caseItem.status === "active") {
    statusColor = "bg-green-500";
  } else if (caseItem.status === "completed") {
    statusColor = "bg-blue-500";
  } else if (caseItem.status === "cancelled") {
    statusColor = "bg-red-500";
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link to={`/case/${caseItem._id}`}>
          <img
            src={
              imageError
                ? "/images/fallback-image.jpg"
                : caseItem.situationImages &&
                  caseItem.situationImages.length > 0
                ? caseItem.situationImages[0]
                : "https://via.placeholder.com/400x200"
            }
            alt={caseItem.title}
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
        </Link>
        {caseItem.featured && (
          <div className="absolute top-3 left-0 bg-amber-500 text-white px-3 py-1 text-xs font-semibold shadow-md rounded-r-lg flex items-center gap-1 transform -translate-y-1/2">
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
        <div
          className={`absolute top-2 right-2 ${statusColor} text-white px-2 py-1 text-xs font-semibold rounded`}
        >
          {caseItem.status === "active" && "Đang vận động"}
          {caseItem.status === "completed" && "Hoàn thành"}
          {caseItem.status === "pending" && "Chờ duyệt"}
          {caseItem.status === "cancelled" && "Đã hủy"}
        </div>
      </div>

      <div className="p-4">
        <Link to={`/case/${caseItem._id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-indigo-600 transition-colors line-clamp-2">
            {caseItem.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {caseItem.description}
        </p>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Tiến độ</span>
            <span className="text-indigo-600 font-semibold">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span>
            <span className="font-semibold text-indigo-600">
              {formatCurrency(caseItem.currentAmount)}
            </span>{" "}
            / {formatCurrency(caseItem.targetAmount)}
          </span>
          {caseItem.endDate && (
            <span>Hết hạn: {formatDate(caseItem.endDate)}</span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={caseItem.user?.avatar || "https://via.placeholder.com/40"}
              alt={caseItem.user?.name || "Người tạo"}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600">
              {caseItem.user?.name || "Người tạo"}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {caseItem.supportCount} lượt ủng hộ
          </span>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Link
          to={`/case/${caseItem._id}`}
          className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default CaseCard;
