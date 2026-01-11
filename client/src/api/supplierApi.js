import axios from './api'
export const addSupplierApi = async (data) => axios.post('/suppliers',data)
export const getSuppliersByShopApi = async (params) => axios.get('/suppliers',{params})
export const getSupplierByIdApi = async (id) => axios.get(`/suppliers/${id}`)
export const updateSupplierApi = async (id,data) => axios.put(`/suppliers/${id}`,data)
export const deleteSupplierApi = async (id) => axios.delete(`/suppliers/${id}`)