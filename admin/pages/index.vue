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