import axios from './api';

export const recordCashInApi = async (data) => axios.post('/cash/in', data);
export const recordCashOutApi = async (data) => axios.post('/cash/out', data);