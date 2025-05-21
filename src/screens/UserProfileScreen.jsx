import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { updateUserProfile } from "../features/auth/authActions";
import Loader from "../components/shared/Loader";
import Message from "../components/shared/Message";
import { DEFAULT_AVATAR } from "../utils/constants";

const UserProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  // Thêm state cho upload avatar
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, loading, error, success } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      setName(userInfo.name || "");
      setEmail(userInfo.email || "");
      setPhone(userInfo.phone || "");
      // Đảm bảo đường dẫn avatar đầy đủ
      setAvatar(userInfo.avatar || "");
    }
  }, [navigate, userInfo]);

  // Thêm hàm upload avatar
  const uploadAvatarHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng và kích thước
    const fileType = file.type;
    if (!fileType.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setUploadError("Chỉ chấp nhận file hình ảnh: jpeg, jpg, png, webp");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setUploadError("Kích thước file không được vượt quá 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    setUploadError(null);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Upload file
      const { data } = await axios.post("/api/upload", formData, config);

      // Nếu thành công, lưu đường dẫn avatar đầy đủ
      // Đảm bảo đường dẫn đầy đủ bắt đầu bằng http:// hoặc /
      if (data && data.length > 0) {
        const avatarUrl = data[0];
        console.log("Uploaded avatar URL:", avatarUrl);
        setAvatar(avatarUrl);
      }

      setUploading(false);
    } catch (error) {
      console.error("Avatar upload error:", error);

      setUploadError(
        error.response?.data?.message || "Có lỗi xảy ra khi tải ảnh lên"
      );

      setUploading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Mật khẩu không khớp");
    } else {
      dispatch(
        updateUserProfile({
          name,
          email,
          password: password ? password : undefined,
          phone,
          avatar, // Gửi avatar URL đầy đủ
        })
      );
      setMessage(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

      <div className="bg-white shadow-sm rounded-lg p-6">
        {message && <Message variant="error">{message}</Message>}
        {error && <Message variant="error">{error}</Message>}
        {uploadError && <Message variant="error">{uploadError}</Message>}
        {success && <Message variant="success">Cập nhật thành công</Message>}
        {loading && <Loader />}

        {/* Thêm phần hiển thị và upload avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <img
              src={avatar || DEFAULT_AVATAR}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-2 border-indigo-200"
              onError={(e) => {
                console.log("Avatar load error, using default");
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <label className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
              <input
                type="file"
                id="avatar"
                onChange={uploadAvatarHandler}
                className="hidden"
                accept="image/*"
              />
              Thay đổi ảnh đại diện
            </label>
            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar("")}
                className="ml-2 text-red-500 hover:text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={submitHandler}>
          {/* Các trường form hiện có */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Họ tên
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Email không thể thay đổi
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mật khẩu mới
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Để trống nếu không muốn thay đổi
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={loading || uploading}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileScreen;
