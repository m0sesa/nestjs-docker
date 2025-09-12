<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Users</h1>
      <UiButton @click="createUser">Add User</UiButton>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-gray-600 font-medium">{{ user.username.charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(user.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <UiButton variant="outline" size="sm" @click="editUser(user)">Edit</UiButton>
              <UiButton variant="destructive" size="sm" @click="deleteUser(user)">Delete</UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/useAuth'

const { $fetch } = useNuxtApp()
const config = useRuntimeConfig()

// Get auth token
const { accessToken } = useAuth()

// Fetch users from API
const { data: usersData, pending, error, refresh } = await useFetch('/users', {
  baseURL: config.public.apiBaseUrl,
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})

const users = computed(() => usersData.value?.users || [])

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString))
}

const createUser = async () => {
  // Simple prompt-based user creation for now
  const username = prompt('Enter username:')
  const email = prompt('Enter email:')
  const password = prompt('Enter password:')
  
  if (username && email && password) {
    try {
      await $fetch('/users', {
        method: 'POST',
        baseURL: config.public.apiBaseUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: { username, email, password }
      })
      await refresh()
      alert('User created successfully!')
    } catch (err: any) {
      alert('Error creating user: ' + (err.data?.message || err.message))
    }
  }
}

const editUser = async (user: any) => {
  const username = prompt('Enter new username:', user.username)
  const email = prompt('Enter new email:', user.email)
  
  if (username || email) {
    try {
      await $fetch(`/users/${user.id}`, {
        method: 'PUT',
        baseURL: config.public.apiBaseUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: { username, email }
      })
      await refresh()
      alert('User updated successfully!')
    } catch (err: any) {
      alert('Error updating user: ' + (err.data?.message || err.message))
    }
  }
}

const deleteUser = async (user: any) => {
  if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
    try {
      await $fetch(`/users/${user.id}`, {
        method: 'DELETE',
        baseURL: config.public.apiBaseUrl,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      await refresh()
      alert('User deleted successfully!')
    } catch (err: any) {
      alert('Error deleting user: ' + (err.data?.message || err.message))
    }
  }
}
</script>