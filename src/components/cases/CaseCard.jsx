import React from 'react';
import { Link } from 'react-router-dom';

const CaseCard = ({ caseItem }) => {
  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((caseItem.currentAmount / caseItem.targetAmount) * 100),
    100
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Determine status color
  let statusColor = 'bg-gray-500';
  if (caseItem.status === 'active') {
    statusColor = 'bg-green-500';
  } else if (caseItem.status === 'completed') {
    statusColor = 'bg-blue-500';
  } else if (caseItem.status === 'cancelled') {
    statusColor = 'bg-red-500';
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link to={`/case/${caseItem._id}`}>
          <img
            src={caseItem.images && caseItem.images.length > 0 ? caseItem.images[0] : 'https://via.placeholder.com/400x200'}
            alt={caseItem.title}
            className="w-full h-48 object-cover"
          />
        </Link>
        {caseItem.featured && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 text-xs font-semibold rounded">
            Nổi bật
          </div>
        )}
        <div className={`absolute top-2 right-2 ${statusColor} text-white px-2 py-1 text-xs font-semibold rounded`}>
          {caseItem.status === 'active' && 'Đang vận động'}
          {caseItem.status === 'completed' && 'Hoàn thành'}
          {caseItem.status === 'pending' && 'Chờ duyệt'}
          {caseItem.status === 'cancelled' && 'Đã hủy'}
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
            <span className="text-indigo-600 font-semibold">{progressPercentage}%</span>
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
            <span className="font-semibold text-indigo-600">{formatCurrency(caseItem.currentAmount)}</span> / {formatCurrency(caseItem.targetAmount)}
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
            <span className="text-sm text-gray-600">{caseItem.user?.name || "Người tạo"}</span>
          </div>
          <span className="text-sm text-gray-500">{caseItem.supportCount} lượt ủng hộ</span>
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