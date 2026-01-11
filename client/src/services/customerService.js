import {
  addCustomerApi,
  getCustomersByShopApi,
  getCustomerByIdApi,
  updateCustomerApi,
  deleteCustomerApi,
} from '../api/customerApi';

export const addCustomerService = async (data) => {
  try {
    const response = await addCustomerApi(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add customer.' };
  }
};

export const getCustomersByShopService = async (params) => {
  try {
    const response = await getCustomersByShopApi(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch customers.' };
  }
};

export const getCustomerByIdService = async (id) => {
  try {
    const response = await getCustomerByIdApi(id);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch customer.' };
  }
};

export const updateCustomerService = async (id, data) => {
  try {
    const response = await updateCustomerApi(id, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update customer.' };
  }
};

export const deleteCustomerService = async (id) => {
  try {
    const response = await deleteCustomerApi(id);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete customer.' };
  }
};
