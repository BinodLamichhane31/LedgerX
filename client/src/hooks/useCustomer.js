import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  addCustomerService,
  getCustomersByShopService,
  getCustomerByIdService,
  updateCustomerService,
  deleteCustomerService,
} from "../services/customerService";
import { useNavigate } from "react-router-dom";

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCustomerService,
    mutationKey: ['add_customer'],
    onSuccess: (data) => {
      toast.success(data.message || "Customer added successfully.");
      queryClient.invalidateQueries(['customers']);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add customer.");
    },
  });
};

export const useGetCustomersByShop = (params) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => getCustomersByShopService(params),
    select: (res) => res.data,
    enabled: !!params?.shopId,
    retry: false,
  });
};


export const useGetCustomerById = (id) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerByIdService(id),
    select: (res) => res.data,
    enabled: !!id,
    retry: false,
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerData) => {
      const { id, ...data } = customerData; 
      return updateCustomerService(id, data);
    },
    mutationKey: ['update_customer'],
    onSuccess: (response) => {
      toast.success(response.message || "Customer updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      if (response.data?._id) {
        queryClient.invalidateQueries({ queryKey: ['customer', response.data._id] });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update customer.");
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (id) => deleteCustomerService(id),
    mutationKey: ['delete_customer'],
    onSuccess: (data) => {
      navigate('/customers')
      toast.success(data.message || "Customer deleted.");
      queryClient.invalidateQueries(['customers']);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete customer.");
    },
  });
};
