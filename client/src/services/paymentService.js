import { initiateSubscriptionApi, verifySubscriptionApi, getPaymentHistoryApi } from '../api/paymentApi';

export const initiateSubscriptionService = async (plan) => {
    try {
        const response = await initiateSubscriptionApi(plan);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to start payment process.' };
    }
};

export const verifySubscriptionService = async (verificationData) => {
    try {
        const response = await verifySubscriptionApi(verificationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Payment verification failed.' };
    }
};

export const getPaymentHistoryService = async () => {
    try {
        const response = await getPaymentHistoryApi();
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to fetch payment history.' };
    }
};