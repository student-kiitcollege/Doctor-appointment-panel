import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ Ensures relative paths for assets (crucial for static hosting)
  server: {
    port: 5174,
    host: '0.0.0.0' // ✅ allows local network access (for mobile/responsive testing)
  },
  build: {
    outDir: 'dist', // ✅ default is 'dist', can be omitted unless customized
    sourcemap: false // ✅ can be true if debugging production is needed
  },
  define: {
    'process.env': {} // ✅ fixes issues with libs expecting process.env
  }
})
