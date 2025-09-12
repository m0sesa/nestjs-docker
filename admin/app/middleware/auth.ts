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