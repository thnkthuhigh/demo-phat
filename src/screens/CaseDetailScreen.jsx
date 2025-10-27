import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { fetchCaseDetails } from "../store/actions/caseActions";
import Loader from "../components/shared/Loader";
import Message from "../components/shared/Message";
import axios from "axios";
import { DEFAULT_AVATAR } from "../utils/constants";
import CreatorModal from "../components/cases/CreatorModal";
import ChatBox from "../components/cases/ChatBox";

const CaseDetailScreen = () => {
  const { id: caseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { caseDetails, loading, error } = useSelector((state) => state.cases);
  const { userInfo } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("description");
  const [recentSupports, setRecentSupports] = useState([]);
  const [socket, setSocket] = useState(null);
  const [creatorDetails, setCreatorDetails] = useState(null);
  const [loadingCreatorDetails, setLoadingCreatorDetails] = useState(false);
  const [topSupporters, setTopSupporters] = useState([]);
  const [loadingTopSupporters, setLoadingTopSupporters] = useState(false);
  const [uploadingProofs, setUploadingProofs] = useState(false);

  // Thêm state mới cho slideshow và modal hình ảnh
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProofImage, setSelectedProofImage] = useState(null);
  const [showSupportProofsModal, setShowSupportProofsModal] = useState(false);
  const [currentSupportProofs, setCurrentSupportProofs] = useState([]);
  const [currentProofIndex, setCurrentProofIndex] = useState(0);
  const [showSituationModal, setShowSituationModal] = useState(false);
  const [selectedSituationImage, setSelectedSituationImage] = useState(null);

  // Thêm state mới
  const [showProofImages, setShowProofImages] = useState(false);
  // Thêm state mới
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  // State hiển thị thông tin người dùng (dùng chung CreatorModal)
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingSelectedUser, setLoadingSelectedUser] = useState(false);

  useEffect(() => {
    // Fetch case details
    dispatch(fetchCaseDetails(caseId));

    // Initialize socket connection
    const socketInit = io(
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    );
    setSocket(socketInit);

    // Join case room for real-time updates
    socketInit.emit("join_case", caseId);

    // Clean up socket connection when component unmounts
    return () => {
      socketInit.emit("leave_case", caseId);
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
      socket.on("new_support", (newSupport) => {
        setRecentSupports((prevSupports) => [
          newSupport,
          ...prevSupports.slice(0, 9),
        ]);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (caseDetails?.user?._id) {
      const fetchCreatorDetails = async () => {
        setLoadingCreatorDetails(true);
        try {
          const { data } = await axios.get(
            `/api/users/${caseDetails.user._id}`
          );
          setCreatorDetails(data);
        } catch (error) {
          console.error("Error fetching creator details:", error);
        } finally {
          setLoadingCreatorDetails(false);
        }
      };
      fetchCreatorDetails();
    }
  }, [caseDetails]);

  useEffect(() => {
    if (caseId) {
      const fetchTopSupporters = async () => {
        setLoadingTopSupporters(true);
        try {
          const { data } = await axios.get(
            `/api/cases/${caseId}/top-supporters`
          );
          console.log("Top supporters data:", data);
          // Sắp xếp theo totalAmount giảm dần để đảm bảo thứ tự đúng
          const sortedData = data.sort((a, b) => b.totalAmount - a.totalAmount);
          setTopSupporters(sortedData);
        } catch (error) {
          console.error("Error fetching top supporters:", error);
        } finally {
          setLoadingTopSupporters(false);
        }
      };
      fetchTopSupporters();
    }
  }, [caseId]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category) => {
    const categories = {
      medical: "Y tế",
      education: "Giáo dục",
      disaster: "Thiên tai",
      animal: "Động vật",
      environmental: "Môi trường",
      community: "Cộng đồng",
      other: "Khác",
    };
    return categories[category] || "Khác";
  };

  const handleSupportClick = () => {
    if (!userInfo) {
      navigate(`/login?redirect=support/${caseId}`);
    } else {
      navigate(`/support/${caseId}`);
    }
  };

  // Hàm điều hướng slide
  const nextSlide = () => {
    if (
      caseDetails &&
      caseDetails.situationImages &&
      caseDetails.situationImages.length > 0
    ) {
      setCurrentSlide(
        (prev) => (prev + 1) % caseDetails.situationImages.length
      );
    }
  };

  const prevSlide = () => {
    if (
      caseDetails &&
      caseDetails.situationImages &&
      caseDetails.situationImages.length > 0
    ) {
      setCurrentSlide(
        (prev) =>
          (prev - 1 + caseDetails.situationImages.length) %
          caseDetails.situationImages.length
      );
    }
  };

  // Hàm hiển thị modal hình ảnh minh chứng
  const openProofImage = (image) => {
    setSelectedProofImage(image);
    setShowProofModal(true);
  };
  const openSupportProofs = (proofs) => {
    setCurrentSupportProofs(proofs || []);
    setCurrentProofIndex(0); // Bắt đầu từ ảnh đầu tiên
    setShowSupportProofsModal(true);
  };

  // Hàm hiển thị modal hình ảnh minh hoạ
  const openSituationImage = (image) => {
    setSelectedSituationImage(image);
    setShowSituationModal(true);
  };

  // Hàm mở modal thông tin người dùng (dùng CreatorModal)
  const openUserModal = async (userId) => {
    if (!userId) return;
    setLoadingSelectedUser(true);
    setShowUserModal(true);
    try {
      const { data } = await axios.get(`/api/users/${userId}`);
      setSelectedUserDetails(data);
    } catch (e) {
      console.error("Error fetching selected user details:", e);
    } finally {
      setLoadingSelectedUser(false);
    }
  };

  // Thêm biến mới cho phần hiển thị tiến độ vật phẩm
  const calculateOverallItemProgress = () => {
    if (!caseDetails.neededItems || caseDetails.neededItems.length === 0)
      return 0;

    const totalNeeded = caseDetails.neededItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalReceived = caseDetails.neededItems.reduce(
      (sum, item) => sum + (item.receivedQuantity || 0),
      0
    );

    return Math.min(Math.round((totalReceived / totalNeeded) * 100), 100);
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
  const isOwner =
    userInfo && caseDetails.user && userInfo._id === caseDetails.user._id;

  return (
    <div className="min-h-screen bg-red-50">
      <div className="w-full px-8 md:px-16 lg:px-24 xl:px-32 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/cases" className="text-red-600 hover:text-red-700 font-medium text-sm inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </Link>
        </div>

        {/* Status badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <span
            className={`px-4 py-2 text-sm font-bold rounded-2xl ${
              caseDetails.status === "active"
                ? "bg-red-500 text-white"
                : caseDetails.status === "completed"
                ? "bg-red-600 text-white"
                : caseDetails.status === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-gray-500 text-white"
            }`}
          >
            {caseDetails.status === "active" && "Đang vận động"}
            {caseDetails.status === "completed" && "Hoàn thành"}
            {caseDetails.status === "pending" && "Chờ duyệt"}
            {caseDetails.status === "cancelled" && "Đã hủy"}
          </span>
          {caseDetails.featured && (
            <span className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white text-sm font-bold rounded-2xl">
              Nổi bật
            </span>
          )}
          <span className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border-2 border-red-200">
            {getCategoryLabel(caseDetails.category)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">{caseDetails.title}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Images and details */}
          <div className="lg:w-8/12">
            {/* Main image slideshow */}
            {caseDetails.situationImages &&
            caseDetails.situationImages.length > 0 ? (
              <div className="mb-8 relative">
                <div className="relative h-[550px] md:h-[650px] overflow-hidden rounded-3xl shadow-xl border-2 border-red-200">
                {caseDetails.situationImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute w-full h-full transition-all duration-700 ease-in-out ${
                      index === currentSlide
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95"
                    }`}
                    style={{
                      display: index === currentSlide ? "block" : "none",
                    }}
                    onClick={() => openSituationImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${caseDetails.title} - ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}

                {/* Navigation buttons with improved design */}
                {caseDetails.situationImages.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-red-600 p-3 rounded-full hover:bg-white transition-all shadow-xl"
                      aria-label="Ảnh trước"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm text-red-600 p-3 rounded-full hover:bg-white transition-all shadow-xl"
                      aria-label="Ảnh sau"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Slide indicators with improved design */}
                {caseDetails.situationImages.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
                    {caseDetails.situationImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all shadow-lg ${
                          index === currentSlide
                            ? "bg-white w-8"
                            : "bg-white/60 w-2 hover:bg-white/80"
                        }`}
                        aria-label={`Chuyển đến ảnh ${index + 1}`}
                      ></button>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails with improved design */}
              {caseDetails.situationImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2 mt-4">
                  {caseDetails.situationImages.map((image, index) => (
                    <div
                      key={`thumb-${index}`}
                      onClick={() => setCurrentSlide(index)}
                      className={`relative cursor-pointer overflow-hidden rounded-xl transition-all ${
                        index === currentSlide
                          ? "ring-2 ring-red-600 ring-offset-2 scale-105"
                          : "hover:opacity-80 hover:scale-105"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${caseDetails.title} - ${index + 1}`}
                        className={`w-full h-20 object-cover transition-all ${
                          index === currentSlide
                            ? "brightness-105"
                            : "brightness-90"
                        }`}
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

          {/* Hiển thị phần hình ảnh minh chứng */}
          {caseDetails.proofImages &&
            caseDetails.proofImages.length > 0 &&
            !showProofModal && (
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowProofImages(!showProofImages)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-semibold">Hình ảnh minh chứng</span>
                    <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {caseDetails.proofImages.length}
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform ${
                      showProofImages ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    showProofImages
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4 bg-white">
                    <p className="text-sm text-gray-600 mb-3">
                      Bấm vào hình ảnh để xem chi tiết minh chứng
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {caseDetails.proofImages.map((image, index) => (
                        <div
                          key={`proof-${index}`}
                          onClick={() => openProofImage(image)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={image}
                            alt={`Minh chứng ${index + 1}`}
                            className="w-full h-32 object-cover rounded border border-gray-200"
                          />
                          <p className="text-xs text-center mt-1 text-gray-500">
                            Minh chứng {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Tab navigation */}
          <div className="mb-8">
            <div className="border-b-2 border-red-200">
              <nav className="-mb-0.5 flex space-x-6 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`pb-4 px-1 font-bold text-sm flex items-center whitespace-nowrap border-b-2 transition-all duration-200 ${
                    activeTab === "description"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-red-600 hover:border-red-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Chi tiết hoàn cảnh
                </button>

                {caseDetails.updates && caseDetails.updates.length > 0 && (
                  <button
                    onClick={() => setActiveTab("updates")}
                    className={`pb-4 px-1 font-bold text-sm flex items-center whitespace-nowrap border-b-2 transition-all duration-200 ${
                      activeTab === "updates"
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-500 hover:text-red-600 hover:border-red-300"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                    Cập nhật
                    <span className="ml-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                      {caseDetails.updates.length}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("supporters")}
                  className={`pb-4 px-1 font-bold text-sm flex items-center whitespace-nowrap border-b-2 transition-all duration-200 ${
                    activeTab === "supporters"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-red-600 hover:border-red-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Người ủng hộ
                  {recentSupports?.length > 0 && (
                    <span className="ml-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                      {recentSupports.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("topSupporters")}
                  className={`pb-4 px-1 font-bold text-sm flex items-center whitespace-nowrap border-b-2 transition-all duration-200 ${
                    activeTab === "topSupporters"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-red-600 hover:border-red-300"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"
                    ></path>
                  </svg>
                  Top người ủng hộ
                </button>
              </nav>
            </div>

            {/* Tab content container với hiệu ứng fade-in */}
            <div className="pt-6 animate-fadeIn">{/* Tab content here */}</div>
          </div>

          {/* Tab content */}
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{caseDetails.description}</p>

              {/* Hiển thị thông tin vật phẩm cần hỗ trợ nếu có */}
              {(caseDetails.supportType === "items" ||
                caseDetails.supportType === "both") &&
                caseDetails.neededItems &&
                caseDetails.neededItems.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Vật phẩm cần hỗ trợ
                    </h3>
                    <div className="space-y-4 mt-4">
                      {caseDetails.neededItems.map((item, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="text-sm bg-red-100 text-red-800 py-1 px-2 rounded-full">
                              {item.receivedQuantity} / {item.quantity}{" "}
                              {item.unit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div
                              className="bg-red-600 h-2.5 rounded-full"
                              style={{
                                width: `${Math.min(
                                  Math.round(
                                    (item.receivedQuantity / item.quantity) *
                                      100
                                  ),
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            {Math.round(
                              (item.receivedQuantity / item.quantity) * 100
                            )}
                            % hoàn thành
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {caseDetails.location && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900">Địa điểm</h3>
                  <p>{caseDetails.location}</p>
                </div>
              )}

              {caseDetails.contactInfo && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900">
                    Thông tin liên hệ
                  </h3>
                  <p>{caseDetails.contactInfo}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "updates" && caseDetails.updates && (
            <div className="space-y-6">
              {caseDetails.updates.map((update, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-6 last:border-0"
                >
                  <h3 className="font-semibold text-lg">{update.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {formatDate(update.date)}
                  </p>
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

          {activeTab === "supporters" && (
            <div>
              {recentSupports && recentSupports.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentSupports.map((support) => (
                    <li key={support._id} className="py-4">
                      <div className="flex items-start">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={
                            support.anonymous
                              ? DEFAULT_AVATAR
                              : support.user?.avatar || DEFAULT_AVATAR
                          }
                          alt={
                            support.anonymous ? "Ẩn danh" : support.user?.name
                          }
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {support.anonymous ? (
                                "Người ủng hộ ẩn danh"
                              ) : (
                                <button
                                  onClick={() =>
                                    openUserModal(support.user?._id)
                                  }
                                  className="hover:text-red-600 hover:underline transition-colors"
                                >
                                  {support.user?.name}
                                </button>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(support.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {support.amount > 0 && (
                              <div className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center">
                                <svg
                                  className="w-3.5 h-3.5 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
                                </svg>
                                {formatCurrency(support.amount)}
                              </div>
                            )}

                            {support.items &&
                              support.items.length > 0 &&
                              support.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center"
                                >
                                  <svg
                                    className="w-3.5 h-3.5 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
                                      clipRule="evenodd"
                                    ></path>
                                    <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z"></path>
                                  </svg>
                                  {item.quantity} {item.unit} {item.name}
                                </div>
                              ))}
                          </div>

                          {support.message && (
                            <div className="mt-2 text-sm text-gray-600 italic bg-gray-50 p-2 rounded-md border-l-2 border-gray-200">
                              "{support.message}"
                            </div>
                          )}

                          <div className="mt-1 flex items-center gap-3 flex-wrap">
                            {support.status === "completed" && (
                              <span className="text-xs italic text-green-600">
                                Đã duyệt
                              </span>
                            )}
                            {support.proofImages &&
                              support.proofImages.length > 0 &&
                              !showSupportProofsModal && (
                                <button
                                  onClick={() =>
                                    openSupportProofs(support.proofImages)
                                  }
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  Xem minh chứng ({support.proofImages.length})
                                </button>
                              )}
                            {/* Upload minh chứng nếu là chủ khoản ủng hộ, chủ hoàn cảnh hoặc admin */}
                            {userInfo &&
                              (userInfo.isAdmin ||
                                userInfo._id === support.user?._id ||
                                isOwner) &&
                              support.status === "completed" &&
                              !showSupportProofsModal &&
                              !showProofModal &&
                              !showSituationModal && (
                                <label className="text-xs text-gray-600 hover:text-gray-800 cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={async (e) => {
                                      const files = Array.from(
                                        e.target.files || []
                                      );
                                      if (!files.length) return;
                                      try {
                                        setUploadingProofs(true);
                                        // 1) upload images to get URLs
                                        const form = new FormData();
                                        files.forEach((f) =>
                                          form.append("image", f)
                                        );
                                        const uploadRes = await axios.post(
                                          `/api/upload`,
                                          form,
                                          {
                                            headers: {
                                              "Content-Type":
                                                "multipart/form-data",
                                              Authorization: `Bearer ${userInfo.token}`,
                                            },
                                          }
                                        );
                                        const urls =
                                          uploadRes.data?.urls ||
                                          uploadRes.data ||
                                          [];
                                        // 2) attach to support
                                        await axios.post(
                                          `/api/supports/${support._id}/proofs`,
                                          { images: urls },
                                          {
                                            headers: {
                                              Authorization: `Bearer ${userInfo.token}`,
                                            },
                                          }
                                        );
                                        // 3) refresh case details
                                        dispatch(fetchCaseDetails(caseId));
                                      } catch (err) {
                                        console.error(
                                          "Upload proofs error:",
                                          err
                                        );
                                      } finally {
                                        setUploadingProofs(false);
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                  {uploadingProofs
                                    ? "Đang tải minh chứng..."
                                    : "Thêm minh chứng"}
                                </label>
                              )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-gray-500">Chưa có người ủng hộ</p>
                  <button
                    onClick={handleSupportClick}
                    className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hãy trở thành người ủng hộ đầu tiên
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "topSupporters" && (
            <div>
              {loadingTopSupporters ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : topSupporters && topSupporters.length > 0 ? (
                <div>
                  <div className="mb-4 bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-gray-600 text-sm">
                      Những người ủng hộ nhiều nhất cho hoàn cảnh này
                    </p>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {topSupporters.map((supporter, index) => (
                      <li
                        key={supporter._id}
                        className="py-4 flex items-center"
                      >
                        <div
                          className={`flex-shrink-0 flex items-center justify-center w-8 h-8 ${
                            index === 0
                              ? "bg-amber-100 text-amber-800"
                              : index === 1
                              ? "bg-gray-100 text-gray-800"
                              : index === 2
                              ? "bg-yellow-800 bg-opacity-30 text-yellow-900"
                              : "bg-red-100 text-red-800"
                          } rounded-full font-semibold text-sm`}
                        >
                          {index + 1}
                        </div>
                        <div className="ml-4 flex-1 flex justify-between items-center">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full mr-3"
                              src={supporter.userAvatar || DEFAULT_AVATAR}
                              alt={supporter.userName}
                            />
                            <div>
                              <button
                                onClick={() => openUserModal(supporter.userId)}
                                className="text-sm font-medium text-gray-900 hover:text-red-600 hover:underline transition-colors"
                              >
                                {supporter.userName}
                              </button>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {supporter.supportCount} lượt ủng hộ
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(supporter.totalAmount)}
                            </div>
                            {supporter.itemCount > 0 && (
                              <div className="text-xs text-gray-500">
                                + {supporter.itemCount} vật phẩm
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có dữ liệu người ủng hộ</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column - Support info */}
        <div className="lg:w-4/12">
          <div className="bg-white rounded-3xl border-2 border-red-200 shadow-xl p-6 sticky top-4">
            {/* Progress bar */}
            <div className="mb-6">
              {/* Tiến độ quyên góp tiền */}
              {(caseDetails.supportType === "money" ||
                caseDetails.supportType === "both") && (
                <div className="mb-4">
                  <div className="flex justify-between mb-3">
                    <h3 className="font-extrabold text-gray-900 text-xl">
                      {formatCurrency(caseDetails.currentAmount)}
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-sm">
                    <span className="text-gray-600">Mục tiêu: {formatCurrency(caseDetails.targetAmount)}</span>
                    <span className="text-red-600 font-bold">{caseDetails.supportCount} lượt</span>
                  </div>
                </div>
              )}

              {/* Tiến độ vật phẩm */}
              {(caseDetails.supportType === "items" ||
                caseDetails.supportType === "both") &&
                caseDetails.neededItems &&
                caseDetails.neededItems.length > 0 && (
                  <div
                      className={
                      caseDetails.supportType === "both"
                        ? "mt-4 pt-4 border-t-2 border-red-200"
                        : ""
                    }
                  >
                    {caseDetails.supportType === "both" && (
                      <h3 className="font-bold text-gray-900 mb-3">
                        Tiến độ vật phẩm
                      </h3>
                    )}

                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold text-sm text-gray-900">Tổng vật phẩm</h4>
                      <span className="text-sm text-red-600 font-bold">
                        {countReceivedItems(caseDetails.neededItems)}/
                        {countTotalItems(caseDetails.neededItems)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${calculateOverallItemProgress()}%` }}
                      ></div>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-auto pr-2">
                      {caseDetails.neededItems.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1.5">
                            <span className="font-bold text-sm text-gray-900">
                              {item.name}
                            </span>
                            <span className="text-xs text-[#007BFF] font-bold">
                              {item.receivedQuantity} / {item.quantity}{" "}
                              {item.unit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#5CC9B5] to-[#4FA3E3] h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  Math.round(
                                    (item.receivedQuantity / item.quantity) *
                                      100
                                  ),
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {caseDetails.endDate && (
                <div className="mt-3 text-sm text-gray-600">
                  Hết hạn: {formatDate(caseDetails.endDate)}
                </div>
              )}
            </div>

            {/* Support button */}
            {caseDetails.status === "active" && (
              <button
                onClick={handleSupportClick}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl text-base font-bold hover:from-red-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Ủng hộ ngay
                </div>
              </button>
            )}

            {/* Edit case button (for owner or admin) */}
            {isOwner && (
              <Link
                to={`/edit-case/${caseId}`}
                className="mt-3 w-full block text-center py-3 bg-white border-2 border-red-600 text-red-600 rounded-2xl text-base font-bold hover:bg-red-50 transition-all"
              >
                Chỉnh sửa
              </Link>
            )}

            {/* Creator info */}
            <div className="mt-6 pt-6 border-t-2 border-red-200">
              <h3 className="text-gray-900 font-bold mb-4 text-lg">
                Thông tin người tạo
              </h3>
              {loadingCreatorDetails ? (
                <div className="flex justify-center">
                  <Loader size="small" />
                </div>
              ) : creatorDetails ? (
                <div>
                  <div className="flex items-center">
                    <img
                      src={
                        creatorDetails.avatar ||
                        "https://via.placeholder.com/40"
                      }
                      alt={creatorDetails.name}
                      className="h-12 w-12 rounded-full border-2 border-red-400 object-cover"
                    />
                    <div className="ml-4">
                      <button
                        onClick={() => setShowCreatorModal(true)}
                        className="text-red-600 font-bold hover:text-red-700 hover:underline"
                      >
                        {creatorDetails.name}
                      </button>
                      {/* Link xem chi tiết nhanh */}
                      <div>
                        <button
                          onClick={() =>
                            navigate(`/user/${creatorDetails._id}`)
                          }
                          className="text-xs text-red-600 hover:text-red-700 hover:underline"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 font-medium">
                        <span>{creatorDetails.supportCount} lượt ủng hộ</span>
                        <span className="mx-1">•</span>
                        <span>
                          {formatCurrency(creatorDetails.totalSupported)} đã ủng
                          hộ
                        </span>
                      </div>
                    </div>
                  </div>
                  {creatorDetails.bio && (
                    <p className="mt-3 text-gray-700 text-sm italic">
                      "{creatorDetails.bio}"
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    {creatorDetails.socialLinks?.facebook && (
                      <a
                        href={creatorDetails.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                        </svg>
                      </a>
                    )}
                    {creatorDetails.socialLinks?.twitter && (
                      <a
                        href={creatorDetails.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085a4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                        </svg>
                      </a>
                    )}
                    {creatorDetails.socialLinks?.instagram && (
                      <a
                        href={creatorDetails.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.645.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  Không thể tải thông tin người tạo
                </div>
              )}
            </div>

            {/* Share buttons */}
            <div className="mt-6 pt-6 border-t-2 border-red-200">
              <h3 className="text-gray-900 font-bold mb-4 text-lg">Chia sẻ</h3>
              <div className="flex space-x-4">
                <button className="flex items-center text-red-600 hover:bg-red-50 px-4 py-2 rounded-2xl font-medium transition-colors">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                  <span>Facebook</span>
                </button>
                <button className="flex items-center text-red-600 hover:bg-red-50 px-4 py-2 rounded-2xl font-medium transition-colors">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                  </svg>
                  <span>Twitter</span>
                </button>
              </div>
            </div>

            {/* Report link */}
            <div className="mt-6 text-center">
              <button className="text-red-500 text-sm hover:text-red-700 hover:underline font-medium">
                Báo cáo hoàn cảnh này
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal để hiển thị hình ảnh minh chứng khi được bấm vào */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
          <div className="relative max-w-4xl w-full p-2">
            <button
              onClick={() => setShowProofModal(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-800 z-10"
              aria-label="Đóng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedProofImage}
              alt="Hình ảnh minh chứng"
              className="max-h-screen max-w-full mx-auto"
            />
          </div>
        </div>
      )}

      {/* Modal để hiển thị hình ảnh minh hoạ khi được bấm vào */}
      {showSituationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
          <div className="relative max-w-4xl w-full p-2">
            <button
              onClick={() => setShowSituationModal(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 text-gray-800 z-10"
              aria-label="Đóng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedSituationImage}
              alt="Hình ảnh minh hoạ"
              className="max-h-screen max-w-full mx-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Modal minh chứng của khoản ủng hộ */}
      {showSupportProofsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={() => setShowSupportProofsModal(false)}
              className="absolute -top-12 right-0 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-200 transition-colors z-10"
              aria-label="Đóng"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            
            {currentSupportProofs && currentSupportProofs.length > 0 ? (
              <div className="space-y-4">
                {/* Ảnh lớn hiển thị */}
                <div className="bg-black rounded-lg overflow-hidden">
                  <img
                    src={currentSupportProofs[currentProofIndex]?.url}
                    alt={`Minh chứng ${currentProofIndex + 1}`}
                    className="w-full max-h-[70vh] object-contain mx-auto"
                  />
                  {currentSupportProofs[currentProofIndex]?.note && (
                    <div className="bg-white p-4">
                      <p className="text-gray-700 text-sm">
                        {currentSupportProofs[currentProofIndex].note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Grid ảnh nhỏ bên dưới */}
                {currentSupportProofs.length > 1 && (
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Tất cả minh chứng ({currentSupportProofs.length})
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {currentSupportProofs.map((p, idx) => (
                        <div
                          key={idx}
                          className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentProofIndex
                              ? 'border-red-600 ring-2 ring-red-600 ring-offset-2'
                              : 'border-gray-200 hover:border-red-400'
                          }`}
                          onClick={() => setCurrentProofIndex(idx)}
                        >
                          <img
                            src={p.url}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-20 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500">Không có minh chứng</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal thông tin người tạo */}
      {showCreatorModal && creatorDetails && (
        <CreatorModal
          creatorDetails={creatorDetails}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          onClose={() => setShowCreatorModal(false)}
        />
      )}

      {/* Modal thông tin người dùng dùng chung CreatorModal */}
      {showUserModal && (
        <CreatorModal
          creatorDetails={selectedUserDetails}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUserDetails(null);
          }}
          isLoading={loadingSelectedUser}
        />
      )}

      {/* Add ChatBox with title */}
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
          <h2 className="text-xl font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Thảo luận
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tham gia thảo luận về hoàn cảnh này
          </p>
        </div>
        <div className="p-5">
          <ChatBox caseId={caseId} userInfo={userInfo} />
        </div>
      </div>
      </div>
    </div>
  );
};

// Thêm các hàm helper vào các component CaseList và AdminCaseListScreen
const calculateItemsProgress = (items) => {
  if (!items || items.length === 0) return 0;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const receivedQuantity = items.reduce(
    (sum, item) => sum + (item.receivedQuantity || 0),
    0
  );

  return Math.min(Math.round((receivedQuantity / totalQuantity) * 100), 100);
};

const countTotalItems = (items) => {
  if (!items) return 0;
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

const countReceivedItems = (items) => {
  if (!items) return 0;
  return items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
};

export default CaseDetailScreen;
