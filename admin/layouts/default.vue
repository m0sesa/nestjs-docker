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