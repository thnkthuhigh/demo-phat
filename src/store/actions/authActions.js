import axios from 'axios';
import {
  loginRequest,
  loginSuccess,
  loginFail,
  logoutUser,
  registerRequest,
  registerSuccess,
  registerFail,
  updateProfileRequest,
  updateProfileSuccess,
  updateProfileFail
} from '../slices/authSlice';
import { toast } from 'react-toastify';

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch(loginRequest());
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const { data } = await axios.post(
      '/api/auth/login',
      { email, password },
      config
    );
    
    dispatch(loginSuccess(data));
    localStorage.setItem('userInfo', JSON.stringify(data));
    toast.success('Đăng nhập thành công!');
    
  } catch (error) {
    dispatch(
      loginFail(
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

// Register user
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(registerRequest());
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const { data } = await axios.post(
      '/api/auth/register',
      userData,
      config
    );
    
    dispatch(registerSuccess(data));
    localStorage.setItem('userInfo', JSON.stringify(data));
    toast.success('Đăng ký tài khoản thành công!');
    
  } catch (error) {
    dispatch(
      registerFail(
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

// Logout user
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  dispatch(logoutUser());
  toast.success('Đăng xuất thành công');
};

// Update user profile
export const updateProfile = (userData) => async (dispatch, getState) => {
  try {
    dispatch(updateProfileRequest());
    
    const { auth: { userInfo } } = getState();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`
      }
    };
    
    const { data } = await axios.put(
      '/api/users/profile',
      userData,
      config
    );
    
    dispatch(updateProfileSuccess(data));
    localStorage.setItem('userInfo', JSON.stringify(data));
    toast.success('Cập nhật thông tin thành công!');
    
  } catch (error) {
    dispatch(
      updateProfileFail(
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