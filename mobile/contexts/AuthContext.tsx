import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const response = await apiClient.get('/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      }
    } catch (error) {
      // Token invalid, remove it
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, refresh_token, user: userData } = response.data;

      await SecureStore.setItemAsync('authToken', access_token);
      await SecureStore.setItemAsync('refreshToken', refresh_token);
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { access_token, refresh_token, user: newUser } = response.data;

      await SecureStore.setItemAsync('authToken', access_token);
      await SecureStore.setItemAsync('refreshToken', refresh_token);
      setUser(newUser);

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        await apiClient.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      // Logout endpoint failed, but we'll clear local storage anyway
    } finally {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refresh = await SecureStore.getItemAsync('refreshToken');
      if (!refresh) return false;

      const response = await apiClient.post('/auth/refresh', { refresh_token: refresh });
      const { access_token, refresh_token: newRefreshToken } = response.data;

      await SecureStore.setItemAsync('authToken', access_token);
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);

      return true;
    } catch (error) {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};