import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  addSupplierService,
  getSuppliersByShopService,
  getSupplierByIdService,
  updateSupplierService,
  deleteSupplierService
} from "../services/supplierService";
import { useNavigate } from "react-router-dom";

export const useAddSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSupplierService,
    mutationKey: ['add_supplier'],
    onSuccess: (data) => {
      toast.success(data.message || "Supplier added successfully.");
      queryClient.invalidateQueries(['suppliers']);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add supplier.");
    },
  });
};

export const useGetSuppliersByShop = (params) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => getSuppliersByShopService(params),
    select: (res) => res,
    enabled: !!params?.shopId,
    retry: false,
  });
};

export const useGetSupplierById = (id) => {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplierByIdService(id),
    select: (res) => res.data,
    enabled: !!id,
    retry: false,
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supplierData) => {
      const { id, ...data } = supplierData; 
      return updateSupplierService(id, data);
    },
    mutationKey: ['update_supplier'],
    onSuccess: (response) => {
      toast.success(response.message || "Supplier updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      if (response.data?._id) {
        queryClient.invalidateQueries({ queryKey: ['supplier', response.data._id] });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update customer.");
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (id) => deleteSupplierService(id),
    mutationKey: ['delete_supplier'],
    onSuccess: (data) => {
      navigate('/suppliers')
      toast.success(data.message || "Supplier deleted.");
      queryClient.invalidateQueries(['suppliers']);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete supplier.");
    },
  });
};
