import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const Chatbox = ({ caseId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Fetch tin nhắn từ API với xử lý lỗi và retry tự động
  const fetchMessages = async (retry = false) => {
    try {
      if (!retry) {
        setLoading(true);
      } else {
        setIsRetrying(true);
      }

      const config = {
        headers: {
          Authorization: userInfo?.token ? `Bearer ${userInfo.token}` : "",
        },
        // Thêm timeout để tránh chờ quá lâu khi server không phản hồi
        timeout: 10000,
      };

      const { data } = await axios.get(`/api/messages/${caseId}`, config);

      setMessages(data);
      setError(null);
      setRetryCount(0);

      // Cuộn xuống cuối sau khi lấy tin nhắn
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error fetching messages:", err);

      // Xử lý các loại lỗi khác nhau
      if (err.code === "ECONNABORTED") {
        setError("Hết thời gian kết nối đến server. Vui lòng thử lại.");
      } else if (
        err.code === "ERR_NETWORK" ||
        err.message?.includes("ECONNRESET")
      ) {
        setError("Lỗi kết nối mạng. Đang thử lại...");

        // Tự động thử lại nếu là lỗi mạng (tối đa 3 lần)
        if (retryCount < 3) {
          setRetryCount((prev) => prev + 1);
          setTimeout(() => fetchMessages(true), 3000);
          return;
        } else {
          setError(
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại."
          );
        }
      } else {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : "Không thể tải tin nhắn. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  // Gửi tin nhắn mới với xử lý lỗi tốt hơn
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !userInfo) return;

    try {
      setLoading(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        timeout: 10000, // Thêm timeout 10s
      };

      await axios.post(`/api/messages/${caseId}`, { text: newMessage }, config);

      // Xóa nội dung tin nhắn sau khi gửi
      setNewMessage("");

      // Fetch lại danh sách tin nhắn
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);

      if (err.code === "ECONNABORTED") {
        setError("Hết thời gian kết nối đến server. Vui lòng thử gửi lại.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.");
      } else {
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : "Không thể gửi tin nhắn. Vui lòng thử lại."
        );
      }

      setLoading(false);
    }
  };

  // Xóa tin nhắn (chỉ admin)
  const handleDeleteMessage = async (messageId) => {
    if (!userInfo.isAdmin) return;

    if (confirm("Bạn có chắc muốn xóa tin nhắn này không?")) {
      try {
        setLoading(true);

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          timeout: 10000,
        };

        await axios.delete(`/api/messages/${messageId}`, config);

        // Fetch lại danh sách tin nhắn
        fetchMessages();
      } catch (err) {
        console.error("Error deleting message:", err);
        setError(
          err.response && err.response.data.message
            ? err.response.data.message
            : "Không thể xóa tin nhắn. Vui lòng thử lại."
        );
        setLoading(false);
      }
    }
  };

  // Hàm thử lại khi gặp lỗi
  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    fetchMessages();
  };

  // Fetch tin nhắn ban đầu và thiết lập polling
  useEffect(() => {
    if (caseId && userInfo) {
      // Fetch messages ngay khi component mount
      fetchMessages();

      // Thiết lập polling để cập nhật tin nhắn mỗi 8 giây
      // Tăng lên từ 5 giây để giảm tải cho server
      const intervalId = setInterval(fetchMessages, 8000);

      // Cleanup khi component unmount
      return () => clearInterval(intervalId);
    }
  }, [caseId, userInfo]);

  // Hiển thị thông báo nếu chưa đăng nhập
  if (!userInfo) {
    return (
      <div className="p-4 text-center text-gray-500">
        Vui lòng đăng nhập để tham gia trò chuyện.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 relative border rounded-lg overflow-hidden">
      {/* Hiển thị lỗi nếu có và nút thử lại */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-3 absolute top-0 left-0 right-0 z-10 flex justify-between items-center">
          <div className="text-red-700">{error}</div>
          <button
            onClick={handleRetry}
            className="bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded text-sm flex items-center"
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-800"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang thử lại...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Thử lại
              </>
            )}
          </button>
        </div>
      )}

      {/* Phần hiển thị tin nhắn */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 messages-container"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E0 #F7FAFC",
          paddingTop: error ? "3rem" : "1rem",
        }}
      >
        {/* Loading spinner */}
        {loading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Không có tin nhắn */}
        {!loading && messages.length === 0 && !error && (
          <div className="text-center text-gray-500 py-8">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </div>
        )}

        {/* Danh sách tin nhắn */}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.user?._id === userInfo._id ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar người khác */}
            {msg.user?._id !== userInfo._id && (
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                {msg.user?.avatar ? (
                  <img
                    src={msg.user.avatar}
                    alt={msg.user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/40?text=" +
                        msg.user.name.charAt(0).toUpperCase();
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                    {msg.user?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </div>
            )}

            {/* Nội dung tin nhắn */}
            <div
              className={`max-w-xs sm:max-w-sm md:max-w-md rounded-lg px-4 py-2 ${
                msg.user?._id === userInfo._id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              {/* Tên người gửi */}
              {msg.user?._id !== userInfo._id && (
                <div className="font-semibold text-xs mb-1 flex items-center">
                  {msg.user?.name || "Người dùng không xác định"}
                  {msg.user?.isAdmin && (
                    <span className="ml-1 bg-red-100 text-red-800 text-xs px-1.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
              )}

              {/* Nội dung tin nhắn */}
              <div className="break-words">{msg.text}</div>

              {/* Thời gian và nút xóa */}
              <div className="flex justify-between items-center mt-1 text-xs opacity-70">
                <div>
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>

                {/* Nút xóa (chỉ admin) */}
                {userInfo.isAdmin && (
                  <button
                    onClick={() => handleDeleteMessage(msg._id)}
                    className="hover:text-red-500 ml-2"
                    title="Xóa tin nhắn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Avatar của chính mình */}
            {msg.user?._id === userInfo._id && (
              <div className="w-8 h-8 rounded-full overflow-hidden ml-2 flex-shrink-0">
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/40?text=" +
                        userInfo.name.charAt(0).toUpperCase();
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-300 flex items-center justify-center text-white">
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Element để cuộn xuống */}
        <div ref={messagesEndRef} />
      </div>

      {/* Form nhập tin nhắn */}
      <form onSubmit={handleSendMessage} className="border-t p-2 flex bg-white">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
          className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={loading ? "Đang xử lý..." : "Nhập tin nhắn..."}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className={`px-4 py-2 rounded-r-md ${
            loading || !newMessage.trim()
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } transition-colors flex items-center`}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Gửi"
          )}
        </button>
      </form>
    </div>
  );
};

// Thêm style tùy chỉnh thanh cuộn
const customStyles = `
  /* Tùy chỉnh thanh cuộn cho trình duyệt Chrome, Safari */
  .messages-container::-webkit-scrollbar {
    width: 6px;
  }

  .messages-container::-webkit-scrollbar-track {
    background: #F7FAFC;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background-color: #CBD5E0;
    border-radius: 20px;
    border: 3px solid transparent;
  }

  /* Tùy chỉnh cho Firefox */
  .messages-container {
    scrollbar-width: thin;
    scrollbar-color: #CBD5E0 #F7FAFC;
  }
`;

// Thêm style vào document
const style = document.createElement("style");
style.textContent = customStyles;
document.head.appendChild(style);

export default Chatbox;
