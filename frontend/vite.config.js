import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/app-check',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage'
    ],
    exclude: ['firebase']
  }
})
