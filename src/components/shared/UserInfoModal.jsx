import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "./Loader";
import { DEFAULT_AVATAR } from "../../utils/constants";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const UserInfoModal = ({ isOpen, onClose, userId }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserInfo();
    }
  }, [isOpen, userId]);

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/users/${userId}`);
      setUserInfo(data);
    } catch (err) {
      setError("Không thể tải thông tin người dùng");
      console.error("Error fetching user info:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Thông tin người dùng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader size="small" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : userInfo ? (
            <div className="space-y-6">
              {/* Avatar và tên */}
              <div className="text-center">
                <img
                  src={userInfo.avatar || DEFAULT_AVATAR}
                  alt={userInfo.name}
                  className="h-20 w-20 rounded-full mx-auto mb-3"
                />
                <h3 className="text-lg font-semibold text-gray-900">
                  {userInfo.name}
                </h3>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      onClose?.();
                      navigate(`/user/${userId}`);
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Xem chi tiết
                  </button>
                </div>
                {userInfo.bio && (
                  <p className="text-gray-600 text-sm mt-2 italic">
                    "{userInfo.bio}"
                  </p>
                )}
              </div>

              {/* Thống kê */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Thống kê</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {userInfo.supportCount}
                    </p>
                    <p className="text-sm text-gray-600">Lượt ủng hộ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(userInfo.totalSupported)}
                    </p>
                    <p className="text-sm text-gray-600">Tổng đã ủng hộ</p>
                  </div>
                </div>
              </div>

              {/* Thông tin cá nhân */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin cá nhân</h4>
                <div className="space-y-2 text-sm">
                  {userInfo.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giới tính:</span>
                      <span className="text-gray-900">
                        {userInfo.gender === "male" ? "Nam" : 
                         userInfo.gender === "female" ? "Nữ" : "Khác"}
                      </span>
                    </div>
                  )}
                  {userInfo.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Địa chỉ:</span>
                      <span className="text-gray-900 text-right max-w-[200px]">
                        {userInfo.address}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tham gia:</span>
                    <span className="text-gray-900">
                      {formatDate(userInfo.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liên kết xã hội */}
              {userInfo.socialLinks && Object.keys(userInfo.socialLinks).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Liên kết xã hội</h4>
                  <div className="space-y-2">
                    {userInfo.socialLinks.facebook && (
                      <a
                        href={userInfo.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                    )}
                    {userInfo.socialLinks.twitter && (
                      <a
                        href={userInfo.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-600 text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter
                      </a>
                    )}
                    {userInfo.socialLinks.instagram && (
                      <a
                        href={userInfo.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-pink-600 hover:text-pink-800 text-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.98-.49-.98-.98s.49-.98.98-.98.98.49.98.98-.49.98-.98.98zm-1.297 9.281c-1.297 0-2.448-.49-3.323-1.297-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                        </svg>
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t">
          <button
            onClick={() => {
              onClose?.();
              navigate(`/user/${userId}`);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Xem chi tiết
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
