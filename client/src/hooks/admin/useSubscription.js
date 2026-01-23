import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllSubscriptions, updateUserSubscription } from '../../api/admin/adminApi';
import { toast } from 'react-toastify';

export const useGetSubscriptions = () => {
    return useQuery({
        queryKey: ['adminSubscriptions'],
        queryFn: async () => {
            const response = await getAllSubscriptions();
            return response.data;
        }
    });
};

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, data }) => updateUserSubscription(userId, data),
        onSuccess: () => {
            toast.success("Subscription updated successfully");
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update subscription");
        }
    });
};
