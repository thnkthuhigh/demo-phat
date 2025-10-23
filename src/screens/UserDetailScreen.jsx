import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Loader from "../components/shared/Loader";
import ItemsModal from "../components/shared/ItemsModal";
import { DEFAULT_AVATAR } from "../utils/constants";

const UserDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [supports, setSupports] = useState([]);
  const [cases, setCases] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [viewMode, setViewMode] = useState("supports"); // supports | cases
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingUser(true);
      setLoadingData(true);
      try {
        const [userRes, supportsRes, casesRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/supports`),
          api.get(`/users/${id}/cases`),
        ]);
        setUser(userRes.data);
        setSupports(supportsRes.data || []);
        setCases(casesRes.data || []);
        
        // Debug logs
        console.log("User supports data:", supportsRes.data);
        supportsRes.data?.forEach((s, idx) => {
          console.log(`Support ${idx}:`, {
            id: s._id,
            amount: s.amount,
            items: s.items,
            hasItems: s.items && s.items.length > 0
          });
        });
        
        console.log("User cases data:", casesRes.data);
        casesRes.data?.forEach((c, idx) => {
          console.log(`Case ${idx}:`, {
            id: c._id,
            title: c.title,
            supportType: c.supportType,
            targetAmount: c.targetAmount,
            raisedAmount: c.raisedAmount,
            neededItems: c.neededItems
          });
        });
      } catch (e) {
        console.error("Failed loading user details:", e);
      } finally {
        setLoadingUser(false);
        setLoadingData(false);
      }
    };
    if (id) fetchAll();
  }, [id]);

  const totalSupported = useMemo(
    () => supports.reduce((sum, s) => sum + (s.amount || 0), 0),
    [supports]
  );

  const totalItemSupports = useMemo(
    () => supports.filter(s => s.items && s.items.length > 0).length,
    [supports]
  );

  const handleShowItems = (support) => {
    console.log("Selected support:", support); // Debug log
    setSelectedSupport(support);
    setItemsModalOpen(true);
  };

  const handleCloseItemsModal = () => {
    setItemsModalOpen(false);
    setSelectedSupport(null);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left fixed user info */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-4 bg-white rounded-lg border p-6">
          {loadingUser ? (
            <div className="flex justify-center"><Loader size="small" /></div>
          ) : user ? (
            <>
              <div className="flex items-center">
                <img
                  src={user.avatar || DEFAULT_AVATAR}
                  alt={user.name}
                  className="h-16 w-16 rounded-full"
                />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-sm text-gray-500">
                    Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              {user.bio && (
                <p className="mt-3 text-sm text-gray-700 italic">"{user.bio}"</p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="text-center bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500">Lượt ủng hộ</p>
                  <p className="text-lg font-semibold">{user.supportCount || supports.length}</p>
                  {totalItemSupports > 0 && (
                    <p className="text-xs text-blue-600 mt-1">{totalItemSupports} lượt vật phẩm</p>
                  )}
                </div>
                <div className="text-center bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500">Tổng tiền ủng hộ</p>
                  <p className="text-lg font-semibold">
                    {totalSupported > 0 
                      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(totalSupported)
                      : "0₫"}
                  </p>
                  {totalItemSupports > 0 && totalSupported === 0 && (
                    <p className="text-xs text-blue-600 mt-1">Chỉ hỗ trợ vật phẩm</p>
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin chi tiết</h4>
                <div className="space-y-2 text-sm">
                  {user.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900 break-all">{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="text-gray-900">{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Địa chỉ:</span>
                      <span className="text-gray-900 text-right max-w-[220px]">{user.address}</span>
                    </div>
                  )}
                  {user.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giới tính:</span>
                      <span className="text-gray-900">{user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                    </div>
                  )}
                  {user.bankName || user.bankAccount ? (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 mb-1">Thông tin ngân hàng</p>
                      {user.bankName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngân hàng:</span>
                          <span className="text-gray-900">{user.bankName}</span>
                        </div>
                      )}
                      {user.bankAccount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số tài khoản:</span>
                          <span className="text-gray-900">{user.bankAccount}</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                  {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 mb-2">Liên kết xã hội</p>
                      <div className="flex items-center gap-3">
                        {user.socialLinks.facebook && (
                          <a 
                            href={
                              user.socialLinks.facebook.startsWith('http') 
                                ? user.socialLinks.facebook 
                                : `https://facebook.com/${user.socialLinks.facebook}`
                            } 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            title="Facebook"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        )}
                        {user.socialLinks.twitter && (
                          <a 
                            href={
                              user.socialLinks.twitter.startsWith('http') 
                                ? user.socialLinks.twitter 
                                : `https://twitter.com/${user.socialLinks.twitter}`
                            } 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                            title="Twitter"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                          </a>
                        )}
                        {user.socialLinks.instagram && (
                          <a 
                            href={
                              user.socialLinks.instagram.startsWith('http') 
                                ? user.socialLinks.instagram 
                                : `https://instagram.com/${user.socialLinks.instagram}`
                            } 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 text-white transition-all"
                            title="Instagram"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md py-2"
                >
                  Quay lại
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Không tìm thấy người dùng</p>
          )}
        </div>
      </div>

      {/* Right main content */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Hoạt động</h3>
            <div className="space-x-2">
              <button
                onClick={() => setViewMode("supports")}
                className={`px-3 py-1 rounded text-sm ${viewMode === "supports" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                Lịch sử hỗ trợ
              </button>
              <button
                onClick={() => setViewMode("cases")}
                className={`px-3 py-1 rounded text-sm ${viewMode === "cases" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                Lịch sử xin hỗ trợ
              </button>
            </div>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-8"><Loader /></div>
          ) : viewMode === "supports" ? (
            supports.length ? (
              <ul className="divide-y divide-gray-200">
                {supports.map((s) => {
                  // Debug log cho mỗi support
                  const hasItems = s.items && Array.isArray(s.items) && s.items.length > 0;
                  const hasAmount = s.amount && s.amount > 0;
                  
                  return (
                  <li key={s._id} className="py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{s.message || "Đã ủng hộ"}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(s.createdAt).toLocaleString("vi-VN")}</p>
                        {s.case && (
                          <Link to={`/case/${s.case._id}`} className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 inline-block">
                            {s.case.title}
                          </Link>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        {hasItems ? (
                          // Hỗ trợ vật phẩm
                          <div>
                            <button
                              onClick={() => handleShowItems(s)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span className="font-semibold">Vật phẩm</span>
                            </button>
                            <div className="mt-1 text-xs text-gray-600 text-center">
                              {s.items.length} vật phẩm
                            </div>
                          </div>
                        ) : hasAmount ? (
                          // Hỗ trợ tiền
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                              <p className="text-green-700 font-bold text-base">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(s.amount)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          // Không rõ loại hỗ trợ
                          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded">
                            Đã ủng hộ
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-8">Chưa có lịch sử hỗ trợ</p>
            )
          ) : cases.length ? (
            <ul className="grid md:grid-cols-2 gap-4">
              {cases.map((c) => {
                const supportType = c.supportType || "money";
                const isMoneySupport = supportType === "money" || supportType === "both";
                const isItemSupport = supportType === "items" || supportType === "both";
                
                return (
                <li key={c._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  {c.situationImages?.length ? (
                    <img src={c.situationImages[0]} alt={c.title} className="w-full h-32 object-cover rounded" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <h4 className="mt-2 font-medium line-clamp-2">{c.title}</h4>
                  
                  {/* Display support info based on type */}
                  <div className="mt-2 space-y-2">
                    {isMoneySupport && (
                      <div className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Mục tiêu:</span>
                          <span className="font-semibold text-green-700">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(c.targetAmount || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Đã gây quỹ:</span>
                          <span className="font-semibold text-blue-700">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(c.raisedAmount || 0)}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${c.targetAmount > 0 ? Math.min((c.raisedAmount / c.targetAmount) * 100, 100) : 0}%` 
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {c.targetAmount > 0 ? ((c.raisedAmount / c.targetAmount) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {isItemSupport && (
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="font-semibold">
                            Cần vật phẩm: {c.neededItems?.length || 0} loại
                          </span>
                        </div>
                        {c.neededItems && c.neededItems.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {c.neededItems.map((item, idx) => {
                              const received = item.receivedQuantity || 0;
                              const needed = item.quantity || 0;
                              const progress = needed > 0 ? (received / needed) * 100 : 0;
                              const isCompleted = received >= needed;
                              
                              return (
                                <div key={idx} className="bg-blue-50 rounded p-2 border border-blue-200">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-gray-800">{item.name}</span>
                                    <span className={`text-xs font-semibold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                                      {received}/{needed} {item.unit}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">
                                    Cần: <span className="font-semibold">{needed} {item.unit}</span>
                                    {' • '}
                                    Đã nhận: <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                                      {received} {item.unit}
                                    </span>
                                  </div>
                                  {/* Progress bar for item */}
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className={`h-1.5 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                      style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5 text-right">
                                    {progress.toFixed(0)}%
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Support type badge */}
                    <div className="flex items-center gap-2">
                      {supportType === "money" && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Hỗ trợ tiền</span>
                      )}
                      {supportType === "items" && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Hỗ trợ vật phẩm</span>
                      )}
                      {supportType === "both" && (
                        <>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Tiền</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Vật phẩm</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Link to={`/case/${c._id}`} className="mt-3 inline-block text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-medium">
                    Xem chi tiết →
                  </Link>
                </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">Chưa có lịch sử xin hỗ trợ</p>
          )}
        </div>
      </div>

      {/* Items Modal */}
      <ItemsModal
        isOpen={itemsModalOpen}
        onClose={handleCloseItemsModal}
        items={selectedSupport?.items || []}
        supportInfo={selectedSupport}
      />
    </div>
  );
};

export default UserDetailScreen;


