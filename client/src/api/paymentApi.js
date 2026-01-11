import axios from './api'; 

export const initiateSubscriptionApi = async () => {
    return axios.post('/payments/initiate-subscription');
};

export const verifySubscriptionApi = async (verificationData) => {
    return axios.post('/payments/verify-subscription',  verificationData );
};