import axios from './api'; 
export const createSaleApi = async (data) => axios.post('/sales', data);
export const getSalesApi = async (params) => axios.get('/sales', { params });
export const getSaleByIdApi = async (id) => axios.get(`/sales/${id}`);
export const cancelSaleApi = async (id) => axios.put(`/sales/${id}/cancel`);
export const recordPaymentForSaleApi = async (id, data) => axios.put(`/sales/${id}/payment`, data);