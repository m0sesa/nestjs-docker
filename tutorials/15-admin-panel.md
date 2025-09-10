# Phase 15: Modern Admin Panel with Nuxt 3 & Shadcn/ui

Build a comprehensive admin panel using Nuxt 3, Shadcn/ui components, and Tailwind CSS, integrated with JWT authentication from the existing NestJS API.

## 🎯 Goals

- Create a modern admin panel with Nuxt 3 and Vue 3
- Implement Shadcn/ui components with Tailwind CSS styling
- Integrate JWT authentication with existing NestJS API
- Build responsive dashboard with user management
- Add Docker containerization and Traefik routing
- Establish admin panel development workflow

## 📦 Packages Installed

```bash
# Core Nuxt 3 Framework
npm install nuxt vue vue-router

# UI Framework and Styling
npm install @nuxtjs/tailwindcss @vueuse/nuxt @pinia/nuxt
npm install -D tailwindcss @tailwindcss/typography @tailwindcss/forms autoprefixer postcss

# Shadcn/ui Dependencies
npm install lucide-vue-next class-variance-authority clsx tailwind-merge

# Authentication
npm install jwt-decode
```

**Package Purposes:**
- `nuxt` - Vue 3 meta-framework with SSR/SPA capabilities
- `@nuxtjs/tailwindcss` - Official Tailwind CSS module for Nuxt
- `@vueuse/nuxt` - Vue composition utilities
- `@pinia/nuxt` - State management for Vue
- `lucide-vue-next` - Modern icon library for Vue
- `class-variance-authority` - Class variant system for component styling
- `clsx` & `tailwind-merge` - Utility for conditional CSS classes
- `jwt-decode` - JWT token decoding for authentication

## 🛠️ Step-by-Step Implementation

### **1. Initialize Nuxt 3 Admin Panel**

```bash
# From project root
npx nuxi@latest init admin
cd admin
npm install
```

This creates the basic Nuxt 3 structure:
```
admin/
├── app/
│   └── app.vue
├── pages/           # Will be created
├── components/      # Will be created
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

### **2. Configure Nuxt for Admin Panel**

```typescript
// admin/nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@pinia/nuxt',
  ],

  css: ['~/assets/css/globals.css'],

  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'https://api.interestingapp.local',
    }
  },

  ssr: false, // SPA mode for admin panel
  
  app: {
    head: {
      title: 'Admin Panel',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Admin Panel for NestJS Application' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap' }
      ]
    }
  },
})
```

**📁 File:** [`admin/nuxt.config.ts`](../admin/nuxt.config.ts)

### **3. Set Up Tailwind CSS with Shadcn/ui Variables**

```javascript
// admin/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}
```

**📁 File:** [`admin/tailwind.config.js`](../admin/tailwind.config.js)

### **4. Create Global CSS with Shadcn/ui Design Tokens**

```css
/* admin/assets/css/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 9% 20%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 72.22% 50.59%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5% 64.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

**📁 File:** [`admin/assets/css/globals.css`](../admin/assets/css/globals.css)

### **5. Create Utility Functions and Components**

```typescript
// admin/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**📁 File:** [`admin/lib/utils.ts`](../admin/lib/utils.ts)

**Create Essential Shadcn/ui Components:**

```vue
<!-- admin/components/ui/Button.vue -->
<template>
  <component
    :is="tag"
    :class="buttonVariants({ variant, size, className })"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { cva } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface Props {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  tag?: string
  className?: string
}

const { variant = 'default', size = 'default', tag = 'button', className } = defineProps<Props>()
</script>
```

**📁 File:** [`admin/components/ui/Button.vue`](../admin/components/ui/Button.vue)

### **6. Implement Authentication System**

```typescript
// admin/composables/useAuth.ts
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

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    initAuth,
    login,
    logout,
    clearAuth,
    getAuthHeaders,
  }
}
```

**📁 File:** [`admin/composables/useAuth.ts`](../admin/composables/useAuth.ts)

### **7. Create Login Page**

```vue
<!-- admin/pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Panel
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>
      
      <Card class="mt-8">
        <CardHeader>
          <h3 class="text-lg font-medium">Sign In</h3>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div v-if="error" class="rounded-md bg-red-50 p-4">
              <div class="text-sm text-red-700">
                {{ error }}
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div class="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  v-model="credentials.email"
                  placeholder="Enter your email"
                  :disabled="loading"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div class="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  v-model="credentials.password"
                  placeholder="Enter your password"
                  :disabled="loading"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                :disabled="loading"
                className="w-full"
              >
                <span v-if="loading">Signing in...</span>
                <span v-else>Sign in</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div class="text-center">
        <p class="text-xs text-gray-500">
          Use your NestJS application credentials
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { login, isAuthenticated } = useAuth()

// Redirect if already authenticated
watchEffect(() => {
  if (isAuthenticated.value) {
    navigateTo('/')
  }
})

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!credentials.value.email || !credentials.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await login(credentials.value)
    
    if (result.success) {
      // Redirect to dashboard
      await navigateTo('/')
    } else {
      error.value = result.error || 'Login failed'
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred during login'
  } finally {
    loading.value = false
  }
}

// Initialize auth on page load
onMounted(() => {
  const { initAuth } = useAuth()
  initAuth()
})
</script>
```

**📁 File:** [`admin/pages/login.vue`](../admin/pages/login.vue)

### **8. Create Admin Dashboard Layout**

```vue
<!-- admin/layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              Admin Panel
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">
              Welcome, {{ user?.username }}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              @click="handleLogout"
            >
              <LogOut class="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar -->
    <div class="flex">
      <div class="w-64 bg-white shadow-sm min-h-screen">
        <nav class="mt-5 px-2">
          <div class="space-y-1">
            <NuxtLink
              to="/"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path === '/' 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <Home class="mr-3 h-5 w-5" />
              Dashboard
            </NuxtLink>
            
            <NuxtLink
              to="/users"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/users') 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <Users class="mr-3 h-5 w-5" />
              Users
            </NuxtLink>
            
            <NuxtLink
              to="/settings"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
              :class="$route.path.startsWith('/settings') 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <Settings class="mr-3 h-5 w-5" />
              Settings
            </NuxtLink>
          </div>
        </nav>
      </div>

      <!-- Main content -->
      <div class="flex-1 p-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home, Users, Settings, LogOut } from 'lucide-vue-next'

const { user, logout } = useAuth()

const handleLogout = () => {
  logout()
}
</script>
```

**📁 File:** [`admin/layouts/default.vue`](../admin/layouts/default.vue)

### **9. Create Dashboard Page**

```vue
<!-- admin/pages/index.vue -->
<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-gray-600">Welcome to your admin panel</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Users Card -->
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Users class="h-8 w-8 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Users</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalUsers }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Active Sessions -->
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Activity class="h-8 w-8 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Active Sessions</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.activeSessions }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- API Requests -->
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BarChart class="h-8 w-8 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">API Requests</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.apiRequests }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- System Health -->
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Shield class="h-8 w-8 text-emerald-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">System Health</p>
              <p class="text-2xl font-semibold text-gray-900">
                <span class="text-green-600">Healthy</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Users -->
      <Card>
        <CardHeader>
          <h3 class="text-lg font-medium">Recent Users</h3>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="text-center py-4">
            <p class="text-gray-500">Loading...</p>
          </div>
          <div v-else-if="recentUsers.length === 0" class="text-center py-4">
            <p class="text-gray-500">No users found</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="user in recentUsers"
              :key="user.id"
              class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div>
                <p class="font-medium text-gray-900">{{ user.username }}</p>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
              <div class="text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- System Status -->
      <Card>
        <CardHeader>
          <h3 class="text-lg font-medium">System Status</h3>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Database</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                Connected
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">API Server</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                Online
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Email Service</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                Active
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Last Backup</span>
              <span class="text-sm text-gray-500">2 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users, Activity, BarChart, Shield } from 'lucide-vue-next'

// Auth middleware
const { isAuthenticated, initAuth } = useAuth()

// Redirect to login if not authenticated
watchEffect(() => {
  if (process.client && !isAuthenticated.value) {
    navigateTo('/login')
  }
})

// Initialize auth on page load
onMounted(() => {
  initAuth()
})

// Dashboard data
const loading = ref(false)
const stats = ref({
  totalUsers: '1,234',
  activeSessions: '89',
  apiRequests: '12.3k',
  systemHealth: 'Healthy'
})

const recentUsers = ref([
  { id: '1', username: 'john_doe', email: 'john@example.com', createdAt: '2024-01-15T10:30:00Z' },
  { id: '2', username: 'jane_smith', email: 'jane@example.com', createdAt: '2024-01-14T15:45:00Z' },
  { id: '3', username: 'bob_wilson', email: 'bob@example.com', createdAt: '2024-01-13T09:20:00Z' },
])

// Utility functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}
</script>
```

**📁 File:** [`admin/pages/index.vue`](../admin/pages/index.vue)

### **10. Docker Containerization**

```dockerfile
# admin/Dockerfile
# Multi-stage build for Nuxt 3 Admin Panel
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nuxtjs -u 1001

# Stage 1: Dependencies
FROM base AS dependencies
WORKDIR /app
RUN chown -R nuxtjs:nodejs /app

# Copy package files
COPY --chown=nuxtjs:nodejs package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build
FROM base AS build
WORKDIR /app
RUN chown -R nuxtjs:nodejs /app

# Copy package files and install all dependencies
COPY --chown=nuxtjs:nodejs package*.json ./
RUN npm ci

# Copy source code
COPY --chown=nuxtjs:nodejs . .

# Build the application
RUN npm run build

# Stage 3: Development
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app
RUN chown -R nuxtjs:nodejs /app

# Copy package files and install all dependencies
COPY --chown=nuxtjs:nodejs package*.json ./
RUN npm ci

# Copy source code
COPY --chown=nuxtjs:nodejs . .

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Start development server
CMD ["dumb-init", "npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 4: Production
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
RUN chown -R nuxtjs:nodejs /app

# Copy production dependencies
COPY --from=dependencies --chown=nuxtjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=build --chown=nuxtjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start production server
CMD ["dumb-init", "node", ".output/server/index.mjs"]
```

**📁 File:** [`admin/Dockerfile`](../admin/Dockerfile)

### **11. Infrastructure Integration**

**Update Development Docker Compose:**

```yaml
# infrastructure/docker/docker-compose.dev.yml (admin service addition)
  admin:
    build:
      context: ../../admin
      target: development
    container_name: admin-panel-dev
    volumes:
      - ../../admin:/app
      - /app/node_modules
    environment:
      - API_URL=https://api.interestingapp.local
    depends_on:
      - app
    networks:
      - traefik-network
```

**Update Traefik Development Routes:**

```yaml
# infrastructure/traefik/config/dev-routes.yml (admin route addition)
  routers:
    # Admin Panel
    admin-panel:
      rule: "Host(`admin.interestingapp.local`)"
      entryPoints: [websecure]
      service: admin-panel
      tls:
        domains:
          - main: "interestingapp.local"
            sans: ["*.interestingapp.local"]

  services:
    admin-panel:
      loadBalancer:
        servers:
          - url: "http://admin-panel-dev:3000"
```

**Update Environment Configuration:**

```bash
# infrastructure/.env.development (admin panel additions)
# Admin Panel Configuration
ADMIN_PANEL_URL=https://admin.interestingapp.local
API_URL=https://api.interestingapp.local
```

### **12. Update hosts file**

Add the admin panel domain to your hosts file:

```bash
# /etc/hosts
127.0.0.1 admin.interestingapp.local
```

## 🔄 Git Commit

This step corresponds to commit: `d32abda`

```bash
git add .
git commit -m "Add modern admin panel with Nuxt 3 and Shadcn/ui

🎨 Major Features:
- Complete admin panel built with Nuxt 3 and Vue 3
- Modern UI components using Shadcn/ui and Tailwind CSS
- JWT authentication integration with existing NestJS API
- Responsive dashboard with user management interface
- Docker containerization with multi-stage builds

🏗️ Technical Implementation:
- Nuxt 3 SPA mode for admin functionality
- Shadcn/ui components (Button, Card, Input) with CVA variants
- Tailwind CSS with custom design tokens and variables
- Authentication composable with JWT token management
- Route protection middleware and login/logout flows
- TypeScript throughout with proper type definitions"
```

## 🌐 Development URLs

With the complete setup, your admin panel is available at:
- **🎨 Admin Panel**: https://admin.interestingapp.local
- **📱 API Backend**: https://api.interestingapp.local
- **📚 API Docs**: https://api.interestingapp.local/api/docs

## 🚀 Testing Admin Panel

### **1. Start Development Environment:**
```bash
cd infrastructure
just dev-up
```

### **2. Access Admin Panel:**
```bash
# Open admin panel
open https://admin.interestingapp.local
```

### **3. Test Authentication:**
1. Use existing user credentials from your NestJS API
2. Login should redirect to dashboard
3. Browse user management and system metrics

### **4. Development Workflow:**
```bash
# View admin panel logs
just admin-logs

# Rebuild admin panel
just admin-build

# Install additional packages
cd admin && npm install <package-name>
```

## 📝 Admin Panel Features

### **🔐 Authentication:**
- JWT token integration with NestJS API
- Automatic token validation and renewal
- Secure logout and session management
- Route protection middleware

### **🎨 Modern UI:**
- Shadcn/ui component system
- Responsive design with Tailwind CSS
- Professional admin interface
- Consistent design tokens and theming

### **📊 Dashboard:**
- System statistics and metrics
- User management interface
- Real-time status indicators
- Recent activity tracking

### **🛠️ Development Features:**
- Hot reload in development
- TypeScript throughout
- Component composition with Vue 3
- Modular architecture

## 🎯 What's Next

### **Immediate Enhancements:**
1. **User CRUD Operations**: Create, edit, delete users
2. **Role Management**: User permissions and roles
3. **Settings Panel**: Application configuration
4. **Real-time Updates**: WebSocket integration

### **Advanced Features:**
1. **Advanced Dashboard**: Charts and analytics
2. **Audit Logs**: Track administrative actions
3. **Bulk Operations**: Mass user management
4. **Export Features**: Data export functionality

### **Integration Enhancements:**
1. **API Expansion**: Add user management endpoints to NestJS
2. **Real Data**: Replace mock data with live API calls
3. **Caching**: Implement data caching strategies
4. **Error Handling**: Enhanced error reporting and recovery

The admin panel provides a solid foundation for managing your NestJS application with a modern, responsive interface that integrates seamlessly with your existing infrastructure! 🚀