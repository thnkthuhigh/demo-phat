import axios from 'axios';
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
  fetchCaseStatsFail
} from './caseSlice';

// Fetch featured cases
export const fetchFeaturedCases = () => async (dispatch) => {
  try {
    dispatch(fetchFeaturedCasesRequest());
    
    const { data } = await axios.get('/api/cases/featured');
    dispatch(fetchFeaturedCasesSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(fetchFeaturedCasesFail(message));
  }
};

// Fetch all cases with pagination and filters
export const fetchCases = (keyword = '', page = 1, category = '') => async (dispatch) => {
  try {
    dispatch(fetchCasesRequest());
    
    const { data } = await axios.get(
      `/api/cases?keyword=${keyword}&page=${page}&category=${category}`
    );
    dispatch(fetchCasesSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(fetchCasesFail(message));
  }
};

// Fetch case details
export const fetchCaseDetails = (id) => async (dispatch) => {
  try {
    dispatch(fetchCaseDetailsRequest());
    
    const { data } = await axios.get(`/api/cases/${id}`);
    dispatch(fetchCaseDetailsSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(fetchCaseDetailsFail(message));
  }
};

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
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(fetchUserCasesFail(message));
  }
};

// Create case
export const createCase = (caseData) => async (dispatch, getState) => {
  try {
    dispatch(createCaseRequest());
    
    const {
      auth: { userInfo },
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const { data } = await axios.post(`/api/cases`, caseData, config);
    dispatch(createCaseSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(createCaseFail(message));
  }
};

// Update case
export const updateCase = (id, caseData) => async (dispatch, getState) => {
  try {
    dispatch(updateCaseRequest());
    
    const {
      auth: { userInfo },
    } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    const { data } = await axios.put(`/api/cases/${id}`, caseData, config);
    dispatch(updateCaseSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
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
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(deleteCaseFail(message));
  }
};

// Fetch case statistics
export const fetchCaseStats = () => async (dispatch) => {
  try {
    dispatch(fetchCaseStatsRequest());
    
    const { data } = await axios.get('/api/cases/stats');
    dispatch(fetchCaseStatsSuccess(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(fetchCaseStatsFail(message));
  }
};