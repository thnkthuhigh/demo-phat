import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  unreadCount: 0,
  conversationList: [],
  currentConversation: null,
  loading: false,
  error: null,
  success: false
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    fetchMessagesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action) => {
      state.loading = false;
      state.messages = action.payload;
      state.error = null;
    },
    fetchMessagesFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchConversationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchConversationsSuccess: (state, action) => {
      state.loading = false;
      state.conversationList = action.payload;
      state.error = null;
    },
    fetchConversationsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    sendMessageRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    sendMessageSuccess: (state, action) => {
      state.loading = false;
      state.messages = [...state.messages, action.payload];
      state.success = true;
      state.error = null;
    },
    sendMessageFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },

    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    markAsReadRequest: (state) => {
      state.loading = true;
    },
    markAsReadSuccess: (state, action) => {
      state.loading = false;
      // Update the messages that were marked as read
      state.messages = state.messages.map(message => 
        action.payload.includes(message._id) 
          ? { ...message, isRead: true } 
          : message
      );
      state.unreadCount = state.unreadCount - action.payload.length < 0 
        ? 0 
        : state.unreadCount - action.payload.length;
    },
    markAsReadFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // For real-time message receiving
    receiveMessage: (state, action) => {
      // Add new message to state if it's from current conversation
      if (!state.currentConversation || 
          action.payload.conversation === state.currentConversation._id) {
        state.messages.push(action.payload);
      }
      
      // Update unread count if not in current conversation
      if (!state.currentConversation || 
          action.payload.conversation !== state.currentConversation._id) {
        state.unreadCount += 1;
      }
      
      // Update conversation list if the conversation exists
      const conversationIndex = state.conversationList.findIndex(
        c => c._id === action.payload.conversation
      );
      
      if (conversationIndex !== -1) {
        const updatedList = [...state.conversationList];
        updatedList[conversationIndex] = {
          ...updatedList[conversationIndex],
          lastMessage: action.payload.content,
          updatedAt: action.payload.createdAt
        };
        // Sort conversations by last message date
        state.conversationList = updatedList.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      }
    },

    resetMessageSuccess: (state) => {
      state.success = false;
      state.error = null;
    }
  }
});

export const {
  fetchMessagesRequest,
  fetchMessagesSuccess,
  fetchMessagesFail,
  fetchConversationsRequest,
  fetchConversationsSuccess,
  fetchConversationsFail,
  sendMessageRequest,
  sendMessageSuccess,
  sendMessageFail,
  setCurrentConversation,
  updateUnreadCount,
  markAsReadRequest,
  markAsReadSuccess,
  markAsReadFail,
  receiveMessage,
  resetMessageSuccess
} = messageSlice.actions;

export default messageSlice.reducer;