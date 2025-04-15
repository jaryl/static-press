import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@sample": path.resolve(__dirname, "./sample"),
    },
  },
  // Configure how assets are handled
  assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg'],
}));
