export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  future: {
    compatibilityVersion: 4,
  },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/word-memory/',
  },
})
