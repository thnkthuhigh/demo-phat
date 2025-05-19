import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { fetchCaseDetails } from '../store/actions/caseActions';
import Loader from '../components/shared/Loader';
import Message from '../components/shared/Message';

const CaseDetailScreen = () => {
  const { id: caseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { caseDetails, loading, error } = useSelector((state) => state.cases);
  const { userInfo } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('description');
  const [recentSupports, setRecentSupports] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch case details
    dispatch(fetchCaseDetails(caseId));

    // Initialize socket connection
    const socketInit = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(socketInit);

    // Join case room for real-time updates
    socketInit.emit('join_case', caseId);

    // Clean up socket connection when component unmounts
    return () => {
      socketInit.emit('leave_case', caseId);
      socketInit.disconnect();
    };
  }, [dispatch, caseId]);

  useEffect(() => {
    // If case details are loaded, initialize recent supports from API response
    if (caseDetails && caseDetails.recentSupports) {
      setRecentSupports(caseDetails.recentSupports);
    }
  }, [caseDetails]);

  useEffect(() => {
    // Listen for new support events
    if (socket) {
      socket.on('new_support', (newSupport) => {
        setRecentSupports((prevSupports) => [newSupport, ...prevSupports.slice(0, 9)]);
      });
    }
  }, [socket]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category) => {
    const categories = {
      medical: 'Y tế',
      education: 'Giáo dục',
      disaster: 'Thiên tai',
      animal: 'Động vật',
      environmental: 'Môi trường',
      community: 'Cộng đồng',
      other: 'Khác',
    };
    return categories[category] || 'Khác';
  };

  const handleSupportClick = () => {
    if (!userInfo) {
      navigate(`/login?redirect=support/${caseId}`);
    } else {
      navigate(`/support/${caseId}`);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="error">{error}</Message>;
  }

  if (!caseDetails) {
    return <Message>Không tìm thấy hoàn cảnh</Message>;
  }

  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((caseDetails.currentAmount / caseDetails.targetAmount) * 100),
    100
  );

  // Check if user is the owner
  const isOwner = userInfo && caseDetails.user && userInfo._id === caseDetails.user._id;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Status badge */}
      <div className="mb-6">
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${
            caseDetails.status === 'active'
              ? 'bg-green-100 text-green-800'
              : caseDetails.status === 'completed'
              ? 'bg-blue-100 text-blue-800'
              : caseDetails.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {caseDetails.status === 'active' && 'Đang vận động'}
          {caseDetails.status === 'completed' && 'Hoàn thành'}
          {caseDetails.status === 'pending' && 'Chờ duyệt'}
          {caseDetails.status === 'cancelled' && 'Đã hủy'}
        </span>
        
        {caseDetails.featured && (
          <span className="ml-2 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
            Nổi bật
          </span>
        )}
        
        <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
          {getCategoryLabel(caseDetails.category)}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{caseDetails.title}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column - Images and details */}
        <div className="lg:w-8/12">
          {/* Main image */}
          {caseDetails.images && caseDetails.images.length > 0 ? (
            <div className="mb-6">
              <img
                src={caseDetails.images[0]}
                alt={caseDetails.title}
                className="w-full h-96 object-cover rounded-lg"
              />

              {/* Thumbnail images (if more than one) */}
              {caseDetails.images.length > 1 && (
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {caseDetails.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`${caseDetails.title} - ${index + 1}`}
                        className="w-full h-20 object-cover rounded cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 bg-gray-200 h-96 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Không có hình ảnh</span>
            </div>
          )}

          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chi tiết hoàn cảnh
              </button>
              {caseDetails.updates && caseDetails.updates.length > 0 && (
                <button
                  onClick={() => setActiveTab('updates')}
                  className={`pb-4 font-medium text-sm ${
                    activeTab === 'updates'
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Cập nhật ({caseDetails.updates.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('supporters')}
                className={`pb-4 font-medium text-sm ${
                  activeTab === 'supporters'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Người ủng hộ
              </button>
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{caseDetails.description}</p>
              
              {caseDetails.location && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900">Địa điểm</h3>
                  <p>{caseDetails.location}</p>
                </div>
              )}
              
              {caseDetails.contactInfo && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900">Thông tin liên hệ</h3>
                  <p>{caseDetails.contactInfo}</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'updates' && caseDetails.updates && (
            <div className="space-y-6">
              {caseDetails.updates.map((update, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="font-semibold text-lg">{update.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">{formatDate(update.date)}</p>
                  <p className="whitespace-pre-line">{update.content}</p>
                  
                  {update.images && update.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {update.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`Hình ảnh cập nhật ${index + 1}`}
                          className="rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'supporters' && (
            <div>
              {recentSupports && recentSupports.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentSupports.map((support) => (
                    <li key={support._id} className="py-4 flex">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={support.user.avatar || "https://via.placeholder.com/40"}
                        alt={support.user.name}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {support.user.name}
                        </p>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">
                            Đã ủng hộ {formatCurrency(support.amount)}
                          </p>
                          <span className="mx-1 text-gray-500">•</span>
                          <p className="text-sm text-gray-500">
                            {new Date(support.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        {support.message && (
                          <p className="mt-1 text-sm text-gray-600">{support.message}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có người ủng hộ</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - Support info */}
        <div className="lg:w-4/12">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sticky top-4">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <h3 className="font-semibold text-gray-700">
                  {formatCurrency(caseDetails.currentAmount)}
                </h3>
                <span className="text-gray-600">
                  {progressPercentage}% của {formatCurrency(caseDetails.targetAmount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600">
                  {caseDetails.supportCount} lượt ủng hộ
                </span>
                {caseDetails.endDate && (
                  <span className="text-gray-600">
                    Hết hạn: {formatDate(caseDetails.endDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Support button */}
            {caseDetails.status === 'active' && (
              <button
                onClick={handleSupportClick}
                className="w-full py-3 bg-indigo-600 text-white rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Ủng hộ ngay
              </button>
            )}

            {/* Edit case button (for owner or admin) */}
            {isOwner && (
              <Link
                to={`/edit-case/${caseId}`}
                className="mt-3 w-full block text-center py-3 bg-white border border-indigo-600 text-indigo-600 rounded-md text-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                Chỉnh sửa
              </Link>
            )}

            {/* Creator info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-gray-700 font-semibold mb-4">Thông tin người tạo</h3>
              <div className="flex items-center">
                <img
                  src={caseDetails.user?.avatar || "https://via.placeholder.com/40"}
                  alt={caseDetails.user?.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="ml-4">
                  <Link 
                    to={`/user/${caseDetails.user?._id}`}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    {caseDetails.user?.name}
                  </Link>
                  {caseDetails.user?.email && (
                    <p className="text-gray-600 text-sm">
                      <a href={`mailto:${caseDetails.user.email}`} className="hover:underline">
                        {caseDetails.user.email}
                      </a>
                    </p>
                  )}
                </div>
              </div>
              {caseDetails.user?.phone && (
                <p className="mt-2 text-gray-600 text-sm">
                  Điện thoại: {caseDetails.user.phone}
                </p>
              )}
            </div>

            {/* Share buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-gray-700 font-semibold mb-4">Chia sẻ</h3>
              <div className="flex space-x-4">
                <button className="flex items-center text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                  <span>Facebook</span>
                </button>
                <button className="flex items-center text-sky-500 hover:bg-sky-50 px-3 py-2 rounded-md">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                  </svg>
                  <span>Twitter</span>
                </button>
              </div>
            </div>

            {/* Report link */}
            <div className="mt-6 text-center">
              <button className="text-red-500 text-sm hover:underline">
                Báo cáo hoàn cảnh này
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailScreen;