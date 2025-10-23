import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DEFAULT_AVATAR } from "../../utils/constants";
import CreatorModal from "./CreatorModal";

const ChatBox = ({ caseId, userInfo }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingSelectedUser, setLoadingSelectedUser] = useState(false);
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null); // Ref cho container tin nhắn
  const pollingIntervalRef = useRef(null);
  const previousMessagesLength = useRef(0); // Để theo dõi số lượng tin nhắn thay đổi

  // Fetch messages and set up polling
  useEffect(() => {
    // Chỉ thiết lập polling nếu có caseId
    if (!caseId) return;

    console.log("Setting up message polling for case:", caseId);

    // Fetch messages initially
    fetchMessages();

    // Set up polling every 3 seconds thay vì 1 second để giảm tải server
    pollingIntervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      // Clean up interval on component unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        console.log("Cleaned up message polling interval");
      }
    };
  }, [caseId, userInfo]); // Thêm userInfo vào dependencies

  // Cải thiện cách cuộn xuống tin nhắn mới
  useEffect(() => {
    // Chỉ cuộn khi số lượng tin nhắn tăng lên
    if (messages.length > previousMessagesLength.current) {
      scrollToBottom();
    }
    // Cập nhật số lượng tin nhắn hiện tại
    previousMessagesLength.current = messages.length;
  }, [messages]);

  // Hàm cuộn xuống cuối container tin nhắn
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      // Đặt scrollTop để cuộn xuống cuối
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  // Fetch messages - Sửa hàm fetchMessages để xử lý lỗi và thêm log
  const fetchMessages = async () => {
    try {
      const url = `/api/cases/${caseId}/messages`;
      console.log(`Fetching messages from: ${url}`);

      // Thêm token vào header nếu có userInfo
      const config = userInfo?.token
        ? {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        : {};

      const { data } = await axios.get(url, config);

      // Kiểm tra nếu có dữ liệu mới
      if (JSON.stringify(data) !== JSON.stringify(messages)) {
        console.log(`Received ${data.length} messages, updating state`);
        setMessages(data);
      }
    } catch (error) {
      console.error(
        "Error fetching messages:",
        error.response?.data || error.message
      );
    }
  };

  // Send message function - Sửa hàm sendMessage để xử lý lỗi tốt hơn
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !userInfo) {
      console.log("Missing message content or user info");
      return;
    }

    try {
      setLoading(true);

      // Log URL và data để debug
      const url = `/api/cases/${caseId}/messages`;
      const messageData = { content: newMessage };

      console.log(`Sending message to: ${url}`);
      console.log("Message data:", messageData);
      console.log("User token available:", !!userInfo.token);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(url, messageData, config);

      console.log("Message sent successfully:", data);

      // Clear input after sending
      setNewMessage("");

      // Cập nhật messages ngay lập tức thay vì đợi polling
      setMessages((prevMessages) => [...prevMessages, data]);

      // Cuộn xuống dưới sau khi thêm tin nhắn mới
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      console.log("Error response:", error.response);

      // Thông báo lỗi chi tiết hơn
      let errorMessage = "Không thể gửi tin nhắn";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage +=
            ": API endpoint không tồn tại. Vui lòng kiểm tra cấu hình route.";
        } else {
          errorMessage += `: ${
            error.response.data?.message || error.response.statusText
          } (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage += ": Không nhận được phản hồi từ server";
      } else {
        errorMessage += `: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format time
  const formatTime = (dateString) => {
    return format(new Date(dateString), "HH:mm - dd/MM/yyyy", { locale: vi });
  };

  // Handle user name click (fetch details and reuse CreatorModal)
  const handleUserNameClick = async (userId) => {
    if (!userId) return;
    setLoadingSelectedUser(true);
    setShowUserModal(true);
    try {
      const { data } = await axios.get(`/api/users/${userId}`);
      setSelectedUserDetails(data);
    } catch (e) {
      console.error("Error fetching selected user for chat modal:", e);
    } finally {
      setLoadingSelectedUser(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h3 className="text-lg font-semibold">Thảo luận về hoàn cảnh này</h3>
        </div>

      {/* Messages container - Thêm ref cho container */}
      <div
        ref={messageContainerRef}
        className="p-4 h-80 overflow-y-auto bg-gray-50"
      >
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  userInfo && message.user._id === userInfo._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[75%] ${
                    userInfo && message.user._id === userInfo._id
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleUserNameClick(message.user._id)}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={message.user.avatar || DEFAULT_AVATAR}
                        alt={message.user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    </button>
                  </div>
                  <div
                    className={`mx-2 px-4 py-2 rounded-lg ${
                      userInfo && message.user._id === userInfo._id
                        ? "bg-indigo-100"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => handleUserNameClick(message.user._id)}
                        className="font-medium text-sm text-indigo-600 hover:underline mr-2"
                      >
                        {message.user.name}
                      </button>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-800">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {/* Điểm tham chiếu cuối tin nhắn - không sử dụng scrollIntoView */}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-4 border-t">
        {userInfo ? (
          <form onSubmit={sendMessage} className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-r-lg"
              disabled={!newMessage.trim() || loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Đang gửi
                </span>
              ) : (
                "Gửi"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-2 bg-gray-100 rounded-lg">
            <p className="text-gray-600">
              Vui lòng{" "}
              <Link to="/login" className="text-indigo-600 font-medium">
                đăng nhập
              </Link>{" "}
              để tham gia thảo luận
            </p>
          </div>
        )}
      </div>
      </div>

      {/* User Info Modal using CreatorModal */}
      {showUserModal && (
        <CreatorModal
          creatorDetails={selectedUserDetails}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUserDetails(null);
          }}
          isLoading={loadingSelectedUser}
        />
      )}
    </>
  );
};

export default ChatBox;
