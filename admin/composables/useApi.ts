export const useApi = () => {
  const { accessToken } = useAuth()
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl || 'https://api.interestingapp.local'

  const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${apiBaseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add authorization header if token exists
    if (accessToken.value) {
      headers['Authorization'] = `Bearer ${accessToken.value}`
    }

    try {
      const response = await $fetch<T>(url, {
        ...options,
        headers
      })

      return response
    } catch (error: any) {
      console.error(`API call failed for ${endpoint}:`, error)
      
      // Handle authentication errors
      if (error.status === 401) {
        const { logout } = useAuth()
        await logout()
      }

      throw error
    }
  }

  // User management API calls
  const users = {
    getAll: () => apiCall<{ data: any[] }>('/users'),
    getById: (id: string) => apiCall<{ data: any }>(`/users/${id}`),
    create: (userData: any) => apiCall<{ data: any }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    update: (id: string, userData: any) => apiCall<{ data: any }>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    }),
    delete: (id: string) => apiCall<{ message: string }>(`/users/${id}`, {
      method: 'DELETE'
    })
  }

  // Dashboard/stats API calls
  const dashboard = {
    getStats: () => apiCall<{ 
      data: { 
        totalUsers: number
        activeSessions: number
        apiCalls: number
      } 
    }>('/admin/stats'),
    getActivity: () => apiCall<{ 
      data: Array<{
        id: string
        description: string
        timestamp: string
      }> 
    }>('/admin/activity')
  }

  // Profile API calls
  const profile = {
    get: () => apiCall<{ data: any }>('/auth/profile'),
    update: (profileData: any) => apiCall<{ data: any }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    })
  }

  return {
    apiCall,
    users,
    dashboard,
    profile
  }
}