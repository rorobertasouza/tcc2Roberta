import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Base path para servir os arquivos pelo Apache
  base: "/find-animal-friend-react/dist/",
  build: {
    outDir: "dist",
  },
  server: {
    allowedHosts: [".ngrok-free.dev"],
    hmr: {
      protocol: "wss",
      clientPort: 443,
    },
    proxy: {
      "/find-animal-friend-react/api": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
    },
  },
});
