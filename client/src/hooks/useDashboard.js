import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsService, getDashboardChartService } from '../services/dashboardService';

export const useGetDashboardStats = (params) => {
  return useQuery({
    queryKey: ['dashboard_stats', params],
    queryFn: () => getDashboardStatsService(params),
    enabled: !!params?.shopId,
    select: (data) => data.data,
    retry: (failureCount, error) => {
      // Don't retry on 429 (rate limit) errors
      if (error?.response?.status === 429) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useGetDashboardChart = (params) => {
  return useQuery({
    queryKey: ['dashboard_chart', params],
    queryFn: () => getDashboardChartService(params),
    enabled: !!params?.shopId,
    select: (data) => data.data,
    retry: (failureCount, error) => {
      // Don't retry on 429 (rate limit) errors
      if (error?.response?.status === 429) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};