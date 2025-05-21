import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchFeaturedCases,
  fetchHomeStats,
} from "../features/cases/caseActions";
import Loader from "../components/shared/Loader";
import Message from "../components/shared/Message";

const HomeScreen = () => {
  const dispatch = useDispatch();

  // Get the featured cases and home stats from the Redux store
  const {
    cases: featuredCases,
    loading,
    error,
    homeStats,
  } = useSelector((state) => state.cases);

  useEffect(() => {
    // Fetch the featured cases and home stats
    dispatch(fetchFeaturedCases());
    dispatch(fetchHomeStats());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  console.log("Featured cases state:", {
    featuredCases,
    loading,
    error,
    homeStats,
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section với gradient và hình ảnh nền thực tế */}
      <div className="relative rounded-xl overflow-hidden mb-12 bg-gradient-to-r from-indigo-700 to-indigo-500">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        ></div>
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
                <span className="block text-white">Chung tay giúp đỡ</span>
                <span className="block text-yellow-300 mt-2">
                  những hoàn cảnh khó khăn
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg md:text-xl text-white text-opacity-90 max-w-2xl mx-auto lg:mx-0">
                Mỗi đóng góp nhỏ của bạn đều có thể tạo nên sự thay đổi lớn
                trong cuộc sống của những người cần sự giúp đỡ.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <a
                  href="/cases"
                  className="transform transition-transform hover:scale-105 inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-indigo-700 bg-white hover:bg-gray-100 hover:shadow-lg md:text-lg"
                >
                  Xem các hoàn cảnh
                </a>
                <a
                  href="/about"
                  className="transform transition-transform hover:scale-105 inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 hover:shadow-lg md:text-lg"
                >
                  Tìm hiểu thêm
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 sm:py-16 rounded-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl relative inline-block">
              Chúng ta đã cùng nhau làm được
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Nhờ sự đóng góp của cộng đồng, chúng ta đã tạo nên những thay đổi
              tích cực
            </p>
          </div>
          <dl className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <dt className="text-lg leading-6 font-medium text-gray-500">
                Đã quyên góp
              </dt>
              <dd className="mt-2 text-4xl font-extrabold text-indigo-600 counter-animation">
                {formatCurrency(homeStats?.totalDonated || 0)}
              </dd>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <dt className="text-lg leading-6 font-medium text-gray-500">
                Nhà hảo tâm
              </dt>
              <dd className="mt-2 text-4xl font-extrabold text-indigo-600 counter-animation">
                {homeStats?.totalDonors ? `${homeStats.totalDonors}+` : "0"}
              </dd>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <dt className="text-lg leading-6 font-medium text-gray-500">
                Hoàn cảnh đã giúp đỡ
              </dt>
              <dd className="mt-2 text-4xl font-extrabold text-indigo-600 counter-animation">
                {homeStats?.totalCases || "0"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Featured Cases Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Hoàn cảnh nổi bật</h2>
          <Link
            to="/cases"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Xem tất cả
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <>
            <Message variant="error">{error}</Message>
            <p className="text-sm text-gray-500 mt-2">
              Debug info: {JSON.stringify(error)}
            </p>
          </>
        ) : !featuredCases || featuredCases.length === 0 ? (
          <>
            <Message>Không có hoàn cảnh nổi bật</Message>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng đánh dấu một số hoàn cảnh là nổi bật trong trang quản
              trị.
            </p>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCases.slice(0, 6).map((caseItem) => (
              <div
                key={caseItem._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={
                      caseItem.situationImages?.[0] ||
                      "https://via.placeholder.com/300"
                    }
                    alt={caseItem.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {caseItem.featured && (
                    <div className="absolute top-3 left-0 bg-gradient-to-r from-amber-500 to-amber-400 text-white px-4 py-1 text-xs font-semibold shadow-md rounded-r-full flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>Nổi bật</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    <Link to={`/case/${caseItem._id}`}>{caseItem.title}</Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {caseItem.description}
                  </p>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full relative overflow-hidden"
                        style={{
                          width: `${Math.min(
                            Math.round(
                              (caseItem.currentAmount / caseItem.targetAmount) *
                                100
                            ),
                            100
                          )}%`,
                        }}
                      >
                        <span className="absolute inset-0 opacity-50 bg-stripes"></span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="font-medium">
                        {formatCurrency(caseItem.currentAmount)}
                      </span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {Math.round(
                          (caseItem.currentAmount / caseItem.targetAmount) * 100
                        )}
                        %
                      </span>
                      <span className="font-medium text-gray-500">
                        {formatCurrency(caseItem.targetAmount)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/case/${caseItem._id}`}
                    className="inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm hover:shadow"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-50 rounded-lg shadow-sm p-8 mb-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bạn muốn giúp đỡ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Hãy tham gia cùng chúng tôi để mang đến những điều tốt đẹp cho cuộc
            sống của những người đang khó khăn, hoạn nạn.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/cases"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md"
            >
              Ủng hộ ngay
            </Link>
            <Link
              to="/contact"
              className="bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-600 font-medium py-3 px-6 rounded-md"
            >
              Liên hệ với chúng tôi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
