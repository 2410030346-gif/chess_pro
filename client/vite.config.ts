import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use root path for Render deployment
  build: {
    outDir: 'dist', // Explicitly set output directory
    emptyOutDir: true, // Clean output directory before build
  },
  server: {
    port: 3000,
  },
})
