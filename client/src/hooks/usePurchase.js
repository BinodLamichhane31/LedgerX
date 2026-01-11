import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createPurchaseService,
  getPurchasesService,
  getPurchaseByIdService,
  cancelPurchaseService,
  recordPaymentForPurchaseService,
} from "../services/purchaseService";

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseService,
    mutationKey: ['create_purchase'],
    onSuccess: (data) => {
      toast.success(data.message || "Purchase created successfully.");
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create purchase.");
    },
  });
};

export const useGetPurchases = (params) => {
  return useQuery({
    queryKey: ['purchases', params], 
    queryFn: () => getPurchasesService(params),
    enabled: !!params?.shopId, 
    retry: false,
  });
};

export const useGetPurchaseById = (id) => {
  return useQuery({
    queryKey: ['purchase', id], 
    queryFn: () => getPurchaseByIdService(id),
    select: (res) => res.data, 
    enabled: !!id,
    retry: false,
  });
};

export const useCancelPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelPurchaseService(id),
    mutationKey: ['cancel_purchase'],
    onSuccess: (response, id) => {
      toast.success(response.message || "Purchase cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel purchase.");
    },
  });
};

export const useRecordPaymentForPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables) => {
      const { id, ...data } = variables; 
      return recordPaymentForPurchaseService(id, data);
    },
    mutationKey: ['record_purchase_payment'],
    onSuccess: (response) => {
      toast.success(response.message || "Payment recorded successfully.");
      const purchaseId = response.data?._id;
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      if (purchaseId) {
        queryClient.invalidateQueries({ queryKey: ['purchase', purchaseId] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record payment.");
    },
  });
};