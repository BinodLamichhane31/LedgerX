import { toast } from "react-toastify"
import { createShopApi, deleteShopApi, getShopByIdApi, getShopsApi, selectActiveShopApi, updateShopApi } from "../api/shopApi"

export const createShopService = async(formData) =>{
    try {
        const response = await createShopApi(formData)
        return response
    } catch (error) {
        throw error.response?.data || {message: "Failed to add shop"}
    }
}

export const  getShopsService = async () =>{
    try {
        const response = await getShopsApi()
        return response
    } catch (error) {
        throw error.response?.data || {message: "Failed to fetch shops"}
    }
}

export const getShopByIdService = async (id) =>{
    try{
        const response = await getShopByIdApi(id)
        return response
    } catch(error){
        throw error.response?.data || {message: "Failed to fetch shop"}
    }
}

export const updateShopService = async (id, data) =>{
    try {
        const response = await updateShopApi(id,data)
        return response
    } catch (error) {
        throw error.response?.data || {message: "Failed to update shop"}
    }
}

export const deleteShopService = async (id) =>{
    try {
        const response = await deleteShopApi(id)
        return response
    } catch (error) {
        throw error.response?.data || {message: "Failed to delete shop"}
    }
}

export const selectActiveShopService = async (shopId) =>{
    try {
        const response = await selectActiveShopApi(shopId)
        return response
    } catch (error) {
        throw error.response?.data || {message: "Failed to switch shop"}
    }
}

