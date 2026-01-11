import axios from './api'; 
export const getNotificationsApi = () => axios.get('/notifications');
export const markAsReadApi = (notificationId) => axios.put(`/notifications/${notificationId}/read`);
export const markAllAsReadApi = () => axios.put('/notifications/read-all');