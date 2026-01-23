import axios from './api'; 

export const initiateSubscriptionApi = async (plan) => {
    return axios.post('/payments/initiate-subscription', { plan });
};

export const verifySubscriptionApi = async (verificationData) => {
    return axios.post('/payments/verify-subscription',  verificationData );
};