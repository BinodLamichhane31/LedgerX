import {
  createSaleApi,
  getSalesApi,
  getSaleByIdApi,
  cancelSaleApi,
  recordPaymentForSaleApi
} from '../api/saleApi';

export const createSaleService = async (data) => {
  try {
    const response = await createSaleApi(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create sale.' };
  }
};

export const getSalesService = async (params) => {
  try {
    const response = await getSalesApi(params);
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch sales.' };
  }
};

export const getSaleByIdService = async (id) => {
  try {
    const response = await getSaleByIdApi(id);
    return response.data; 
  } catch (error)
  {
    throw error.response?.data || { message: 'Failed to fetch sale details.' };
  }
};

export const cancelSaleService = async (id) => {
  try {
    const response = await cancelSaleApi(id);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to cancel the sale.' };
  }
};

export const recordPaymentForSaleService = async (id, data) => {
  try {
    const response = await recordPaymentForSaleApi(id, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record payment.' };
  }
};