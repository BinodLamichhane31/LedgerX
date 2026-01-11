import axios from './api'

export const createShopApi = async (data) => axios.post("/shops",data)
export const getShopsApi = async () => axios.get('/shops')
export const getShopByIdApi = async (id) => axios.get(`/shops/${id}`)
export const updateShopApi = async (id, data) => axios.put(`/shops/${id}`,data)
export const deleteShopApi = async (id) => axios.delete(`/shops/${id}`)
export const selectActiveShopApi = async (shopID) => axios.post('/shops/select-shop',{shopID},{withCredentials:true})