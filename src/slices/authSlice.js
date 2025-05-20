import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.userInfo.token}`,
        },
      };

      const { data } = await axios.put("/api/users/profile", userData, config);

      localStorage.setItem("userInfo", JSON.stringify(data));

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
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
    },
    registerFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFail,
  logoutUser,
  registerRequest,
  registerSuccess,
  registerFail,
} = authSlice.actions;

export default authSlice.reducer;
