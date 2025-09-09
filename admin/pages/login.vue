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