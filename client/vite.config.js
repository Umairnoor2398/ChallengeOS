import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Expose on all network interfaces
    port: 5173, // Default Vite port
  },
  build: {
    target: "esnext", // This will allow top-level await
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
