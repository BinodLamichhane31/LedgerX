import axios from './api'; 
export const askHisabAssistantApi = async (data) => {
    return axios.post('/bot/assist', data);
};