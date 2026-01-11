import {
  createPurchaseApi,
  getPurchasesApi,
  getPurchaseByIdApi,
  cancelPurchaseApi,
  recordPaymentForPurchaseApi
} from '../api/purchaseApi';

export const createPurchaseService = async (data) => {
  try {
    const response = await createPurchaseApi(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create purchase.' };
  }
};

export const getPurchasesService = async (params) => {
  try {
    const response = await getPurchasesApi(params);
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch purchases.' };
  }
};

export const getPurchaseByIdService = async (id) => {
  try {
    const response = await getPurchaseByIdApi(id);
    return response.data; 
  } catch (error)
  {
    throw error.response?.data || { message: 'Failed to fetch purchase details.' };
  }
};

export const cancelPurchaseService = async (id) => {
  try {
    const response = await cancelPurchaseApi(id);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel the purchase.' };
  }
};

export const recordPaymentForPurchaseService = async (id, data) => {
  try {
    const response = await recordPaymentForPurchaseApi(id, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record payment.' };
  }
};