import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchTopSupporters } from "../store/actions/supportActions";

const SupportersRankScreen = () => {
  const dispatch = useDispatch();
  const { topSupporters, loading, error } = useSelector(
    (state) => state.support
  );
  const [timeFilter, setTimeFilter] = useState("all"); // all, month, week

  useEffect(() => {
    dispatch(fetchTopSupporters(timeFilter));
  }, [dispatch, timeFilter]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Bảng xếp hạng người ủng hộ
      </h1>

      {/* Filter tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setTimeFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-300`}
          >
            Tất cả thời gian
          </button>
          <button
            onClick={() => setTimeFilter("month")}
            className={`px-4 py-2 text-sm font-medium ${
              timeFilter === "month"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border-t border-b border-gray-300`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setTimeFilter("week")}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeFilter === "week"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-300`}
          >
            Tuần này
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {/* Top 3 supporters with special styling */}
          <div className="flex flex-col md:flex-row justify-center items-end space-y-4 md:space-y-0 md:space-x-6 mb-10">
            {topSupporters &&
              topSupporters.slice(0, 3).map((supporter, index) => {
                const position = index + 1;
                let heightClass = "h-28";
                let positionClass = "bg-gray-200";

                if (position === 1) {
                  heightClass = "h-36";
                  positionClass = "bg-yellow-400";
                } else if (position === 2) {
                  heightClass = "h-32";
                  positionClass = "bg-gray-300";
                } else if (position === 3) {
                  positionClass = "bg-amber-600";
                }

                return (
                  <div
                    key={supporter._id}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={`${positionClass} rounded-full w-10 h-10 flex items-center justify-center font-bold text-gray-800 mb-2`}
                    >
                      {position}
                    </div>
                    <div
                      className={`bg-indigo-600 w-24 ${heightClass} rounded-t-lg flex items-center justify-center px-2`}
                    >
                      <div className="text-center">
                        <Link to={`/user/${supporter.userId}`}>
                          <div className="w-16 h-16 mx-auto mb-2">
                            <img
                              src={
                                supporter.userAvatar ||
                                "https://via.placeholder.com/150"
                              }
                              alt={supporter.userName}
                              className="w-full h-full rounded-full object-cover border-2 border-white"
                            />
                          </div>
                          <h3 className="text-white font-medium truncate">
                            {supporter.userName}
                          </h3>
                        </Link>
                        <p className="text-white text-sm font-bold">
                          {(supporter.totalAmount / 1000000).toFixed(1)}M VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Rest of supporters list */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hạng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Người ủng hộ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số tiền ủng hộ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số lần ủng hộ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSupporters &&
                  topSupporters.slice(3).map((supporter, index) => (
                    <tr key={supporter._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 4}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={
                                supporter.userAvatar ||
                                "https://via.placeholder.com/150"
                              }
                              alt={supporter.userName}
                            />
                          </div>
                          <div className="ml-4">
                            <Link
                              to={`/user/${supporter.userId}`}
                              className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                            >
                              {supporter.userName}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {supporter.totalAmount.toLocaleString()} VNĐ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {supporter.supportCount} lần
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {topSupporters && topSupporters.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Chưa có dữ liệu người ủng hộ
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SupportersRankScreen;
