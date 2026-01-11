import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  addProductService,
  getProductsByShopService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/productService";

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addProductService,
    mutationKey: ['add_product'],
    onSuccess: (data) => {
      toast.success(data.message || "Product added successfully.");
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add product.");
    },
  });
};

export const useGetProductsByShop = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProductsByShopService(params),
    select: (res) => res,
    enabled: !!params?.shopId,
    retry: false,
  });
};

export const useGetProductById = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductByIdService(id),
    select: (res) => res.data,
    enabled: !!id,
    retry: false,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProductService(id, data),
    mutationKey: ['update_product'],
    onSuccess: (data) => {
      toast.success(data.message || "Product updated successfully.");
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', data.data._id]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product.");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProductService(id),
    mutationKey: ['delete_product'],
    onSuccess: (data) => {
      toast.success(data.message || "Product deleted.");
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product.");
    },
  });
};
