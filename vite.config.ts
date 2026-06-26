import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiBaseUrl = "https://smart-fridge-server-dbvf.onrender.com";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8091,
    proxy: {
      "/api": {
        target: apiBaseUrl,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Origin", apiBaseUrl);
          });
        },
      },
    },
  },
});
