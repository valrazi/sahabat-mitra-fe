// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: btoa(process.env.NUXT_API_BASE_URL || '')
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt',],
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: '#28B446',
            secondary: '#0850A5',
            accent: '#DB4437'
          }
        }
      }
    }
  }
})