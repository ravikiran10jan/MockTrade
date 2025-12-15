import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: parseInt(process.env.VITE_PORT || '5173', 10),
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/order': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: parseInt(process.env.VITE_PREVIEW_PORT || '4173', 10),
    strictPort: true,
  },
  define: {
    'process.env.VITE_API_BASE': JSON.stringify(
      Object.prototype.hasOwnProperty.call(process.env, 'VITE_API_BASE')
        ? process.env.VITE_API_BASE
        : ''
    ),
  },
})
