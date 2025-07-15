import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

let serverConfig = {
  port: 3001,
};

// if (process.env.VITE_NODE_ENV === "development") {
  try {
    serverConfig.https = {
      key: fs.readFileSync("./cert/localhost-key.pem"),
      cert: fs.readFileSync("./cert/localhost.pem"),
    };
  } catch (e) {
    serverConfig.https = undefined;
  }
// }

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