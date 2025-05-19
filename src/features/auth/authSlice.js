import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null,
  loading: false,
  error: null,
  success: false
};

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