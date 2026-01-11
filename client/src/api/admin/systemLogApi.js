import axios from "../api";
export const getSystemLogsApi = (params) => axios.get('/admin/logs',{params})

