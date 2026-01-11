import axios from './api'; 
export const createPurchaseApi = async (data) => axios.post('/purchases', data);
export const getPurchasesApi = async (params) => axios.get('/purchases', { params });
export const getPurchaseByIdApi = async (id) => axios.get(`/purchases/${id}`);
export const cancelPurchaseApi = async (id) => axios.put(`/purchases/${id}/cancel`);
export const recordPaymentForPurchaseApi = async (id, data) => axios.put(`/purchases/${id}/payment`, data);