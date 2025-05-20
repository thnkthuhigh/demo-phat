import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  featuredCases: [],
  cases: [],
  caseDetails: null,
  userCases: [],
  stats: null,
  loading: false,
  error: null,
  success: false,
  homeStats: null,
};

const caseSlice = createSlice({
  name: "cases",
  initialState,
  reducers: {
    // Fetch featured cases
    fetchFeaturedCasesRequest: (state) => {
      state.loading = true;
    },
    fetchFeaturedCasesSuccess: (state, action) => {
      state.loading = false;
      state.featuredCases = action.payload;
      state.error = null;
    },
    fetchFeaturedCasesFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch all cases
    fetchCasesRequest: (state) => {
      state.loading = true;
    },
    fetchCasesSuccess: (state, action) => {
      state.loading = false;
      state.cases = action.payload;
      state.error = null;
    },
    fetchCasesFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch case details
    fetchCaseDetailsRequest: (state) => {
      state.loading = true;
    },
    fetchCaseDetailsSuccess: (state, action) => {
      state.loading = false;
      state.caseDetails = action.payload;
      state.error = null;
    },
    fetchCaseDetailsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch user cases
    fetchUserCasesRequest: (state) => {
      state.loading = true;
    },
    fetchUserCasesSuccess: (state, action) => {
      state.loading = false;
      state.userCases = action.payload;
      state.error = null;
    },
    fetchUserCasesFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create case
    createCaseRequest: (state) => {
      state.loading = true;
    },
    createCaseSuccess: (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    },
    createCaseFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    // Update case
    updateCaseRequest: (state) => {
      state.loading = true;
    },
    updateCaseSuccess: (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    },
    updateCaseFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    // Delete case
    deleteCaseRequest: (state) => {
      state.loading = true;
    },
    deleteCaseSuccess: (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    },
    deleteCaseFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    // Fetch case statistics
    fetchCaseStatsRequest: (state) => {
      state.loading = true;
    },
    fetchCaseStatsSuccess: (state, action) => {
      state.loading = false;
      state.stats = action.payload;
      state.error = null;
    },
    fetchCaseStatsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Reset states
    resetCaseSuccess: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase("homeStats/fetchHomeStats/pending", (state) => {
        state.loading = true;
      })
      .addCase("homeStats/fetchHomeStats/fulfilled", (state, action) => {
        state.loading = false;
        state.homeStats = action.payload;
      })
      .addCase("homeStats/fetchHomeStats/rejected", (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  fetchFeaturedCasesRequest,
  fetchFeaturedCasesSuccess,
  fetchFeaturedCasesFail,
  fetchCasesRequest,
  fetchCasesSuccess,
  fetchCasesFail,
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
  resetCaseSuccess,
} = caseSlice.actions;

export default caseSlice.reducer;
