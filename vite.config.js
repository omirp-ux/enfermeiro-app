import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Troque 'enfermeiro-app' pelo nome EXATO do seu repositório no GitHub
const REPO_NAME = 'enfermeiro-app'

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Protocolos de Enfermagem',
        short_name: 'Protocolos',
        description: 'Consulta rápida de protocolos clínicos para enfermeiros',
        theme_color: '#1a56db',
        background_color: '#0a2540',
        display: 'standalone',
        orientation: 'portrait',
        start_url: `/${REPO_NAME}/`,
        scope: `/${REPO_NAME}/`,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
