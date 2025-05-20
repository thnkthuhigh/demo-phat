import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUserSupports,
  fetchSupports,
  updateSupportStatus,
} from "./supportActions";

const supportSlice = createSlice({
  name: "support",
  initialState: {
    userSupports: [],
    supports: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetSupportSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // User supports (personal history)
      .addCase(fetchUserSupports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSupports.fulfilled, (state, action) => {
        state.loading = false;
        state.userSupports = action.payload;
      })
      .addCase(fetchUserSupports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // All supports (admin)
      .addCase(fetchSupports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupports.fulfilled, (state, action) => {
        state.loading = false;
        state.supports = action.payload;
      })
      .addCase(fetchSupports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update support status
      .addCase(updateSupportStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSupportStatus.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateSupportStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetSupportSuccess } = supportSlice.actions;
export default supportSlice.reducer;
