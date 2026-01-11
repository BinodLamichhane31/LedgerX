import { recordCashInApi, recordCashOutApi } from '../api/cashApi';

export const recordCashInService = async (data) => {
  try {
    const response = await recordCashInApi(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record cash-in payment.' };
  }
};

export const recordCashOutService = async (data) => {
  try {
    const response = await recordCashOutApi(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to record cash-out payment.' };
  }
};