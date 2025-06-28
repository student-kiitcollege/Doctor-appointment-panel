import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true, // ✅ allows access on local network (helpful for testing mobile/responsive UI)
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // ✅ optional: set to true if you need source maps for debugging production
  },
  define: {
    'process.env': {}, // ✅ avoids issues with some packages expecting process.env in Vite
  }
})
