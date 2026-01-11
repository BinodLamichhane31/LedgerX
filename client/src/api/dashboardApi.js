import axios from './api';

export const getDashboardStatsApi = (params) => axios.get('/dashboard/stats', { params });
export const getDashboardChartApi = (params) => axios.get('/dashboard/chart', { params });