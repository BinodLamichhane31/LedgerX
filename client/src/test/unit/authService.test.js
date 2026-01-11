import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  loginUserService, 
  registerUserService, 
  logoutUserService,
  getProfileService,
  updateProfileService
} from '../../services/authService';

vi.mock('../../api/authApi', () => ({
  loginUserApi: vi.fn(),
  registerUserApi: vi.fn(),
  logoutUserApi: vi.fn(),
  getProfileApi: vi.fn(),
  updateProfileApi: vi.fn(),
}));

import { 
  loginUserApi, 
  registerUserApi, 
  logoutUserApi,
  getProfileApi,
  updateProfileApi
} from '../../api/authApi';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginUserService', () => {
    it('should successfully login user', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        data: {
          user: { id: 1, email: 'test@example.com', role: 'user' },
          token: 'mock-token',
          message: 'Login successful'
        }
      };
      
      loginUserApi.mockResolvedValue(mockResponse);
      
      const result = await loginUserService(loginData);
      
      expect(loginUserApi).toHaveBeenCalledWith(loginData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login errors', async () => {
      const loginData = { email: 'test@example.com', password: 'wrong' };
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' }
        }
      };
      
      loginUserApi.mockRejectedValue(mockError);
      
      await expect(loginUserService(loginData)).rejects.toEqual({
        message: 'Invalid credentials'
      });
    });
  });

  describe('registerUserService', () => {
    it('should successfully register user', async () => {
      const registerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResponse = {
        data: {
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
          message: 'Registration successful'
        }
      };
      
      registerUserApi.mockResolvedValue(mockResponse);
      
      const result = await registerUserService(registerData);
      
      expect(registerUserApi).toHaveBeenCalledWith(registerData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle registration errors', async () => {
      const registerData = { email: 'existing@example.com' };
      const mockError = {
        response: {
          data: { message: 'Email already exists' }
        }
      };
      
      registerUserApi.mockRejectedValue(mockError);
      
      await expect(registerUserService(registerData)).rejects.toEqual({
        message: 'Email already exists'
      });
    });
  });

  describe('logoutUserService', () => {
    it('should successfully logout user', async () => {
      const mockResponse = {
        data: { message: 'Logout successful' }
      };
      
      logoutUserApi.mockResolvedValue(mockResponse);
      
      const result = await logoutUserService();
      
      expect(logoutUserApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle logout errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Logout failed' }
        }
      };
      
      logoutUserApi.mockRejectedValue(mockError);
      
      await expect(logoutUserService()).rejects.toEqual({
        message: 'Logout failed'
      });
    });
  });

  describe('getProfileService', () => {
    it('should successfully fetch user profile', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            avatar: 'avatar.jpg'
          }
        }
      };
      
      getProfileApi.mockResolvedValue(mockResponse);
      
      const result = await getProfileService();
      
      expect(getProfileApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle profile fetch errors', async () => {
      const mockError = {
        response: {
          data: { message: 'Profile not found' }
        }
      };
      
      getProfileApi.mockRejectedValue(mockError);
      
      await expect(getProfileService()).rejects.toEqual({
        message: 'Profile not found'
      });
    });
  });

  describe('updateProfileService', () => {
    it('should successfully update user profile', async () => {
      const updateData = { name: 'Updated Name' };
      const mockResponse = {
        data: {
          user: {
            id: 1,
            name: 'Updated Name',
            email: 'test@example.com'
          },
          message: 'Profile updated successfully'
        }
      };
      
      updateProfileApi.mockResolvedValue(mockResponse);
      
      const result = await updateProfileService(updateData);
      
      expect(updateProfileApi).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle profile update errors', async () => {
      const updateData = { name: 'Updated Name' };
      const mockError = {
        response: {
          data: { message: 'Update failed' }
        }
      };
      
      updateProfileApi.mockRejectedValue(mockError);
      
      await expect(updateProfileService(updateData)).rejects.toEqual({
        message: 'Update failed'
      });
    });
  });
}); 