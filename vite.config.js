import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// B2C API server (monthly-retail endpoints)
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:5000/';
// B2B API server (monthly-b2b endpoints) — mock2.py runs on port 5001
const B2B_API_TARGET = process.env.VITE_B2B_API_TARGET || 'http://localhost:5002/';
// Branches API server — branches.py runs on port 5002
const BRANCHES_API_TARGET = process.env.VITE_BRANCHES_API_TARGET || 'http://localhost:5001/';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Development server configuration
  server: {
    // listen on all addresses so the dev server is reachable from other devices / ngrok
    host: true,
    // allow this external host (ngrok) to connect
    allowedHosts: ['rumpless-minerva-terrifically.ngrok-free.dev'],
    // keep default port unless overridden by VITE_DEV_PORT
    port: Number(process.env.VITE_DEV_PORT || 5173),
    // Proxy API requests to backend targets. Keep the B2B route first.
    proxy: {
      '/api/dashboard/branches': {
        target: BRANCHES_API_TARGET,
        changeOrigin: true,
      },
      '/api/dashboard/monthly-b2b': {
        target: B2B_API_TARGET,
        changeOrigin: true,
      },
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
});