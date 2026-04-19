import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Safely isolate heavy data and asset libraries only
            if (id.includes("recharts")) return "vendor-charts";
            if (id.includes("lucide-react")) return "vendor-icons";
            // Let Vite natively handle React, DOM, and UI dependencies to prevent createContext errors
          }
        },
      },
    },
  },
});