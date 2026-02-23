import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// B2C API server (monthly-retail endpoints)
const API_TARGET = process.env.VITE_API_TARGET || 'https://gokite-staging.odoo.com';
// B2B API server (monthly-b2b endpoints) — mock2.py runs on port 5001
const B2B_API_TARGET = process.env.VITE_B2B_API_TARGET || 'http://localhost:5001';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // B2B endpoints — more specific path MUST come before the generic /api proxy
      '/api/dashboard/monthly-b2b': {
        target: B2B_API_TARGET,
        changeOrigin: true,
      },
      // B2C endpoints (monthly-retail) + everything else under /api
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/health': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
})
