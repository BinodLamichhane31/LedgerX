import axios from "../api";

export const getAllUsersApi = (params) => axios.get('/admin/users',{params})
export const createUserApi = (data) => axios.post('/admin/users',data)
export const getUserByIdApi = (id) => axios.get(`/admin/users/${id}`)
export const updateUserByAdminApi = (id, data) => axios.put(`/admin/users/${id}`,data)
export const deleteUserByAdminApi = (id) => axios.delete(`/admin/users/${id}`)
export const toggleUserStatusApi = (id) => axios.patch(`/admin/users/${id}/status`)

