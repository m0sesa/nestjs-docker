export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, initAuth } = useAuth()
  
  // Initialize auth state
  initAuth()
  
  // Skip auth check for login page
  if (to.path === '/login') {
    return
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})