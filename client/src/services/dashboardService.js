import { getDashboardStatsApi, getDashboardChartApi } from '../api/dashboardApi';

export const getDashboardStatsService = async (params) => {
  try {
    const response = await getDashboardStatsApi(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch dashboard stats.' };
  }
};

export const getDashboardChartService = async (params) => {
  try {
    const response = await getDashboardChartApi(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch chart data.' };
  }
};