import {
  addProductApi,
  getProductsByShopApi,
  getProductByIdApi,
  updateProductApi,
  deleteProductApi,
} from '../api/productApi';

export const addProductService = async (data) => {
  try {
    const response = await addProductApi(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add product.' };
  }
};

export const getProductsByShopService = async (params) => {
  try {
    const response = await getProductsByShopApi(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch products.' };
  }
};

export const getProductByIdService = async (id) => {
  try {
    const response = await getProductByIdApi(id);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch product.' };
  }
};

export const updateProductService = async (id, data) => {
  try {
    const response = await updateProductApi(id, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update product.' };
  }
};

export const deleteProductService = async (id) => {
  try {
    const response = await deleteProductApi(id);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete product.' };
  }
};

