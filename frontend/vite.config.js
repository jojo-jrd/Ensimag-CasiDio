import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      cypress: true,
      include: 'src/*',
      exclude: ['node_modules', 'test/'],
      extension: ['.jsx'],
      requireEnv: false,
    }),],
  server: {
    port: 3001
  },
  base: "./",
})
