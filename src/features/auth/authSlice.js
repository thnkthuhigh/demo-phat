import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../utils/api';

const initialState = {
  userInfo: localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null,
  loading: false,
  error: null,
  success: false
};

// Thêm hàm để kiểm tra token khi app khởi động
export const checkTokenValidity = createAsyncThunk(
  'auth/checkToken',
  async (_, { getState, dispatch }) => {
    const { userInfo } = getState().auth;
    if (userInfo && userInfo.token) {
      try {
        const { data } = await api.get('/users/profile', {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        return data;
      } catch (error) {
        // Nếu token không hợp lệ, đăng xuất
        dispatch(logoutUser());
        throw new Error('Token hết hạn, vui lòng đăng nhập lại');
      }
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload;
      state.error = null;
    },
    loginFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutUser: (state) => {
      state.userInfo = null;
    },
    registerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload;
      state.error = null;
      state.success = true;
    },
    registerFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    updateProfileRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.userInfo = action.payload;
      state.success = true;
    },
    updateProfileFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    resetAuthSuccess: (state) => {
      state.success = false;
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      state.loading = true;
      state.error = null;
    }
  }
});

export const {
  loginRequest,
  loginSuccess,
  loginFail,
  logoutUser,
  registerRequest,
  registerSuccess,
  registerFail,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFail,
  resetAuthSuccess,
  updateUserProfile
} = authSlice.actions;

export default authSlice.reducer;