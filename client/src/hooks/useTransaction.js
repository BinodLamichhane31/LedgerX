import { useQuery } from '@tanstack/react-query';
import { getTransactionsService } from '../services/transactionService';

export const useGetTransactions = (params) => {
  return useQuery({
    queryKey: ['transactions', params], 
    queryFn: () => getTransactionsService(params),
    enabled: !!params?.shopId,
    retry: false,
  });
};