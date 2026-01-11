import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsService, getDashboardChartService } from '../services/dashboardService';

export const useGetDashboardStats = (params) => {
  return useQuery({
    queryKey: ['dashboard_stats', params],
    queryFn: () => getDashboardStatsService(params),
    enabled: !!params?.shopId,
    select: (data) => data.data, 
  });
};

export const useGetDashboardChart = (params) => {
  return useQuery({
    queryKey: ['dashboard_chart', params],
    queryFn: () => getDashboardChartService(params),
    enabled: !!params?.shopId,
    select: (data) => data.data,
  });
};