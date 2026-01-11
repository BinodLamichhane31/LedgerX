import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createSaleService,
  getSalesService,
  getSaleByIdService,
  cancelSaleService,
  recordPaymentForSaleService,
} from "../services/saleService";


export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSaleService,
    mutationKey: ['create_sale'],
    onSuccess: (data) => {
      toast.success(data.message || "Sale created successfully.");
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create sale.");
    },
  });
};

export const useGetSales = (params) => {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => getSalesService(params),
    enabled: !!params?.shopId,
    retry: false,
  });
};


export const useGetSaleById = (id) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => getSaleByIdService(id),
    select: (res) => res.data, 
    enabled: !!id,
    retry: false,
  });
};


export const useCancelSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelSaleService(id),
    mutationKey: ['cancel_sale'],
    onSuccess: (response, id) => {
      toast.success(response.message || "Sale cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', id] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel sale.");
    },
  });
};


export const useRecordPaymentForSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables) => {
      const { id, ...data } = variables; 
      return recordPaymentForSaleService(id, data);
    },
    mutationKey: ['record_payment'],
    onSuccess: (response) => {
      toast.success(response.message || "Payment recorded successfully.");
      const saleId = response.data?._id;
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      if (saleId) {
        queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record payment.");
    },
  });
};