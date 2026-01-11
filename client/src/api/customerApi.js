import axios from './api'
export const addCustomerApi = async (data) => axios.post('/customers',data)
export const getCustomersByShopApi = async (params) => axios.get('/customers',{params})
export const getCustomerByIdApi = async (id) => axios.get(`/customers/${id}`)
export const updateCustomerApi = async (id,data) => axios.put(`/customers/${id}`,data)
export const deleteCustomerApi = async (id) => axios.delete(`/customers/${id}`)