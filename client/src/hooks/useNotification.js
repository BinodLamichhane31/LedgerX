import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
} from '../services/notificationService';


export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsService,
    staleTime: 5 * 60 * 1000, 
  });
};


export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => markAsReadService(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred.');
    },
  });
};


export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsReadService,
    onSuccess: (data) => {
      toast.success(data.message || 'All notifications cleared.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast.error(error.message || 'An error occurred.');
    },
  });
};