import axios from './api'
export const getTransactions = async (params) => axios.get('/transactions',{params})
