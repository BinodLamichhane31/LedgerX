import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { recordCashInService, recordCashOutService } from '../services/cashService';

export const useRecordCashIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordCashInService,
    mutationKey: ['record_cash_in'],
    onSuccess: (data) => {
      toast.success(data.message || 'Payment recorded successfully.');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record payment.');
    },
  });
};

export const useRecordCashOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordCashOutService,
    mutationKey: ['record_cash_out'],
    onSuccess: (data) => {
      toast.success(data.message || 'Payment recorded successfully.');
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record payment.');
    },
  });
};