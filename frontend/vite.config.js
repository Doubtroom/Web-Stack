import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

let httpsConfig = undefined;
if (process.env.NODE_ENV === 'development') {
  httpsConfig = {
    key: fs.readFileSync('./cert/localhost-key.pem'),
    cert: fs.readFileSync('./cert/localhost.pem'),
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: httpsConfig,
    port: 3001,
  },
  build: {
    sourcemap: false, // Disable source maps in production
  },
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/app-check',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage'
    ],
    exclude: ['firebase', 'axios', 'react-zoom-pan-pinch', 'appwrite']
  }
})

