import axios from '../api';

// User Management APIs
export const getAllUsersApi = (params) => axios.get('/admin/users',{params});
export const createUserApi = (data) => axios.post('/admin/users',data);
export const getUserByIdApi = (id) => axios.get(`/admin/users/${id}`);
export const updateUserByAdminApi = (id, data) => axios.put(`/admin/users/${id}`,data);
export const deleteUserByAdminApi = (id) => axios.delete(`/admin/users/${id}`);
export const toggleUserStatusApi = (id) => axios.patch(`/admin/users/${id}/status`);
export const bulkDeleteUsersApi = (userIds) => axios.post('/admin/users/bulk-delete', { userIds });
export const bulkToggleUserStatusApi = (userIds, status) => axios.patch('/admin/users/bulk-status', { userIds, status });
export const getUserGrowthStatsApi = () => axios.get('/admin/stats/user-growth');

// Revenue & Subscription APIs
export const getRevenueStats = async () => {
    return axios.get('/admin/revenue');
};

export const getAllSubscriptions = async () => {
    return axios.get('/admin/subscriptions');
};

export const updateUserSubscription = async (userId, data) => {
    return axios.put(`/admin/subscriptions/${userId}`, data);
};
