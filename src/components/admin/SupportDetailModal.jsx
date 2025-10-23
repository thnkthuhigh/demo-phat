import React from "react";
import { Link } from "react-router-dom";

const formatDateTime = (d) =>
  new Date(d).toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const SupportDetailModal = ({ isOpen, onClose, support, onViewImages }) => {
  if (!isOpen || !support) return null;

  const hasItems = support.items && support.items.length > 0;
  const hasAmount = support.amount && support.amount > 0;

  return (
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Chi tiết ủng hộ</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Người ủng hộ */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin người ủng hộ</h4>
            {support.anonymous ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ẩn danh</p>
                  <p className="text-sm text-gray-500">Người ủng hộ yêu cầu ẩn danh</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img 
                  src={support.user?.avatar || "https://via.placeholder.com/48"} 
                  alt={support.user?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{support.user?.name}</p>
                  <p className="text-sm text-gray-500">{support.user?.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Hoàn cảnh */}
          {support.case && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Hoàn cảnh được hỗ trợ</h4>
              <Link 
                to={`/case/${support.case._id}`}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                {support.case.title}
              </Link>
            </div>
          )}

          {/* Loại hỗ trợ */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Tiền */}
            {hasAmount && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Số tiền ủng hộ</h4>
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <p className="text-2xl font-bold text-green-700">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(support.amount)}
                  </p>
                </div>
                {support.paymentMethod && (
                  <p className="text-xs text-gray-600 mt-2">
                    Phương thức: <span className="font-semibold">{support.paymentMethod}</span>
                  </p>
                )}
              </div>
            )}

            {/* Vật phẩm */}
            {hasItems && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Vật phẩm ủng hộ</h4>
                <div className="space-y-2">
                  {support.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-800">{item.name}</span>
                      <span className="font-semibold text-blue-700">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lời nhắn */}
          {support.message && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Lời nhắn</h4>
              <p className="text-gray-800 italic">"{support.message}"</p>
            </div>
          )}

          {/* Thời gian */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Thời gian tạo:</p>
              <p className="font-semibold text-gray-900">{formatDateTime(support.createdAt)}</p>
            </div>
            {support.statusHistory?.find((h) => h.status === "completed") && (
              <div>
                <p className="text-gray-600">Thời gian duyệt:</p>
                <p className="font-semibold text-gray-900">
                  {formatDateTime(support.statusHistory.find((h) => h.status === "completed").updatedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Ghi chú admin */}
          {support.adminNote && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Ghi chú của admin</h4>
              <p className="text-gray-800">{support.adminNote}</p>
            </div>
          )}

          {/* Minh chứng */}
          {support.proofImages && support.proofImages.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Ảnh minh chứng ({support.proofImages.length})
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {support.proofImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => onViewImages(support.proofImages, idx)}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors group"
                  >
                    <img 
                      src={img.url} 
                      alt={`Minh chứng ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transaction ID */}
          {support.transactionId && (
            <div className="text-sm">
              <p className="text-gray-600">Mã giao dịch:</p>
              <p className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">
                {support.transactionId}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportDetailModal;
