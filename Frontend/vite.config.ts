import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'icon-512.png'],
      manifest: {
        name: 'SIGAI-SES - Gestión de Inventario',
        short_name: 'SIGAI-SES',
        description: 'Sistema de Gestión de Inventario y Activos',
        theme_color: '#0A0F0D',
        background_color: '#0A0F0D',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/favicon.svg', sizes: '32x32', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
