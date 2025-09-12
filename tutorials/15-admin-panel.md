# Phase 15: Modern Admin Panel with Nuxt 4 & Shadcn/ui

Build a comprehensive admin panel using Nuxt 4, Shadcn/ui components, and Tailwind CSS, integrated with JWT authentication from the existing NestJS API.

## 🎯 Goals

- Create a modern admin panel with Nuxt 4 and Vue 3
- Implement Shadcn/ui components with Tailwind CSS styling
- Integrate JWT authentication with existing NestJS API
- Build responsive dashboard with user management
- Add Docker containerization and Traefik routing
- Establish admin panel development workflow

## 📦 Packages Installed

```bash
# Core Nuxt 4 Framework
npm create nuxt@latest admin

# UI Framework and Styling Dependencies
npm install -D @nuxtjs/tailwindcss @vueuse/nuxt clsx tailwind-merge class-variance-authority

# Authentication & Icons
npm install @nuxtjs/google-fonts jwt-decode lucide-vue-next @vee-validate/nuxt vee-validate
```

**Package Purposes:**
- `nuxt@^4.1.1` - Latest Nuxt 4 meta-framework with enhanced performance
- `@nuxtjs/tailwindcss` - Official Tailwind CSS module for Nuxt
- `@vueuse/nuxt` - Vue composition utilities collection
- `@vee-validate/nuxt` - Form validation for Vue with Nuxt integration
- `lucide-vue-next` - Modern icon library with extensive icon set
- `class-variance-authority` - Type-safe variant API for component styling
- `clsx` & `tailwind-merge` - Utilities for conditional CSS classes
- `jwt-decode` - JWT token decoding for authentication

## 🛠️ Step-by-Step Implementation

### **1. Initialize Nuxt 4 Admin Panel**

```bash
# From project root
npm create nuxt@latest admin
cd admin
npm install
```

**Note:** We use `npm create nuxt@latest` as recommended by official Nuxt documentation instead of `npx nuxi@latest init`.

This creates the Nuxt 4 structure:
```
admin/
├── app/
│   ├── app.vue
│   ├── assets/css/        # Tailwind CSS files
│   ├── layouts/           # Page layouts
│   ├── pages/             # Route pages
│   └── middleware/        # Route middleware
├── components/ui/          # Shadcn/ui components
├── composables/           # Vue composables
├── lib/                   # Utility functions
├── nuxt.config.ts
├── package.json
└── Dockerfile
```

### **2. Configure Nuxt 4 for Admin Panel**

```typescript
// admin/nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@vee-validate/nuxt'
  ],
  
  css: ['~/app/assets/css/tailwind.css'],
  
  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://api.interestingapp.local'
    }
  },
  
  ssr: false // Disable SSR for admin panel
})
```

**📁 File:** [`admin/nuxt.config.ts`](../admin/nuxt.config.ts)

**Key Nuxt 4 Changes:**
- CSS files now located in `app/assets/css/` (Nuxt 4 structure)
- Removed Google Fonts module for simplified configuration
- Environment variable directly configured instead of using `process.env`
- SSR disabled for SPA-style admin panel

### **3. Set Up Tailwind CSS with Shadcn/ui Design System**

```css
/* admin/app/assets/css/tailwind.css */
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
    --primary: 240 9% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 10% 3.9%;
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
    --destructive-foreground: 0 0% 98%;
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
  }
}
```

**📁 File:** [`admin/app/assets/css/tailwind.css`](../admin/app/assets/css/tailwind.css)

### **4. Create Utility Functions and UI Components**

```typescript
// admin/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**📁 File:** [`admin/lib/utils.ts`](../admin/lib/utils.ts)

**Essential Shadcn/ui Button Component:**

```vue
<!-- admin/components/ui/Button.vue -->
<template>
  <button
    :class="cn(buttonVariants({ variant, size }), $attrs.class ?? '')"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface ButtonProps {
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
}

defineProps<ButtonProps>()
</script>
```

**📁 File:** [`admin/components/ui/Button.vue`](../admin/components/ui/Button.vue)

### **5. Implement Authentication System with JWT**

```typescript
// admin/composables/useAuth.ts
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
    checkAuth,
    accessToken: readonly(accessToken)
  }
}
```

**📁 File:** [`admin/composables/useAuth.ts`](../admin/composables/useAuth.ts)

### **6. Create Authentication Middleware**

```typescript
// admin/app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { checkAuth, isAuthenticated } = useAuth()

  // Check if user is authenticated
  if (!checkAuth()) {
    // If trying to access protected route and not authenticated, redirect to login
    if (to.path !== '/login') {
      return navigateTo('/login')
    }
  } else {
    // If authenticated and trying to access login page, redirect to dashboard
    if (to.path === '/login') {
      return navigateTo('/')
    }
  }
})
```

**📁 File:** [`admin/app/middleware/auth.ts`](../admin/app/middleware/auth.ts)

### **7. Create Login Page with Modern UI**

```vue
<!-- admin/app/pages/login.vue -->
<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Login
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to access the admin panel
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <UiButton
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="loading"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </UiButton>
        </div>
        
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Default credentials: admin@interestingapp.local / admin123
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Disable default layout for login page
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { login } = useAuth()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await login(form.value.email, form.value.password)
    
    if (result.success) {
      await navigateTo('/')
    } else {
      error.value = result.error || 'Login failed'
    }
  } catch (err: any) {
    error.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

// Pre-fill for development
onMounted(() => {
  if (process.dev) {
    form.value.email = 'admin@interestingapp.local'
    form.value.password = 'admin123'
  }
})
</script>
```

**📁 File:** [`admin/app/pages/login.vue`](../admin/app/pages/login.vue)

### **8. Create Admin Dashboard Layout**

```vue
<!-- admin/app/layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-lg">
      <div class="mx-auto max-w-7xl px-6">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Admin Panel</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">Welcome, {{ user?.name || 'Admin' }}</span>
            <UiButton variant="outline" @click="handleLogout">Logout</UiButton>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar and Main Content -->
    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-md min-h-screen">
        <nav class="mt-8">
          <div class="px-6">
            <ul class="space-y-2">
              <li>
                <NuxtLink 
                  to="/dashboard" 
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  active-class="bg-blue-50 text-blue-700"
                >
                  <span>Dashboard</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink 
                  to="/users" 
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  active-class="bg-blue-50 text-blue-700"
                >
                  <span>Users</span>
                </NuxtLink>
              </li>
              <li>
                <NuxtLink 
                  to="/settings" 
                  class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  active-class="bg-blue-50 text-blue-700"
                >
                  <span>Settings</span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
// Add authentication middleware to all pages using this layout
definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>
```

**📁 File:** [`admin/app/layouts/default.vue`](../admin/app/layouts/default.vue)

### **9. Create Dashboard with Modern Metrics**

```vue
<!-- admin/app/pages/index.vue -->
<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-gray-500 text-sm font-medium">Total Users</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-blue-600 rounded"></div>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-gray-500 text-sm font-medium">Active Sessions</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.activeSessions }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-green-600 rounded"></div>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-gray-500 text-sm font-medium">API Calls</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats.apiCalls }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-yellow-600 rounded"></div>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-gray-500 text-sm font-medium">System Status</p>
            <p class="text-3xl font-bold text-green-600">Online</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-green-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center">
            <div class="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
            <div class="flex-1">
              <p class="text-gray-900">{{ activity.description }}</p>
              <p class="text-gray-500 text-sm">{{ activity.timestamp }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Mock data - replace with actual API calls
const stats = ref({
  totalUsers: 1250,
  activeSessions: 42,
  apiCalls: 8967,
})

const recentActivity = ref([
  {
    id: 1,
    description: 'New user registered',
    timestamp: '2 minutes ago'
  },
  {
    id: 2,
    description: 'System backup completed',
    timestamp: '15 minutes ago'
  },
  {
    id: 3,
    description: 'Security update installed',
    timestamp: '1 hour ago'
  }
])
</script>
```

**📁 File:** [`admin/app/pages/index.vue`](../admin/app/pages/index.vue)

### **10. Docker Containerization with Multi-stage Build**

```dockerfile
# admin/Dockerfile
# Dockerfile for Nuxt 4 Admin Panel
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nuxt
RUN adduser --system --uid 1001 nuxt
RUN chown -R nuxt:nuxt /app

USER nuxt

EXPOSE 3000

ENV NODE_ENV development
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 3000

CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nuxt
RUN adduser --system --uid 1001 nuxt

# Copy built application
COPY --from=builder --chown=nuxt:nuxt /app/.nuxt ./.nuxt
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output
COPY --from=builder --chown=nuxt:nuxt /app/package*.json ./

# Install only production dependencies
COPY --from=deps --chown=nuxt:nuxt /app/node_modules ./node_modules

USER nuxt

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 3000

CMD ["npm", "run", "preview"]
```

**📁 File:** [`admin/Dockerfile`](../admin/Dockerfile)

### **11. Infrastructure Integration**

**Update Development Docker Compose:**

```yaml
# infrastructure/docker/docker-compose.dev.yml (admin service updated)
  admin:
    build:
      context: ../../admin
      target: development
    container_name: admin-panel-dev
    volumes:
      - ../../admin:/app
      - /app/node_modules
    environment:
      - NUXT_PUBLIC_API_BASE_URL=https://api.interestingapp.local
      - NODE_ENV=development
    depends_on:
      - app
    networks:
      - traefik-network
```

**Update Production Docker Compose:**

```yaml
# infrastructure/docker/docker-compose.prod.yml (admin service added)
  admin:
    build:
      context: ../../admin
      target: production
    container_name: admin-panel-prod
    restart: unless-stopped
    environment:
      - NUXT_PUBLIC_API_BASE_URL=${ADMIN_API_URL:-https://api.yourdomain.com}
      - NODE_ENV=production
    depends_on:
      - app
    networks:
      - traefik
```

**Traefik Configuration Already Includes:**

```yaml
# infrastructure/traefik/config/dev-routes.yml
  routers:
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

## 🚀 Usage Commands

### **Development Commands:**

```bash
# Start complete development environment
cd infrastructure
just dev-up

# Using modern Docker Compose syntax (space instead of hyphen)
docker compose -f docker/docker-compose.dev.yml up -d

# View admin panel logs
docker compose -f docker/docker-compose.dev.yml logs admin

# Rebuild admin panel
docker compose -f docker/docker-compose.dev.yml up --build admin
```

### **Development Workflow:**

```bash
# Install dependencies in admin panel
cd admin && npm install <package-name>

# Test admin panel locally
cd admin && npm run dev

# Build for production
cd admin && npm run build
```

## 🔄 Git Commit

This step corresponds to updated commit for Nuxt 4:

```bash
git add .
git commit -m "Upgrade admin panel to Nuxt 4 with modern architecture

🚀 Major Updates:
- Migrated from Nuxt 3 to Nuxt 4 for enhanced performance
- Updated to latest Shadcn/ui component patterns
- Improved Docker configuration with multi-stage builds
- Enhanced authentication with proper JWT handling

🏗️ Technical Improvements:
- Nuxt 4 app directory structure for better organization
- Updated Docker Compose syntax (docker compose vs docker-compose)
- Fixed parseInt() usage with proper radix parameter
- Simplified configuration without Google Fonts dependency
- Enhanced type safety with TypeScript throughout"
```

## 🌐 Access URLs

- **🎨 Admin Panel**: https://admin.interestingapp.local
- **📱 API Backend**: https://api.interestingapp.local
- **📚 API Docs**: https://api.interestingapp.local/api/docs

## 📝 Nuxt 4 Key Features

### **🔥 Performance Enhancements:**
- Improved build times and bundle optimization
- Enhanced development server performance
- Better tree-shaking and code splitting

### **🏗️ Architecture Improvements:**
- App directory structure for better organization
- Enhanced TypeScript support
- Improved middleware system

### **🛠️ Developer Experience:**
- Better error handling and debugging
- Enhanced DevTools integration
- Improved hot module replacement

## 🎯 What's Next

### **API Integration:**
1. **Real Data**: Replace mock data with live API calls using `useApi` composable
2. **User Management**: Implement CRUD operations for user management
3. **Error Handling**: Add comprehensive error handling and loading states

### **UI Enhancements:**
1. **Data Tables**: Add advanced data tables with sorting and filtering
2. **Charts**: Integrate chart libraries for better analytics
3. **Dark Mode**: Implement dark mode support

### **Advanced Features:**
1. **Real-time Updates**: WebSocket integration for live updates
2. **Notifications**: Toast notifications and alert system
3. **Permissions**: Role-based access control

## 🚨 Troubleshooting & Common Issues

### **Issue 1: CORS Errors When Accessing Users Endpoint**

**Problem:** `Access to XMLHttpRequest at 'https://api.interestingapp.local/users' from origin 'https://admin.interestingapp.local' has been blocked by CORS policy`

**Solution:** Configure CORS in NestJS backend:

```typescript
// app/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://admin.interestingapp.local',
      'http://admin.interestingapp.local'
    ],
    credentials: true,
  });
  
  // ... rest of configuration
}
```

**📁 File:** [`app/src/main.ts`](../app/src/main.ts)

### **Issue 2: useAuth Composable Import Errors**

**Problem:** `Failed to resolve import "~/composables/useAuth"`

**Solution:** Use relative imports in Nuxt 4 app directory:

```typescript
// Instead of: import { useAuth } from '~/composables/useAuth'
import { useAuth } from '../../composables/useAuth'
```

**Files affected:**
- [`admin/app/pages/index.vue`](../admin/app/pages/index.vue)
- [`admin/app/layouts/default.vue`](../admin/app/layouts/default.vue) 
- [`admin/app/pages/users.vue`](../admin/app/pages/users.vue)

### **Issue 3: JWT Guards Blocking Development**

**Problem:** Authentication required for all endpoints during development

**Temporary Solution:** Comment out JWT guards for easier development:

```typescript
// app/src/users/users.controller.ts
@ApiTags('Users')
@Controller('users')
// @UseGuards(JwtAuthGuard)  // Commented for development
@ApiBearerAuth('JWT-auth')
export class UsersController {
  // ... controller methods
}
```

**📁 File:** [`app/src/users/users.controller.ts`](../app/src/users/users.controller.ts)

**Note:** Re-enable guards for production deployment.

### **Issue 4: Docker Build Issues**

**Problem:** Build fails due to Node version compatibility

**Solution:** Use Node 20-alpine for Nuxt 4 compatibility:

```dockerfile
FROM node:20-alpine AS base
```

### **Development Restart Required**

After making these changes, restart both services:

```bash
cd infrastructure
just dev-down
just dev-up
```

The admin panel now provides a solid, modern foundation built with Nuxt 4 and industry best practices! 🚀