import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ CRITICAL: ensures correct paths for production hosting
  server: {
    port: 5174,
    host: true, // ✅ optional: for network testing
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // optional
  },
  define: {
    'process.env': {}, // avoids issues with packages expecting process.env
  }
})
