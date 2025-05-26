// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Teknik Abadi - Reseler Barang Elektronik',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Buy high-quality electronics at Teknik Abadi. Get the best deals on gadgets, home appliances, and more.' },
        { name: 'keywords', content: 'electronics, gadgets, home appliances, buy electronics online, Teknik Abadi' },
        { name: 'author', content: 'Teknik Abadi' },
        { property: 'og:title', content: 'Teknik Abadi - Best Electronics Store' },
        { property: 'og:description', content: 'Buy high-quality electronics at Teknik Abadi. Get the best deals on gadgets, home appliances, and more.' },
        { property: 'og:image', content: '/favicon.ico' }, // Update with actual image URL
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://teknikabadi.com' }, // Replace with your website URL
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Teknik Abadi - Best Electronics Store' },
        { name: 'twitter:description', content: 'Buy high-quality electronics at Teknik Abadi. Get the best deals on gadgets, home appliances, and more.' },
        { name: 'twitter:image', content: '/favicon.ico' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.ico' }, // Update favicon path
        { rel: 'canonical', href: 'https://teknikabadi.com' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_API_BASE_URL || ''
    }
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@nuxtjs/sitemap', '@nuxtjs/leaflet'],
  site: {
    url: 'https://teknikabadi.com',
    name: 'Teknik Abadi',
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls']
  },
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
  },
})