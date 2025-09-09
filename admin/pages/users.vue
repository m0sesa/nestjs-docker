<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
        <p class="mt-2 text-gray-600">Manage your application users</p>
      </div>
      <Button @click="fetchUsers">
        <RefreshCw class="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>

    <!-- Users Table -->
    <Card>
      <CardHeader>
        <h3 class="text-lg font-medium">All Users</h3>
        <p class="text-sm text-gray-600">A list of all registered users</p>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-500">Loading users...</p>
        </div>
        
        <div v-else-if="error" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {{ error }}
          </div>
        </div>
        
        <div v-else-if="users.length === 0" class="text-center py-8">
          <Users class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No users</h3>
          <p class="mt-1 text-sm text-gray-500">No users have been registered yet.</p>
        </div>
        
        <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">
                  User
                </th>
                <th scope="col" class="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email
                </th>
                <th scope="col" class="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Created
                </th>
                <th scope="col" class="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ user.username.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">ID: {{ user.id.slice(0, 8) }}...</div>
                    </div>
                  </div>
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {{ user.email }}
                </td>
                <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="whitespace-nowrap px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                    Active
                  </span>
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Button variant="outline" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Users, RefreshCw, MoreHorizontal } from 'lucide-vue-next'

interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

// Auth middleware
const { isAuthenticated, initAuth, getAuthHeaders } = useAuth()

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

const config = useRuntimeConfig()
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')

// Fetch users from API
const fetchUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    // Note: You'll need to add a users endpoint to your NestJS API
    // For now, we'll simulate with mock data
    // const response = await $fetch<User[]>('/users', {
    //   baseURL: config.public.apiUrl,
    //   headers: getAuthHeaders(),
    // })

    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    users.value = [
      {
        id: '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6',
        username: 'john_doe',
        email: 'john@example.com',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7',
        username: 'jane_smith',
        email: 'jane@example.com',
        createdAt: '2024-01-14T15:45:00Z',
        updatedAt: '2024-01-14T15:45:00Z'
      },
      {
        id: '3c4d5e6f-7g8h-9i0j-1k2l-m3n4o5p6q7r8',
        username: 'bob_wilson',
        email: 'bob@example.com',
        createdAt: '2024-01-13T09:20:00Z',
        updatedAt: '2024-01-13T09:20:00Z'
      }
    ]
  } catch (err: any) {
    console.error('Failed to fetch users:', err)
    error.value = err.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

// Format date utility
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load users on mount
onMounted(() => {
  fetchUsers()
})
</script>