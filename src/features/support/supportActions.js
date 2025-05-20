import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchTopSupporters = createAsyncThunk(
  "support/fetchTopSupporters",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching top supporters data...");
      const { data } = await axios.get("/api/supports/top-supporters");
      console.log("API response:", data);

      // IMPORTANT: This return is what goes to the reducer
      return data;
    } catch (error) {
      console.error("Error fetching supporters:", error);
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);
