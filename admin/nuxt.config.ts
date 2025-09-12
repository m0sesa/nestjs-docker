// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@vee-validate/nuxt'
  ],
  
  css: ['~/assets/css/tailwind.css'],
  
  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://api.interestingapp.local'
    }
  },
  
  ssr: false // Disable SSR for admin panel
})
