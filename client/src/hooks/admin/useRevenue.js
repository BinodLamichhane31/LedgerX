import { useQuery } from '@tanstack/react-query';
import { getRevenueStats } from '../../api/admin/adminApi';

export const useGetRevenueStats = () => {
    return useQuery({
        queryKey: ['adminRevenue'],
        queryFn: async () => {
            const response = await getRevenueStats();
            return response.data;
        }
    });
};
