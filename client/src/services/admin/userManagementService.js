import axios from "axios"
import { createUserApi, deleteUserByAdminApi, getAllUsersApi, getUserByIdApi, toggleUserStatusApi, updateUserByAdminApi, getUserGrowthStatsApi, bulkDeleteUsersApi, bulkToggleUserStatusApi, getUserPaymentHistoryApi } from "../../api/admin/adminApi"

export const getAllUsersService = async (params) => {
    try {
        const response = await getAllUsersApi(params)
        return response.data
        
    } catch (error) {
        throw error.response?.data?.message || {message:"Failed to fetch users."}
    }
}

export const createUserService = async (data) =>{
    try {
        const response = await createUserApi(data)
        return response.data
    } catch (error) {
        throw error.response?.data?.message || {message:"Failed to create user." }
    }
}

export const getUserByIdService = async (id) =>{
    try {
        const response = await getUserByIdApi(id)
        return response.data
    } catch (error) {
        throw error.response?.data?.message || {message:"Failed to get user by id."}
        
    }
}

export const updateUserByAdminService = async(id, data) =>{
   try {
     const response = await updateUserByAdminApi(id,data)
     return response.data
   } catch (error) {
        throw error.response?.data.message || {message:"User update failed."}
   }
}

export const deleteUserByAdminService = async(id) =>{
   try {
     const response = await deleteUserByAdminApi(id)
     return response.data
   } catch (error) {
        throw error.response?.data.message || {message:"User deletion failed."}
   }
}

export const toggleUserStatusService = async(id) =>{
   try {
     const response = await toggleUserStatusApi(id)
   } catch (error) {
        throw error.response?.data.message || {message:"Failed to toggle user status."}
   }
}

export const getUserGrowthStatsService = async () => {
    try {
        const response = await getUserGrowthStatsApi(); // I will define this next
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || { message: "Failed to fetch user growth stats." };
    }
};

export const bulkDeleteUsersService = async (userIds) => {
    try {
        const response = await bulkDeleteUsersApi(userIds);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || { message: "Failed to delete users." };
    }
}

export const bulkToggleUserStatusService = async (userIds, status) => {
    try {
        const response = await bulkToggleUserStatusApi(userIds, status);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || { message: "Failed to update users status." };
    }
}

export const getUserPaymentHistoryService = async (id) => {
    try {
        const response = await getUserPaymentHistoryApi(id);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || { message: "Failed to fetch user payment history." };
    }
};