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
      {/* Hero Section */}
      <div className="relative bg-indigo-600 rounded-lg shadow-lg overflow-hidden mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Chung tay giúp đỡ</span>{" "}
                  <span className="block text-yellow-400 xl:inline">
                    những hoàn cảnh khó khăn
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Mỗi đóng góp nhỏ của bạn đều có thể tạo nên sự thay đổi lớn
                  trong cuộc sống của những người cần sự giúp đỡ.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/cases"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"
                    >
                      Xem các hoàn cảnh
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/about"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 md:py-4 md:text-lg md:px-10"
                    >
                      Tìm hiểu thêm
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full bg-indigo-400 opacity-20">
            {/* Hero background pattern */}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-6 sm:py-8 lg:py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Chúng ta đã cùng nhau làm được
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Nhờ sự đóng góp của cộng đồng, chúng ta đã tạo nên những thay đổi
              tích cực
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Đã quyên góp
              </dt>
              <dd className="order-1 text-3xl font-extrabold text-indigo-600">
                {homeStats?.totalDonated ? (
                  formatCurrency(homeStats.totalDonated)
                ) : loading ? (
                  <Loader size="small" />
                ) : (
                  "0 VNĐ"
                )}
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Nhà hảo tâm
              </dt>
              <dd className="order-1 text-3xl font-extrabold text-indigo-600">
                {homeStats?.totalDonors ? (
                  `${homeStats.totalDonors}+`
                ) : loading ? (
                  <Loader size="small" />
                ) : (
                  "0"
                )}
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Hoàn cảnh đã giúp đỡ
              </dt>
              <dd className="order-1 text-3xl font-extrabold text-indigo-600">
                {homeStats?.totalCases ? (
                  homeStats.totalCases
                ) : loading ? (
                  <Loader size="small" />
                ) : (
                  "0"
                )}
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
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={
                      caseItem.situationImages &&
                      caseItem.situationImages.length > 0
                        ? caseItem.situationImages[0]
                        : "https://via.placeholder.com/300"
                    }
                    alt={caseItem.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {caseItem.featured && (
                    <div className="absolute top-3 left-0 bg-amber-500 text-white px-3 py-1 text-xs font-semibold shadow-md rounded-r-lg flex items-center gap-1">
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
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2">
                    <Link
                      to={`/case/${caseItem._id}`}
                      className="text-gray-900 hover:text-indigo-600"
                    >
                      {caseItem.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {caseItem.description}
                  </p>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            Math.round(
                              (caseItem.currentAmount / caseItem.targetAmount) *
                                100
                            ),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="font-medium">
                        {formatCurrency(caseItem.currentAmount)}
                      </span>
                      <span className="text-gray-500">
                        {Math.round(
                          (caseItem.currentAmount / caseItem.targetAmount) * 100
                        )}
                        %
                      </span>
                      <span className="font-medium">
                        {formatCurrency(caseItem.targetAmount)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/case/${caseItem._id}`}
                    className="inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
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
