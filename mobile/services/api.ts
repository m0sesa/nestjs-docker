import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.interestingapp.local';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;

          await SecureStore.setItemAsync('authToken', access_token);
          await SecureStore.setItemAsync('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // You might want to emit an event here to redirect to login
      }
    }

    return Promise.reject(error);
  }
);

// API Service Classes
export class AuthAPI {
  static async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  static async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }

  static async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  static async refreshToken(refreshToken: string) {
    const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  }
}

export class UserAPI {
  static async getUsers(page = 1, limit = 20) {
    const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  }

  static async getUserById(id: string) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }

  static async updateProfile(userData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
  }>) {
    const response = await apiClient.patch('/users/profile', userData);
    return response.data;
  }

  static async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    const response = await apiClient.patch('/users/change-password', data);
    return response.data;
  }
}

export class NotificationAPI {
  static async sendTestNotification(message: string) {
    const response = await apiClient.post('/notifications/test', { message });
    return response.data;
  }

  static async getNotifications(page = 1, limit = 20) {
    const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  }

  static async markAsRead(notificationId: string) {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }
}