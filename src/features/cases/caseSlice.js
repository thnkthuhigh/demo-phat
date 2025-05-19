import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  featuredCases: [],
  cases: [],
  caseDetails: null,
  userCases: [],
  stats: null,
  loading: false,
  error: null,
  success: false
};

const caseSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    // Featured cases
    fetchFeaturedCasesRequest: (state) => {
      state.loading = true;
      state.error = null;
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

    // All cases
    fetchCasesRequest: (state) => {
      state.loading = true;
      state.error = null;
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

    // Case details
    fetchCaseDetailsRequest: (state) => {
      state.loading = true;
      state.error = null;
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

    // User cases
    fetchUserCasesRequest: (state) => {
      state.loading = true;
      state.error = null;
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
      state.error = null;
      state.success = false;
    },
    createCaseSuccess: (state, action) => {
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
      state.error = null;
      state.success = false;
    },
    updateCaseSuccess: (state, action) => {
      state.loading = false;
      state.caseDetails = action.payload;
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
      state.error = null;
    },
    deleteCaseSuccess: (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    },
    deleteCaseFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Stats
    fetchCaseStatsRequest: (state) => {
      state.loading = true;
      state.error = null;
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

    // Reset success state
    resetCaseSuccess: (state) => {
      state.success = false;
      state.error = null;
    }
  }
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
  resetCaseSuccess
} = caseSlice.actions;

export default caseSlice.reducer;