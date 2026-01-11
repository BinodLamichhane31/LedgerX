import { addSupplierApi, deleteSupplierApi, getSupplierByIdApi, getSuppliersByShopApi, updateSupplierApi } from "../api/supplierApi";


export const addSupplierService = async (data) => {
  try {
    const response = await addSupplierApi(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add supplier.' };
  }
};

export const getSuppliersByShopService = async (params) => {
  try {
    const response = await getSuppliersByShopApi(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch suppliers.' };
  }
};

export const getSupplierByIdService = async (id) => {
  try {
    const response = await getSupplierByIdApi(id);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch supplier.' };
  }
};

export const updateSupplierService = async (id, data) => {
  try {
    const response = await updateSupplierApi(id, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update supplier.' };
  }
};

export const deleteSupplierService = async (id) => {
  try {
    const response = await deleteSupplierApi(id);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete supplier.' };
  }
};
