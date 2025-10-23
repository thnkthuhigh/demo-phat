// components/case/CreatorModal.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_AVATAR } from "../../utils/constants";

const CreatorModal = ({
  creatorDetails,
  formatDate,
  formatCurrency,
  onClose,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  // Thêm log để debug
  useEffect(() => {
    console.log("CreatorModal received data:", creatorDetails);
  }, [creatorDetails]);

  // Thêm kiểm tra đầy đủ
  if (!creatorDetails) {
    console.log("No creator details provided to modal");
    return null;
  }

  // Thêm fallback cho các hàm format
  const safeFormatDate = (date) => {
    if (!formatDate) {
      console.warn("formatDate function not provided");
      return new Date(date).toLocaleDateString();
    }
    try {
      return formatDate(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date(date).toLocaleDateString();
    }
  };

  const safeFormatCurrency = (amount) => {
    if (!formatCurrency) {
      console.warn("formatCurrency function not provided");
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
      }).format(amount || 0);
    }
    try {
      return formatCurrency(amount || 0);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return amount?.toLocaleString() || "0";
    }
  };

  // Hàm định dạng giới tính
  const formatGender = (gender) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "other":
        return "Khác";
      default:
        return "Không xác định";
    }
  };

  // Khởi tạo dữ liệu mặc định từ props
  const defaultDetails = {
    name: creatorDetails?.name || "Không xác định",
    avatar: creatorDetails?.avatar || DEFAULT_AVATAR,
    createdAt: creatorDetails?.createdAt || new Date(),
    totalSupported: creatorDetails?.totalSupported || 0,
    supportCount: creatorDetails?.supportCount || 0,
    email: creatorDetails?.email || "",
    phone: creatorDetails?.phone || "",
    address: creatorDetails?.address || "",
    gender: creatorDetails?.gender || "",
    bankName: creatorDetails?.bankName || "",
    bankAccount: creatorDetails?.bankAccount || "",
    bio: creatorDetails?.bio || "",
    socialLinks: creatorDetails?.socialLinks || {},
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Thông tin người tạo
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {isLoading ? (
            // Hiển thị skeleton loader khi đang tải
            <div className="animate-pulse">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="h-5 w-32 bg-gray-200 rounded mt-3"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mt-2"></div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-3 h-16 rounded-lg"></div>
                  <div className="bg-gray-100 p-3 h-16 rounded-lg"></div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg h-32"></div>
                <div className="bg-gray-100 p-4 rounded-lg h-24"></div>
              </div>
            </div>
          ) : (
            // Hiển thị dữ liệu thực khi đã tải xong
            <>
              {/* Avatar và tên */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src={defaultDetails.avatar}
                  alt={defaultDetails.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                  onError={(e) => {
                    console.warn("Avatar loading failed, using default");
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
                <h4 className="text-lg font-semibold mt-3">
                  {defaultDetails.name}
                </h4>
                {creatorDetails?._id && (
                  <button
                    onClick={() => {
                      onClose?.();
                      navigate(`/user/${creatorDetails._id}`);
                    }}
                    className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Xem chi tiết
                  </button>
                )}
                <p className="text-gray-500 text-sm">
                  Tham gia từ{" "}
                  {defaultDetails.createdAt
                    ? safeFormatDate(defaultDetails.createdAt)
                    : "không xác định"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Đã ủng hộ</p>
                    <p className="font-bold text-indigo-600">
                      {safeFormatCurrency(defaultDetails.totalSupported)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Số lần ủng hộ</p>
                    <p className="font-bold text-green-600">
                      {defaultDetails.supportCount}
                    </p>
                  </div>
                </div>

                {/* Thông tin cá nhân */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h5 className="font-medium text-gray-700">
                    Thông tin cá nhân
                  </h5>

                  {/* Hiển thị thông báo nếu không có thông tin cá nhân */}
                  {!defaultDetails.gender &&
                  !defaultDetails.email &&
                  !defaultDetails.phone &&
                  !defaultDetails.address ? (
                    <p className="text-sm text-gray-500 text-center py-1">
                      Chưa có thông tin cá nhân
                    </p>
                  ) : (
                    <>
                      {/* Giới tính */}
                      {defaultDetails.gender && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Giới tính:</span>
                          <span className="font-medium">
                            {formatGender(defaultDetails.gender)}
                          </span>
                        </div>
                      )}

                      {/* Email */}
                      {defaultDetails.email && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium break-all">
                            {defaultDetails.email}
                          </span>
                        </div>
                      )}

                      {/* Số điện thoại */}
                      {defaultDetails.phone && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="font-medium">
                            {defaultDetails.phone}
                          </span>
                        </div>
                      )}

                      {/* Địa chỉ */}
                      {defaultDetails.address && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Địa chỉ:</span>
                          <span className="font-medium">
                            {defaultDetails.address}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Thông tin ngân hàng */}
                {defaultDetails.bankName || defaultDetails.bankAccount ? (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h5 className="font-medium text-gray-700">
                      Thông tin ngân hàng
                    </h5>

                    {/* Tên ngân hàng */}
                    {defaultDetails.bankName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ngân hàng:</span>
                        <span className="font-medium">
                          {defaultDetails.bankName}
                        </span>
                      </div>
                    )}

                    {/* Số tài khoản */}
                    {defaultDetails.bankAccount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Số tài khoản:</span>
                        <span className="font-medium">
                          {defaultDetails.bankAccount}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-700 mb-2">
                      Thông tin ngân hàng
                    </h5>
                    <p className="text-sm text-gray-500 text-center">
                      Chưa có thông tin ngân hàng
                    </p>
                  </div>
                )}

                {/* Giới thiệu */}
                {defaultDetails.bio && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">
                      Giới thiệu
                    </h5>
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                      {defaultDetails.bio}
                    </p>
                  </div>
                )}

                {/* Mạng xã hội */}
                {(defaultDetails.socialLinks?.facebook ||
                  defaultDetails.socialLinks?.twitter ||
                  defaultDetails.socialLinks?.instagram) && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Mạng xã hội
                    </h5>
                    <div className="flex space-x-3">
                      {defaultDetails.socialLinks?.facebook && (
                        <a
                          href={`https://www.facebook.com/${defaultDetails.socialLinks.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                          </svg>
                        </a>
                      )}
                      {defaultDetails.socialLinks?.twitter && (
                        <a
                          href={`https://x.com/${defaultDetails.socialLinks.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                          </svg>
                        </a>
                      )}
                      {defaultDetails.socialLinks?.instagram && (
                        <a
                          href={`https://www.instagram.com/${defaultDetails.socialLinks.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.977.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.977-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorModal;
