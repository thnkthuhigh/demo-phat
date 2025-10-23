import axios from "axios";
import {
  fetchCasesRequest,
  fetchCasesSuccess,
  fetchCasesFail,
  fetchFeaturedCasesRequest,
  fetchFeaturedCasesSuccess,
  fetchFeaturedCasesFail,
  fetchCaseDetailsRequest,
  fetchCaseDetailsSuccess,
  fetchCaseDetailsFail,
  fetchUserCasesRequest,
  fetchUserCasesSuccess,
  fetchUserCasesFail,
  createCaseRequest,
  createCaseSuccess,
  createCaseFail,
  updateCaseRequest,
  updateCaseSuccess,
  updateCaseFail,
  deleteCaseRequest,
  deleteCaseSuccess,
  deleteCaseFail,
  fetchCaseStatsRequest,
  fetchCaseStatsSuccess,
  fetchCaseStatsFail,
} from "./caseSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";

// Fetch featured cases
export const fetchFeaturedCases = createAsyncThunk(
  "cases/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/cases/featured");
      return data;
    } catch (error) {
      console.error("Error fetching featured cases:", error);
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Fetch all cases with pagination and filters
export const fetchCases = createAsyncThunk(
  "cases/fetchAll",
  async ({ page = 1, keyword = "", category = "", supportType = "" }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/cases?page=${page}&keyword=${keyword}&category=${category}&supportType=${supportType}`
      );
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

// Fetch case details
export const fetchCaseDetails = createAsyncThunk(
  "cases/fetchDetails",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/cases/${id}`);
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

// Fetch user cases
export const fetchUserCases = () => async (dispatch, getState) => {
  try {
    dispatch(fetchUserCasesRequest());

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/cases/my-cases`, config);
    dispatch(fetchUserCasesSuccess(data));
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    dispatch(fetchUserCasesFail(message));
  }
};

// Create case
export const createCase = createAsyncThunk(
  "cases/create",
  async (caseData, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;

      if (!userInfo || !userInfo.token) {
        return rejectWithValue("Bạn chưa đăng nhập");
      }

      console.log("User info available:", !!userInfo);
      console.log("Token length:", userInfo.token.length);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Log headers để debug
      console.log("Request headers:", config.headers);

      const { data } = await axios.post("/api/cases", caseData, config);
      return data;
    } catch (error) {
      // Log lỗi đầy đủ
      console.error(
        "Create case failed:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update case
export const updateCase = (id, caseData) => async (dispatch, getState) => {
  try {
    dispatch(updateCaseRequest());

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`/api/cases/${id}`, caseData, config);
    dispatch(updateCaseSuccess(data));
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    dispatch(updateCaseFail(message));
  }
};

// Delete case
export const deleteCase = (id) => async (dispatch, getState) => {
  try {
    dispatch(deleteCaseRequest());

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/api/cases/${id}`, config);
    dispatch(deleteCaseSuccess());
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    dispatch(deleteCaseFail(message));
  }
};

// Fetch case statistics
export const fetchCaseStats = () => async (dispatch) => {
  try {
    dispatch(fetchCaseStatsRequest());

    const { data } = await axios.get("/api/cases/stats");
    dispatch(fetchCaseStatsSuccess(data));
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    dispatch(fetchCaseStatsFail(message));
  }
};

// Fetch home statistics
export const fetchHomeStats = createAsyncThunk(
  "cases/fetchHomeStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/cases/stats");
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
