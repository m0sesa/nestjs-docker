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

<script setup lang="ts">
// Explicit import of the composable in case auto-import isn't working
import { useAuth } from '../../composables/useAuth'

// Add authentication middleware to all pages using this layout
definePageMeta({
  middleware: 'auth'
})

const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>