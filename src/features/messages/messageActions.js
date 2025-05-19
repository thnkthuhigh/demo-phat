import axios from 'axios';
import {
  fetchMessagesRequest,
  fetchMessagesSuccess,
  fetchMessagesFail,
  fetchConversationsRequest,
  fetchConversationsSuccess,
  fetchConversationsFail,
  sendMessageRequest,
  sendMessageSuccess,
  sendMessageFail,
  markAsReadRequest,
  markAsReadSuccess,
  markAsReadFail,
  updateUnreadCount
} from './messageSlice';

// Fetch messages for a conversation
export const fetchMessages = (conversationId) => async (dispatch, getState) => {
  try {
    dispatch(fetchMessagesRequest());
    
    const {
      auth: { userInfo },
    } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const { data } = await axios.get(`/api/messages/${conversationId}`, config);
    dispatch(fetchMessagesSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(fetchMessagesFail(message));
  }
};

// Fetch all user conversations
export const fetchConversations = () => async (dispatch, getState) => {
  try {
    dispatch(fetchConversationsRequest());
    
    const {
      auth: { userInfo },
    } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const { data } = await axios.get('/api/messages/conversations', config);
    dispatch(fetchConversationsSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(fetchConversationsFail(message));
  }
};

// Send a new message
export const sendMessage = (conversationId, content) => async (dispatch, getState) => {
  try {
    dispatch(sendMessageRequest());
    
    const {
      auth: { userInfo },
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const { data } = await axios.post(`/api/messages`, { 
      conversation: conversationId,
      content
    }, config);
    
    dispatch(sendMessageSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(sendMessageFail(message));
  }
};

// Create a new conversation (if needed before sending a message)
export const createConversation = (receiverId) => async (dispatch, getState) => {
  try {
    const {
      auth: { userInfo },
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const { data } = await axios.post('/api/messages/conversations', { 
      receiver: receiverId
    }, config);
    
    return data; // Return the conversation data for further use
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    throw new Error(message);
  }
};

// Mark messages as read
export const markAsRead = (messageIds) => async (dispatch, getState) => {
  try {
    dispatch(markAsReadRequest());
    
    const {
      auth: { userInfo },
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const { data } = await axios.put('/api/messages/read', { 
      messageIds
    }, config);
    
    dispatch(markAsReadSuccess(messageIds));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(markAsReadFail(message));
  }
};

// Fetch unread messages count
export const fetchUnreadCount = () => async (dispatch, getState) => {
  try {
    const {
      auth: { userInfo },
    } = getState();
    
    if (!userInfo) return;
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const { data } = await axios.get('/api/messages/unread-count', config);
    dispatch(updateUnreadCount(data.count));
  } catch (error) {
    console.error('Error fetching unread count:', error);
  }
};