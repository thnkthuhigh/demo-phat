import { createSlice } from "@reduxjs/toolkit";
import { fetchTopSupporters } from "./supportActions";

const initialState = {
  topSupporters: [],
  userSupports: [],
  supports: [],
  loading: false,
  error: null,
  success: false,
};

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopSupporters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopSupporters.fulfilled, (state, action) => {
        state.loading = false;
        state.topSupporters = action.payload; // Store API response in topSupporters
        console.log("Updated topSupporters with:", action.payload);
      })
      .addCase(fetchTopSupporters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default supportSlice.reducer;
