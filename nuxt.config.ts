export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  devtools: { enabled: false },
  compatibilityDate: '2024-04-03',
  future: {
    compatibilityVersion: 4,
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/word-memory/',
    head: {
      title: 'Word Memory',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'theme-color', content: '#4b9a76' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Word Memory' },
        { name: 'description', content: 'Train and test your word memory.' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: 'favicon.png' },
        { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' }
      ]
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Word Memory Game',
      short_name: 'Word Memory',
      description: 'Train and test your word memory.',
      theme_color: '#4b9a76',
      background_color: '#4b9a76',
      display: 'standalone',
      orientation: 'portrait',
      start_url: './',
      icons: [
        {
          src: 'icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,png,svg,json}']
    },
    devOptions: {
      enabled: false
    }
  }
})
