import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

let serverConfig = {
  port: 3001,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: serverConfig,
  build: {
    sourcemap: false, // Disable source maps in production
  },
  optimizeDeps: {
    include: [],
    exclude: ["axios", "react-zoom-pan-pinch", "firebase", "appwrite"],
  },
});	