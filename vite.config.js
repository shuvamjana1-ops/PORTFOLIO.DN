import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/PORTFOLIO.DN/',
  plugins: [react()],
  server: {
    port: 8080,
    strictPort: true,
  },
})
