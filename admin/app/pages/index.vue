<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-gray-500 text-sm font-medium">Total Users</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats?.totalUsers || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-blue-600 rounded"></div>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-gray-500 text-sm font-medium">Active Users</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats?.activeUsers || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-green-600 rounded"></div>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-1">
            <p class="text-gray-500 text-sm font-medium">New Users Today</p>
            <p class="text-3xl font-bold text-gray-900">{{ stats?.newUsersToday || 0 }}</p>
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

<script setup lang="ts">
// Explicit import of the composable
import { useAuth } from '../../composables/useAuth'

const { $fetch } = useNuxtApp()
const config = useRuntimeConfig()

// Get auth token
const { accessToken } = useAuth()

// Fetch dashboard stats
const { data: stats, pending: statsPending, error: statsError } = await useFetch('/users/stats/dashboard', {
  baseURL: config.public.apiBaseUrl,
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})

// Mock recent activity since we don't have an activity log yet
const recentActivity = ref([
  {
    id: 1,
    description: 'Admin panel initialized',
    timestamp: new Date().toLocaleString()
  }
])
</script>