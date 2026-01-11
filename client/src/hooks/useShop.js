import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createShopService, deleteShopService, getShopByIdService, getShopsService, selectActiveShopService, updateShopService } from "../services/shopService";
import { data } from "react-router-dom";

export const useCreateShop = () =>{
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationFn: createShopService,
            mutationKey:['create_shop'],
            onSuccess: (data) =>{   
                toast.success(data.message || "New shop added.")
                queryClient.invalidateQueries(["shops"])
                queryClient.invalidateQueries({ queryKey: ["profile"] });
            },
            onError: (error)=>{
                toast.error(error.message || "Failed to add new shop.")
            }
        }
    )
}

export const useGetShops = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return useQuery({
    queryKey: ["shops"],
    queryFn: getShopsService,
    select: (response) => response.data?.data || [],
    enabled: !!token && !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetShopById = (id) =>{
    return useQuery(
        {
            queryKey:['shop',id],
            queryFn:() => getShopByIdService(id),
            select: (res) => res.data.data,
            enabled: !!id,
            retry: false
        }
    )
}

export const useUpdateShop = () =>{
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationFn:({id,data})=> updateShopService(id,data),
            mutationKey:['update_shop'],
            onSuccess: (data) =>{
                toast.success(data.message || "Shop updated successfully.")
                queryClient.invalidateQueries(['shops'])
                queryClient.invalidateQueries(['shop',data.data._id])
            },
            onError: (error) =>{
                toast.error(error.message || "Failed to update shop.")
            }
        }
    )
}

export const useDeleteShop = () => { 
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteShopService(id),
        onSuccess: (data) => {
            toast.success(data.message || "Shop deleted successfully 1."); 
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (err) => {
            toast.error(err.data?.message || err.message || "Failed to delete shop.");
        }
    });
};


export const useSelectActiveShop = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selectActiveShopService,
    enabled: !!token && !!user,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });
};




