import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

let serverConfig = {
  port: 3001,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: serverConfig,
  build: {
    sourcemap: false, // Disable source maps in production
  },
  optimizeDeps: {
    include: [],
    exclude: ["axios", "react-zoom-pan-pinch", "firebase", "appwrite"],
  },
});	