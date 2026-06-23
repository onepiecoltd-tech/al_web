import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Server-only (BFF): the browser never calls the Go API directly; Nitro
    // server routes proxy to it. Set via NUXT_API_BASE in .env.
    apiBase: 'http://localhost:8080',
    public: {
      // OAuth client IDs are not secret (they're sent to the browser by design).
      // Set via NUXT_PUBLIC_GOOGLE_CLIENT_ID in .env.
      googleClientId: '',
    },
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxtjs/seo',
    'shadcn-nuxt',
  ],

  components: [
    // Luyện Ngữ primitives/screens: register without the path prefix so
    // <LnBtn>, <LnIcon>, … resolve regardless of nesting depth.
    { path: '~/components/luyenngu', pathPrefix: false },
    '~/components',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    // Lets the BFF expose its own WebSocket route (server/routes/api/messages/ws.ts),
    // which bridges to the Go API's WebSocket — browser never talks to Go directly.
    experimental: { websocket: true },
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'vi', language: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json' },
    ],
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'prefix_except_default',
  },

  image: {
    quality: 80,
    format: ['webp'],
  },

  site: {
    url: 'https://example.com',
    name: 'Learning Languages',
  },
})
