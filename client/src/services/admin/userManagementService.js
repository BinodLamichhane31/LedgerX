import axios from "axios"
import { createUserApi, deleteUserByAdminApi, getAllUsersApi, getUserByIdApi, toggleUserStatusApi, updateUserByAdminApi } from "../../api/admin/adminApi"

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
     return response.data
   } catch (error) {
        throw error.response?.data.message || {message:"Failed to toggle user status."}
   }
}