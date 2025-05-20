import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (timeFilter = 'all', { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.get(`/api/admin/stats?timeFilter=${timeFilter}`, config);
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