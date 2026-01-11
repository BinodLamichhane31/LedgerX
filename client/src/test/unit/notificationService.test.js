import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getNotificationsService, 
  markAsReadService, 
  markAllAsReadService 
} from '../../services/notificationService';

vi.mock('../../api/notificationApi', () => ({
  getNotificationsApi: vi.fn(),
  markAsReadApi: vi.fn(),
  markAllAsReadApi: vi.fn(),
}));

import { 
  getNotificationsApi, 
  markAsReadApi, 
  markAllAsReadApi 
} from '../../api/notificationApi';

describe('Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotificationsService', () => {
    it('should successfully fetch notifications', async () => {
      const mockResponse = {
        data: [
          { id: 1, message: 'Test notification', read: false },
          { id: 2, message: 'Another notification', read: true }
        ]
      };
      
      getNotificationsApi.mockResolvedValue(mockResponse);
      
      const result = await getNotificationsService();
      
      expect(getNotificationsApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = {
        response: {
          data: { message: 'Network error' }
        }
      };
      
      getNotificationsApi.mockRejectedValue(mockError);
      
      await expect(getNotificationsService()).rejects.toEqual({
        message: 'Network error'
      });
    });

    it('should handle errors without response data', async () => {
      const mockError = new Error('Generic error');
      getNotificationsApi.mockRejectedValue(mockError);
      
      await expect(getNotificationsService()).rejects.toEqual({
        message: 'Failed to fetch notifications.'
      });
    });
  });

  describe('markAsReadService', () => {
    it('should successfully mark notification as read', async () => {
      const notificationId = '123';
      const mockResponse = {
        data: { success: true, message: 'Marked as read' }
      };
      
      markAsReadApi.mockResolvedValue(mockResponse);
      
      const result = await markAsReadService(notificationId);
      
      expect(markAsReadApi).toHaveBeenCalledWith(notificationId);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors when marking as read', async () => {
      const notificationId = '123';
      const mockError = {
        response: {
          data: { message: 'Invalid notification ID' }
        }
      };
      
      markAsReadApi.mockRejectedValue(mockError);
      
      await expect(markAsReadService(notificationId)).rejects.toEqual({
        message: 'Invalid notification ID'
      });
    });
  });

  describe('markAllAsReadService', () => {
    it('should successfully mark all notifications as read', async () => {
      const mockResponse = {
        data: { success: true, message: 'All notifications marked as read' }
      };
      
      markAllAsReadApi.mockResolvedValue(mockResponse);
      
      const result = await markAllAsReadService();
      
      expect(markAllAsReadApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors when marking all as read', async () => {
      const mockError = {
        response: {
          data: { message: 'Server error' }
        }
      };
      
      markAllAsReadApi.mockRejectedValue(mockError);
      
      await expect(markAllAsReadService()).rejects.toEqual({
        message: 'Server error'
      });
    });
  });
}); 