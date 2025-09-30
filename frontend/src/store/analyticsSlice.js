import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios'; // Assuming axios for API calls

// Thunk to fetch analytics data
export const getAnalytics = createAsyncThunk(
  'analytics/getAnalytics',
  async (period, thunkAPI) => {
    try {
      const response = await axios.get(`/api/analytics/user`, {
        params: { period: period === 0 ? 3650 : period } // Convert 'All Time' (0) to a huge number for backend
      });
      // The backend response structure from your AnalyticsService is nested, so we flatten it for easy use
      return {
          ...response.data.taskStats,
          priorityDistribution: response.data.priorityDistribution,
          completionTrend: response.data.completionTrend,
          insights: response.data.insights || []
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    analytics: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    // Add any synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.analytics = null;
      });
  },
});

export default analyticsSlice.reducer;