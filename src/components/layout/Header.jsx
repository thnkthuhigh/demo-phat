import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../slices/authSlice";

const DEFAULT_AVATAR = "https://via.placeholder.com/40";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const logoutHandler = () => {
    dispatch(logoutUser());
    localStorage.removeItem("userInfo");
    navigate("/");
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="bg-[#4FA3E3] shadow-lg">
      <div className="max-w-full px-4 sm:px-6 lg:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">
                TặngTặng
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <Link
              to="/"
              className="px-4 py-2 text-white hover:text-[#E8F4FB] font-medium transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              to="/cases"
              className="px-4 py-2 text-white hover:text-[#E8F4FB] font-medium transition-colors"
            >
              Hoàn cảnh
            </Link>
            <Link
              to="/supporters-ranking"
              className="px-4 py-2 text-white hover:text-[#E8F4FB] font-medium transition-colors"
            >
              Bảng xếp hạng
            </Link>
            <Link
              to="/create-case"
              className="px-4 py-2 text-white hover:text-[#E8F4FB] font-medium transition-colors"
            >
              Tạo hoàn cảnh
            </Link>
          </nav>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center">
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-2 focus:outline-none text-white hover:text-[#E8F4FB] transition-colors"
                >
                  <img
                    src={userInfo?.avatar || DEFAULT_AVATAR}
                    alt={userInfo?.name}
                    className="h-8 w-8 rounded-full object-cover border-2 border-white"
                    onError={(e) => {
                      console.log(
                        "Avatar load error in header, fallback to default"
                      );
                      e.target.onerror = null;
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                  <span className="font-medium">{userInfo.name}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-[9999] border border-gray-100 overflow-hidden">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F4FB] hover:text-[#007BFF] transition-colors text-left"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/my-cases"
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F4FB] hover:text-[#007BFF] transition-colors text-left"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Hoàn cảnh của tôi
                      </Link>
                      <Link
                        to="/my-supports"
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F4FB] hover:text-[#007BFF] transition-colors text-left"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Lịch sử ủng hộ
                      </Link>
                      {userInfo.isAdmin && (
                        <Link
                          to="/admin"
                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F4FB] hover:text-[#007BFF] transition-colors text-left"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Quản trị
                        </Link>
                      )}
                      <button
                        onClick={logoutHandler}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="px-5 py-2 text-white font-medium hover:text-[#E8F4FB] transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-white text-[#007BFF] rounded-xl font-bold hover:bg-[#E8F4FB] transition-colors shadow-lg"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-2 bg-white border-t border-[#4FA3E3]/20">
          <div className="px-4 space-y-1">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-[#007BFF] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/cases"
              className="block py-2 text-gray-700 hover:text-[#007BFF] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Hoàn cảnh
            </Link>
            <Link
              to="/supporters-ranking"
              className="block py-2 text-gray-700 hover:text-[#007BFF] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Bảng xếp hạng
            </Link>
            <Link
              to="/create-case"
              className="block py-2 text-gray-700 hover:text-[#007BFF] font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Tạo hoàn cảnh
            </Link>

            {userInfo ? (
              <>
                <div className="pt-2 mt-2 border-t border-[#4FA3E3]/20">
                  <div className="flex items-center space-x-3 py-2">
                    <img
                      src={userInfo?.avatar || DEFAULT_AVATAR}
                      alt={userInfo?.name}
                      className="h-8 w-8 rounded-full object-cover border-2 border-[#5CC9B5]"
                      onError={(e) => {
                        console.log(
                          "Avatar load error in header, fallback to default"
                        );
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    <span className="font-medium text-gray-900">{userInfo.name}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-700 hover:text-[#007BFF]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/my-cases"
                    className="block py-2 text-gray-700 hover:text-[#007BFF]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hoàn cảnh của tôi
                  </Link>
                  <Link
                    to="/my-supports"
                    className="block py-2 text-gray-700 hover:text-[#007BFF]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Lịch sử ủng hộ
                  </Link>
                  {userInfo.isAdmin && (
                    <Link
                      to="/admin"
                      className="block py-2 text-gray-700 hover:text-[#007BFF]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 mt-2 border-t border-[#4FA3E3]/20 flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="block py-2 text-center text-[#007BFF] hover:text-[#0277BD] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-center bg-[#007BFF] text-white rounded-xl hover:bg-[#0277BD] font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
