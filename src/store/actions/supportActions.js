import axios from 'axios';
import {
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
  fetchTopSupportersFail
} from '../slices/supportSlice';
import { toast } from 'react-toastify';

// Create support
export const createSupport = (caseId, supportData) => async (dispatch, getState) => {
  try {
    dispatch(createSupportRequest());
    
    const { auth: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    await axios.post(`/api/cases/${caseId}/support`, supportData, config);
    
    dispatch(createSupportSuccess());
    toast.success('Cảm ơn bạn đã ủng hộ!');
  } catch (error) {
    dispatch(
      createSupportFail(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    );
    toast.error(error.response && error.response.data.message
      ? error.response.data.message
      : error.message);
  }
};

// Fetch user supports
export const fetchUserSupports = () => async (dispatch, getState) => {
  try {
    dispatch(fetchUserSupportsRequest());
    
    const { auth: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    const { data } = await axios.get('/api/supports/my-supports', config);
    
    dispatch(fetchUserSupportsSuccess(data));
  } catch (error) {
    dispatch(
      fetchUserSupportsFail(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    );
  }
};

// Fetch all supports (admin)
export const fetchSupports = (page = 1) => async (dispatch, getState) => {
  try {
    dispatch(fetchSupportsRequest());
    
    const { auth: { userInfo } } = getState();
    
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    const { data } = await axios.get(`/api/supports?page=${page}`, config);
    
    dispatch(fetchSupportsSuccess(data));
  } catch (error) {
    dispatch(
      fetchSupportsFail(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    );
  }
};

// Fetch top supporters
export const fetchTopSupporters = (timeFilter = 'all') => async (dispatch) => {
  try {
    dispatch(fetchTopSupportersRequest());
    
    const { data } = await axios.get(`/api/supports/top-supporters?timeFilter=${timeFilter}`);
    
    dispatch(fetchTopSupportersSuccess(data));
  } catch (error) {
    dispatch(
      fetchTopSupportersFail(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      )
    );
  }
};