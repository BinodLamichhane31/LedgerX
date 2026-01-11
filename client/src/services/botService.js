import { askHisabAssistantApi } from '../api/botApi';

export const askHisabAssistantService = async (data) => {
    try {
        const response = await askHisabAssistantApi(data);
        return response.data; 
    } catch (error) {
        throw error.response?.data || { message: 'Failed to get a response from the assistant.' };
    }
};