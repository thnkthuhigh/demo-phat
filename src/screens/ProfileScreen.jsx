import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { updateUserProfile } from "../slices/authSlice";

const ProfileScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [bio, setBio] = useState("");

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || "");
      setEmail(userInfo.email || "");
      setAvatar(userInfo.avatar || "");
      setPhone(userInfo.phone || "");
      setAddress(userInfo.address || "");
      setGender(userInfo.gender || "");
      setBankAccount(userInfo.bankAccount || "");
      setBankName(userInfo.bankName || "");
      setFacebookLink(userInfo.socialLinks?.facebook || "");
      setTwitterLink(userInfo.socialLinks?.twitter || "");
      setInstagramLink(userInfo.socialLinks?.instagram || "");
      setBio(userInfo.bio || "");
    }
  }, [userInfo]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post("/api/upload", formData, config);

      setAvatar(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/users/profile",
        {
          name,
          email,
          password: password || undefined,
          avatar,
          phone,
          address,
          gender,
          bankAccount,
          bankName,
          socialLinks: {
            facebook: facebookLink,
            twitter: twitterLink,
            instagram: instagramLink,
          },
          bio,
        },
        config
      );

      dispatch(updateUserProfile(data));
      setMessage("Cập nhật thông tin thành công");
      toast.success("Thông tin cá nhân đã được cập nhật");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : "Cập nhật thông tin thất bại";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <form onSubmit={submitHandler} className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0 md:pr-8">
              <div className="flex flex-col items-center">
                <div className="relative group w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 mb-4">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          name
                        )}&background=random&size=200`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="text-white cursor-pointer text-center p-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Thay đổi ảnh đại diện
                      <input
                        type="file"
                        onChange={uploadFileHandler}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>

                {uploading && (
                  <div className="mb-4 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-500">
                      Đang tải ảnh...
                    </span>
                  </div>
                )}

                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-gray-500 text-sm">{email}</p>

                <div className="mt-6 w-full">
                  <h3 className="text-md font-medium mb-2">Giới thiệu</h3>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Viết vài điều về bản thân..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên ngân hàng
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Vietcombank, BIDV,..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tài khoản ngân hàng
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="px-3 text-gray-500">facebook.com/</span>
                    <input
                      type="text"
                      value={facebookLink}
                      onChange={(e) => setFacebookLink(e.target.value)}
                      className="flex-1 px-0 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="px-3 text-gray-500">twitter.com/</span>
                    <input
                      type="text"
                      value={twitterLink}
                      onChange={(e) => setTwitterLink(e.target.value)}
                      className="flex-1 px-0 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="px-3 text-gray-500">instagram.com/</span>
                    <input
                      type="text"
                      value={instagramLink}
                      onChange={(e) => setInstagramLink(e.target.value)}
                      className="flex-1 px-0 py-2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t mt-6 pt-6">
                <h3 className="text-md font-medium mb-4">Đổi mật khẩu</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Để trống nếu không đổi"
                      minLength="6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Để trống nếu không đổi"
                      minLength="6"
                    />
                  </div>
                </div>
              </div>

              {message && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <p className="text-green-700">{message}</p>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật thông tin"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileScreen;
