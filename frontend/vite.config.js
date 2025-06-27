import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

let serverConfig = {
  port: 3001,
};

if (process.env.NODE_ENV === 'development') {
  try {
    serverConfig.https = {
      key: fs.readFileSync('./cert/localhost-key.pem'),
      cert: fs.readFileSync('./cert/localhost-cert.pem'),
    };
  } catch (e) {
    // Certs not found, fallback to HTTP
    serverConfig.https = undefined;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: serverConfig,
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

