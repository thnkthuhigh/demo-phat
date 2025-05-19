import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { fetchFeaturedCases, fetchCases } from "../store/actions/caseActions";
import CaseCard from "../components/cases/CaseCard";
import Loader from "../components/shared/Loader";
import Message from "../components/shared/Message";

const HomeScreen = () => {
  const dispatch = useDispatch();

  const { featuredCases, loading: loadingFeatured } = useSelector(
    (state) => state.cases
  );
  const {
    cases,
    loading: loadingCases,
    error,
  } = useSelector((state) => state.cases);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchFeaturedCases());
    dispatch(fetchCases("", 1)); // Get first page of cases
  }, [dispatch]);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="bg-indigo-700 rounded-lg shadow-xl text-white py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Kết nối yêu thương, lan tỏa nhân ái
          </h1>
          <p className="text-xl mb-8">
            Chung tay giúp đỡ những hoàn cảnh khó khăn, mỗi đóng góp nhỏ sẽ tạo
            nên những thay đổi lớn trong cuộc sống của những người cần sự giúp
            đỡ.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link
              to="/create-case"
              className="bg-white text-indigo-700 hover:bg-indigo-100 px-6 py-3 rounded-md font-bold text-lg transition-colors"
            >
              Tạo hoàn cảnh
            </Link>
            <a
              href="#featured-cases"
              className="bg-indigo-600 hover:bg-indigo-800 border border-white px-6 py-3 rounded-md font-bold text-lg transition-colors"
            >
              Khám phá hoàn cảnh
            </a>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {stats ? stats.totalCases.toLocaleString() : "0"}
            </div>
            <div className="text-gray-600">Hoàn cảnh được hỗ trợ</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {stats ? stats.totalDonors.toLocaleString() : "0"}
            </div>
            <div className="text-gray-600">Nhà hảo tâm</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {stats ? `${(stats.totalDonated / 1000000).toFixed(1)}M` : "0"}{" "}
              VNĐ
            </div>
            <div className="text-gray-600">Tổng số tiền ủng hộ</div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm hoàn cảnh..."
              className="w-full p-4 pl-12 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cases */}
      <section id="featured-cases" className="py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Hoàn cảnh cần giúp đỡ
        </h2>

        {loadingFeatured ? (
          <Loader />
        ) : featuredCases && featuredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCases.map((caseItem) => (
              <CaseCard key={caseItem._id} caseItem={caseItem} />
            ))}
          </div>
        ) : (
          <Message>Không có hoàn cảnh nổi bật</Message>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/cases"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Xem tất cả hoàn cảnh
          </Link>
        </div>
      </section>

      {/* Recent cases section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Hoàn cảnh gần đây</h2>

        {loadingCases ? (
          <Loader />
        ) : error ? (
          <Message variant="error">{error}</Message>
        ) : cases && cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem._id} caseItem={caseItem} />
            ))}
          </div>
        ) : (
          <Message>Không tìm thấy hoàn cảnh nào</Message>
        )}
      </div>

      {/* How It Works */}
      <section className="py-10 bg-gray-50 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Quy trình hoạt động
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Tạo hoàn cảnh</h3>
              <p className="text-gray-600">
                Chia sẻ câu chuyện và nhu cầu cần giúp đỡ của bạn hoặc người
                quen.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Nhận ủng hộ</h3>
              <p className="text-gray-600">
                Cộng đồng sẽ quyên góp để giúp đỡ hoàn cảnh của bạn.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Cập nhật tiến trình
              </h3>
              <p className="text-gray-600">
                Chia sẻ kết quả và sự thay đổi sau khi nhận được sự giúp đỡ.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
