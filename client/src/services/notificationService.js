import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi
} from '../api/notificationApi';

export const getNotificationsService = async () => {
  try {
    const response = await getNotificationsApi();
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notifications.' };
  }
};

export const markAsReadService = async (notificationId) => {
  try {
    const response = await markAsReadApi(notificationId);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark notification as read.' };
  }
};

export const markAllAsReadService = async () => {
  try {
    const response = await markAllAsReadApi();
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark all notifications as read.' };
  }
};