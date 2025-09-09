import { jwtDecode } from 'jwt-decode'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthResponse {
  access_token: string
  user: User
}

interface JWTPayload {
  sub: string
  email: string
  iat: number
  exp: number
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  // Initialize auth state from localStorage
  const initAuth = () => {
    if (process.client) {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      
      if (storedToken && storedUser) {
        try {
          // Check if token is still valid
          const decoded = jwtDecode<JWTPayload>(storedToken)
          const isExpired = decoded.exp * 1000 < Date.now()
          
          if (!isExpired) {
            token.value = storedToken
            user.value = JSON.parse(storedUser)
          } else {
            // Token expired, clear storage
            clearAuth()
          }
        } catch (error) {
          console.error('Invalid token:', error)
          clearAuth()
        }
      }
    }
  }

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data } = await $fetch<AuthResponse>('/auth/login', {
        baseURL: config.public.apiUrl,
        method: 'POST',
        body: credentials,
      })

      if (data.access_token && data.user) {
        token.value = data.access_token
        user.value = data.user

        // Store in localStorage
        if (process.client) {
          localStorage.setItem('auth_token', data.access_token)
          localStorage.setItem('auth_user', JSON.stringify(data.user))
        }

        return { success: true }
      } else {
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.data?.message || error.message || 'Login failed' 
      }
    }
  }

  // Logout function
  const logout = () => {
    clearAuth()
    // Redirect to login page
    if (process.client) {
      navigateTo('/login')
    }
  }

  // Clear authentication state
  const clearAuth = () => {
    user.value = null
    token.value = null
    
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  // Get authenticated headers for API requests
  const getAuthHeaders = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  // Fetch user profile (for verification)
  const fetchProfile = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const profile = await $fetch('/auth/profile', {
        baseURL: config.public.apiUrl,
        headers: getAuthHeaders(),
      })

      if (profile) {
        return { success: true }
      } else {
        clearAuth()
        return { success: false, error: 'Invalid profile response' }
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error)
      clearAuth()
      return { 
        success: false, 
        error: error.data?.message || 'Profile fetch failed' 
      }
    }
  }

  // Verify token validity
  const verifyToken = async (): Promise<boolean> => {
    if (!token.value) return false

    try {
      const decoded = jwtDecode<JWTPayload>(token.value)
      const isExpired = decoded.exp * 1000 < Date.now()
      
      if (isExpired) {
        clearAuth()
        return false
      }

      // Also verify with server
      const result = await fetchProfile()
      return result.success
    } catch (error) {
      console.error('Token verification error:', error)
      clearAuth()
      return false
    }
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    initAuth,
    login,
    logout,
    clearAuth,
    getAuthHeaders,
    fetchProfile,
    verifyToken,
  }
}