import { getTransactions } from "../api/transactionApi";

export const getTransactionsService = async (params) => {
  try {
    const response = await getTransactions(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch suppliers.' };
  }
};
