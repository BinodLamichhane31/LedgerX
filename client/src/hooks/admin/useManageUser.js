import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createUserService, deleteUserByAdminService, getAllUsersService, getUserByIdService, toggleUserStatusService, updateUserByAdminService } from "../../services/admin/userManagementService"
import { useState } from "react"
import { toast } from "react-toastify";


export const useGetAllUsers = () =>{
    const [pageNumber,setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch]  = useState("");
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const query = useQuery(
        {
            queryKey: ['admin_get_users',pageNumber,pageSize,search,sortField,sortOrder],
            queryFn: () => getAllUsersService({
                page:pageNumber,
                size:pageSize,
                search,
                sortField,
                sortOrder
            }),
            keepPreviousData: true
        }
    )
    return {
        ...query,
        pageNumber,
        setPageNumber,
        pageSize,
        setPageSize,
        search,
        setSearch,
        sortField,
        setSortField,
        sortOrder,
        setSortOrder
    }
}

export const useCreateUser = () =>{
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationKey:['admin_create_user'],
            mutationFn: createUserService,
            onSuccess: () =>{
                toast.success("User added.")
                queryClient.invalidateQueries("admin_get_users")
            }
        }
    )
}

export const useGetUserById = (id) =>{
    const query = useQuery({
        queryKey:['admin_get_user_by_id',id],
        queryFn: () => getUserByIdService(id),
        enabled: !!id,
        retry: false
    })
    const user = query.data?.data || {}
    return {
        ...query,
        user
    }
}

export const useUpdateUserByAdmin = () =>{
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationFn:({id,data}) => updateUserByAdminService(id,data),
            mutationKey:['admin_update_user'],
            onSuccess: () =>{
                toast.success("User updated.")
                queryClient.invalidateQueries("admin_get_users","admin_get_user_by_id")
            },
            onError: (error)=>{
                toast(error.message || "Failed to update user.")
            }
        }
    )

}

export const useDeleteUserByAdmin = () =>{
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationFn:deleteUserByAdminService,
            mutationKey:['admin_delete_user'],
            onSuccess: () =>{
                toast.success("User deleted.")
                queryClient.invalidateQueries("admin_get_users")
            },
            onError: (error)=>{
                toast(error.message || "Failed to delete user.")
            }
        }
    )

}

export const useToggleUserStatus = () =>{
    const queryClient = useQueryClient()
    return useMutation(
        {
            mutationFn:toggleUserStatusService,
            mutationKey:['admin_toggle_user_status'],
            onSuccess: () =>{
                toast.success("User status changed.")
                queryClient.invalidateQueries("admin_get_users")
            },
            onError: (error)=>{
                toast(error.message || "Failed to change user status.")
            }
        }
    )

}