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
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                TặngTặng
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <Link
              to="/"
              className="px-3 py-2 text-gray-700 hover:text-indigo-600"
            >
              Trang chủ
            </Link>
            <Link
              to="/cases"
              className="px-3 py-2 text-gray-700 hover:text-indigo-600"
            >
              Hoàn cảnh
            </Link>
            <Link
              to="/supporters-ranking"
              className="px-3 py-2 text-gray-700 hover:text-indigo-600"
            >
              Bảng xếp hạng
            </Link>
            <Link
              to="/create-case"
              className="px-3 py-2 text-gray-700 hover:text-indigo-600"
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
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={userInfo?.avatar || DEFAULT_AVATAR}
                    alt={userInfo?.name}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      console.log(
                        "Avatar load error in header, fallback to default"
                      );
                      e.target.onerror = null;
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                  <span className="text-gray-700">{userInfo.name}</span>
                  <svg
                    className="w-4 h-4 text-gray-500"
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/my-cases"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Hoàn cảnh của tôi
                      </Link>
                      <Link
                        to="/my-supports"
                        className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Lịch sử ủng hộ
                      </Link>
                      {userInfo.isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-50"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Quản trị
                        </Link>
                      )}
                      <button
                        onClick={logoutHandler}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50"
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
                  className="px-4 py-2 text-indigo-600 font-medium hover:text-indigo-800"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700"
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
              className="text-gray-700 focus:outline-none"
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
        <div className="md:hidden py-2 bg-white border-t border-gray-100">
          <div className="px-4 space-y-1">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/cases"
              className="block py-2 text-gray-700 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Hoàn cảnh
            </Link>
            <Link
              to="/supporters-ranking"
              className="block py-2 text-gray-700 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Bảng xếp hạng
            </Link>
            <Link
              to="/create-case"
              className="block py-2 text-gray-700 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Tạo hoàn cảnh
            </Link>

            {userInfo ? (
              <>
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-3 py-2">
                    <img
                      src={userInfo?.avatar || DEFAULT_AVATAR}
                      alt={userInfo?.name}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        console.log(
                          "Avatar load error in header, fallback to default"
                        );
                        e.target.onerror = null;
                        e.target.src = DEFAULT_AVATAR;
                      }}
                    />
                    <span className="font-medium">{userInfo.name}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-700 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/my-cases"
                    className="block py-2 text-gray-700 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hoàn cảnh của tôi
                  </Link>
                  <Link
                    to="/my-supports"
                    className="block py-2 text-gray-700 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Lịch sử ủng hộ
                  </Link>
                  {userInfo.isAdmin && (
                    <Link
                      to="/admin"
                      className="block py-2 text-gray-700 hover:text-indigo-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="block w-full text-left py-2 text-gray-700 hover:text-indigo-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 mt-2 border-t border-gray-100 flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="block py-2 text-center text-indigo-600 hover:text-indigo-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-center bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
