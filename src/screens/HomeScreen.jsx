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

  // ============================================
  // HƯỚNG DẪN THAY ĐỔI ẢNH BACKGROUND
  // ============================================
  // Cách 1: Dùng ảnh từ Internet (URL)
  const heroBackgroundImage = "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop";
  
  // Cách 2: Dùng ảnh từ thư mục uploads trong project
  // const heroBackgroundImage = "/uploads/ten-anh-cua-ban.jpg";
  // Lưu ý: Copy ảnh vào thư mục uploads ở root project
  
  // Cách 3: Dùng ảnh từ thư mục public (nếu có)
  // const heroBackgroundImage = "/images/hero-background.jpg";
  // Lưu ý: Tạo thư mục public/images và copy ảnh vào đó
  
  // Gợi ý: Nên dùng ảnh có kích thước lớn (tối thiểu 1920x1080) để đẹp
  // ============================================

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
    <div className="min-h-screen bg-red-50">
      {/* Hero Section - Enhanced with Background Image */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackgroundImage})` }}
        >
          {/* Overlay màu đen nhẹ để text dễ đọc và ảnh vẫn đẹp */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="max-w-full px-8 lg:px-32 xl:px-40 py-16 md:py-20 relative z-10">
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-5">
              {/* Left Red Cross */}
              <div className="flex-shrink-0 hidden md:block">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
                </svg>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-2xl">
                Chung tay{" "}
                <span className="text-red-500">
                  giúp đỡ
                </span>
                <br />
                những hoàn cảnh khó khăn
              </h1>
              
              {/* Right Red Cross */}
              <div className="flex-shrink-0 hidden md:block">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" />
                </svg>
              </div>
            </div>
            
            <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-8 leading-relaxed drop-shadow-lg">
              Mỗi đóng góp nhỏ của bạn đều có thể tạo nên sự thay đổi lớn trong cuộc sống của những người cần sự giúp đỡ
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/cases"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-red-600 hover:bg-red-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <svg className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Ủng hộ ngay
              </Link>
              <Link
                to="/about"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-white/20 backdrop-blur-sm border-2 border-white hover:bg-white hover:text-red-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                Tìm hiểu thêm
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Light Effects */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-red-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Stats Section - Enhanced */}
      <div className="py-16 bg-gradient-to-br from-[#FFE8E8] via-[#FFF0F0] to-[#FFE8E8]">
        <div className="max-w-full px-8 lg:px-32 xl:px-40">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              Chúng ta đã làm được
            </h2>
            <p className="text-lg text-gray-700">
              Những con số ấn tượng từ cộng đồng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-400 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-red-400">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 text-white mb-5 shadow-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Đã quyên góp</p>
                <p className="text-3xl font-extrabold text-gray-900 mb-2">
                  {formatCurrency(homeStats?.totalDonated || 0)}
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-red-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-red-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white mb-5 shadow-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nhà hảo tâm</p>
                <p className="text-3xl font-extrabold text-gray-900 mb-2">
                  {homeStats?.totalDonors ? `${homeStats.totalDonors}+` : "0"}
                </p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-red-600">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white mb-5 shadow-lg">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Hoàn cảnh đã giúp</p>
                <p className="text-3xl font-extrabold text-gray-900 mb-2">
                  {homeStats?.totalCases || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Cases Section - Enhanced */}
      <div className="py-16 bg-red-50">
        <div className="max-w-full px-8 lg:px-32 xl:px-40">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                Hoàn cảnh nổi bật
              </h2>
              <p className="text-lg text-gray-700">Những hoàn cảnh đang cần sự giúp đỡ</p>
            </div>
            <Link
              to="/cases"
              className="group inline-flex items-center text-red-600 hover:text-red-700 font-bold text-base transition-colors"
            >
              Xem tất cả
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          ) : !featuredCases || featuredCases.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có hoàn cảnh nổi bật</h3>
              <p className="text-gray-600">Vui lòng quay lại sau</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCases.slice(0, 6).map((caseItem) => (
                <div
                  key={caseItem._id}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-transparent hover:border-red-400 transform hover:-translate-y-2"
                >
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={caseItem.situationImages?.[0] || "https://via.placeholder.com/400x300"}
                      alt={caseItem.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    {caseItem.featured && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 backdrop-blur-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Nổi bật
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <Link to={`/case/${caseItem._id}`}>
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors leading-tight">
                        {caseItem.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {caseItem.description}
                    </p>
                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xl font-extrabold text-gray-900">
                          {formatCurrency(caseItem.currentAmount)}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          / {formatCurrency(caseItem.targetAmount)}
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500 shadow-lg"
                          style={{
                            width: `${Math.min(
                              Math.round((caseItem.currentAmount / caseItem.targetAmount) * 100),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
                          {Math.round((caseItem.currentAmount / caseItem.targetAmount) * 100)}% đạt được
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/case/${caseItem._id}`}
                      className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Ủng hộ ngay
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section - Enhanced */}
      <div className="py-16 bg-white">
        <div className="max-w-full px-8 lg:px-32 xl:px-40">
          <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-5 leading-tight">
                Bạn muốn giúp đỡ?
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                Hãy tham gia cùng chúng tôi để mang đến những điều tốt đẹp cho cuộc sống của những người đang cần sự giúp đỡ
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/cases"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl bg-white text-red-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Ủng hộ ngay
                </Link>
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-2xl text-white border-3 border-white hover:bg-white hover:text-red-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Liên hệ với chúng tôi
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
