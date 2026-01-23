import { initiateSubscriptionApi, verifySubscriptionApi } from '../api/paymentApi';

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