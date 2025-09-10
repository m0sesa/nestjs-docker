# Phase 4: API Integration with NestJS Backend

Set up API integration with axios, request interceptors, and authentication context to connect the mobile app with the NestJS Docker backend.

## 🎯 Goals

- Configure API client with base URL and timeouts
- Implement authentication context with JWT token management
- Set up request/response interceptors for automatic token handling
- Create API service classes for different endpoints
- Handle authentication flows (login, register, logout, token refresh)

## 🔧 API Client Configuration

### **📁 [`services/api.ts`](../mobile/services/api.ts) - Axios Configuration**

```typescript
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
      }
    }

    return Promise.reject(error);
  }
);
```

## 🔐 Authentication Context

### **📁 [`contexts/AuthContext.tsx`](../mobile/contexts/AuthContext.tsx) - Authentication Management**

```typescript
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
```

## 🛠️ API Service Classes

### **API Service Organization**

Create organized API services for different endpoints:

```typescript
// services/api.ts - continued

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
```

## 🔗 Environment Configuration

### **Development Environment Setup**

For local development with the NestJS backend:

```typescript
// app.json - extra configuration
{
  "expo": {
    // ... other config
    "extra": {
      "apiUrl": "https://api.interestingapp.local"
    }
  }
}
```

### **Environment Variables (Alternative)**

Create environment-specific configurations:

```typescript
// services/config.ts
const ENV = {
  development: {
    apiUrl: 'https://api.interestingapp.local',
    timeout: 10000,
  },
  production: {
    apiUrl: 'https://api.yourdomain.com',
    timeout: 5000,
  },
};

const getEnvConfig = () => {
  const isDev = __DEV__;
  return isDev ? ENV.development : ENV.production;
};

export default getEnvConfig();
```

## 🧪 Testing API Integration

### **Step 1: Start Backend Services**

```bash
# Ensure NestJS backend is running
cd infrastructure
just dev-up

# Verify API is accessible
curl https://api.interestingapp.local/health
```

### **Step 2: Test Authentication Flow**

Add this test component to verify API integration:

```typescript
// components/ApiTest.tsx
import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ApiTest() {
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    try {
      const result = await login('test@example.com', 'password123');
      if (result.success) {
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>API Integration Test</Text>
      <Text>User: {user ? `${user.firstName} ${user.lastName}` : 'Not logged in'}</Text>
      <Button 
        title={isLoading ? 'Testing...' : 'Test Login'} 
        onPress={testLogin} 
        disabled={isLoading}
      />
    </View>
  );
}
```

## 🔍 API Request/Response Debugging

### **Enable Network Debugging**

```typescript
// services/api.ts - Add debugging interceptors
if (__DEV__) {
  apiClient.interceptors.request.use(request => {
    console.log('📤 API Request:', {
      method: request.method?.toUpperCase(),
      url: request.url,
      baseURL: request.baseURL,
      headers: request.headers,
    });
    return request;
  });

  apiClient.interceptors.response.use(
    response => {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
      return response;
    },
    error => {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message,
      });
      return Promise.reject(error);
    }
  );
}
```

## 🔧 Common API Integration Issues

### **Issue 1: CORS Problems**
```typescript
// Verify backend CORS configuration allows mobile app origin
// NestJS: app.enableCors({ origin: true }) for development
```

### **Issue 2: Network Security**
```typescript
// For development with self-signed certificates
// Add to app.json for iOS:
"ios": {
  "infoPlist": {
    "NSAppTransportSecurity": {
      "NSAllowsArbitraryLoads": true
    }
  }
}
```

### **Issue 3: Token Storage**
```typescript
// Verify SecureStore is working
const testSecureStore = async () => {
  await SecureStore.setItemAsync('test', 'value');
  const value = await SecureStore.getItemAsync('test');
  console.log('SecureStore test:', value); // Should log 'value'
  await SecureStore.deleteItemAsync('test');
};
```

## ✅ Verification Checklist

Before proceeding, ensure:

- [ ] API client connects to NestJS backend successfully
- [ ] Authentication context provides login/register/logout functions
- [ ] JWT tokens are stored securely and automatically included in requests
- [ ] Token refresh works automatically on 401 responses
- [ ] API service classes are organized and typed properly
- [ ] Error handling works for network and authentication errors
- [ ] Development and production configurations are set up

## 🎯 What's Next

In the next tutorial, we'll implement:
1. **Secure token storage** with Expo SecureStore best practices
2. **Biometric authentication** for enhanced security
3. **Offline token management** and sync strategies
4. **Security considerations** for mobile token storage

→ **Continue to:** [05-secure-storage.md](./05-secure-storage.md)

## 📚 Authentication Flow Diagram

```
Mobile App                    NestJS Backend
    |                             |
    |-- POST /auth/login -------->|
    |<-- { access_token, ... } ---|
    |                             |
    |-- Store tokens securely     |
    |                             |
    |-- API requests with token ->|
    |<-- Protected data ----------|
    |                             |
    |-- Token expires (401) ----->|
    |-- POST /auth/refresh ------>|
    |<-- New tokens --------------|
    |                             |
    |-- Retry original request -->|
    |<-- Success ----------------|
```

---

**Phase 4 Complete** ✅  
*Next: Secure Storage and Token Management*