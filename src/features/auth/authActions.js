import axios from 'axios';
import { 
  loginRequest, 
  loginSuccess, 
  loginFail,
  registerRequest,
  registerSuccess,
  registerFail,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFail
} from './authSlice';

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginRequest());

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      '/api/auth/login',
      { email, password },
      config
    );

    dispatch(loginSuccess(data));
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(loginFail(message));
  }
};

// Register user
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(registerRequest());

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post('/api/auth/register', userData, config);

    dispatch(registerSuccess(data));
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(registerFail(message));
  }
};

// Update user profile
export const updateUserProfile = (userData) => async (dispatch, getState) => {
  try {
    dispatch(updateProfileRequest());

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put('/api/users/profile', userData, config);

    dispatch(updateProfileSuccess(data));
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    const message = error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
    dispatch(updateProfileFail(message));
  }
};

// Logout user
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  dispatch({ type: 'auth/logoutUser' });
  // Optional: Reset any other parts of the state on logout
  document.location.href = '/login';
};