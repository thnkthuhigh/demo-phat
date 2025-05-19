import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  supports: [],
  userSupports: [],
  topSupporters: [],
  loading: false,
  error: null,
  success: false
};

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    createSupportRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    createSupportSuccess: (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    },
    createSupportFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    
    fetchUserSupportsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserSupportsSuccess: (state, action) => {
      state.loading = false;
      state.userSupports = action.payload;
      state.error = null;
    },
    fetchUserSupportsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    fetchSupportsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSupportsSuccess: (state, action) => {
      state.loading = false;
      state.supports = action.payload;
      state.error = null;
    },
    fetchSupportsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    fetchTopSupportersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTopSupportersSuccess: (state, action) => {
      state.loading = false;
      state.topSupporters = action.payload;
      state.error = null;
    },
    fetchTopSupportersFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    resetSupportSuccess: (state) => {
      state.success = false;
      state.error = null;
    }
  }
});

export const {
  createSupportRequest,
  createSupportSuccess,
  createSupportFail,
  fetchUserSupportsRequest,
  fetchUserSupportsSuccess,
  fetchUserSupportsFail,
  fetchSupportsRequest,
  fetchSupportsSuccess,
  fetchSupportsFail,
  fetchTopSupportersRequest,
  fetchTopSupportersSuccess,
  fetchTopSupportersFail,
  resetSupportSuccess
} = supportSlice.actions;

export default supportSlice.reducer;