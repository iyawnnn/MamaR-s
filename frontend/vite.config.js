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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Strictly match core React packages
            if (id.match(/\/node_modules\/(react|react-dom|react-router-dom)\//)) {
              return "vendor-react";
            }
            // Isolate heavy visualization libraries
            if (id.match(/\/node_modules\/(recharts)\//)) {
              return "vendor-recharts";
            }
            // Group UI components and icons
            if (id.match(/\/node_modules\/(@radix-ui|lucide-react)\//)) {
              return "vendor-ui";
            }
            // Fallback for all other dependencies
            return "vendor";
          }
        },
      },
    },
  },
});