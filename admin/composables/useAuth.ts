import { jwtDecode } from 'jwt-decode'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthTokens {
  access_token: string
  refresh_token?: string
}

interface DecodedToken {
  sub: string
  email: string
  name: string
  role: string
  exp: number
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const accessToken = useCookie('access_token', { 
    default: () => '',
    secure: true,
    httpOnly: false,
    sameSite: 'strict'
  })

  // API base URL from environment or default
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl || 'https://api.interestingapp.local'

  const login = async (email: string, password: string) => {
    try {
      const { data } = await $fetch<{ data: AuthTokens }>(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        body: {
          email,
          password
        }
      })

      if (data.access_token) {
        accessToken.value = data.access_token
        
        // Decode token to get user info
        const decoded = jwtDecode<DecodedToken>(data.access_token)
        user.value = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        }

        return { success: true }
      }

      return { success: false, error: 'Invalid credentials' }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.data?.message || 'Login failed'
      }
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint if available
      if (accessToken.value) {
        await $fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state
      accessToken.value = ''
      user.value = null
      
      // Redirect to login
      await navigateTo('/login')
    }
  }

  const refresh = async () => {
    // TODO: Implement token refresh if needed
    console.log('Token refresh not implemented yet')
  }

  const checkAuth = () => {
    if (!accessToken.value) {
      return false
    }

    try {
      const decoded = jwtDecode<DecodedToken>(accessToken.value)
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        accessToken.value = ''
        user.value = null
        return false
      }

      // Update user info from token
      if (!user.value) {
        user.value = {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role
        }
      }

      return true
    } catch (error) {
      console.error('Token validation error:', error)
      accessToken.value = ''
      user.value = null
      return false
    }
  }

  const isAuthenticated = computed(() => {
    return !!user.value && !!accessToken.value
  })

  const isAdmin = computed(() => {
    return user.value?.role === 'admin' || user.value?.role === 'superadmin'
  })

  return {
    user: readonly(user),
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refresh,
    checkAuth,
    accessToken: readonly(accessToken)
  }
}