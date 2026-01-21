import axios from '../api/api';

const MFA_URL = '/mfa';

export const setupMFAService = async () => {
    const response = await axios.post(`${MFA_URL}/setup`);
    return response.data;
};

export const verifySetupService = async (code) => {
    const response = await axios.post(`${MFA_URL}/verify-setup`, { code });
    return response.data;
};

export const disableMFAService = async (data) => {
    const response = await axios.post(`${MFA_URL}/disable`, data);
    return response.data;
};

export const verifyLoginMFAService = async (code, tempToken) => {
    const response = await axios.post('/auth/mfa', { code }, {
        headers: {
            Authorization: `Bearer ${tempToken}`
        }
    });
    return response.data;
};
