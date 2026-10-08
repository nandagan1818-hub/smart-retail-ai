import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,         // bind ke 0.0.0.0 → bisa diakses dari device lain & tunnel
    port: 5173,
    allowedHosts: true, // izinkan semua host: localhost, IP lokal, tunnel (loca.lt, ngrok, dll)
    proxy: {
      // Proxy /api ke Vercel dev server (jalankan: vercel dev --listen 3000)
      // saat pengembangan lokal tanpa vercel dev, fungsi-fungsi ini tidak berjalan.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    // Header bypass untuk localtunnel (panitia akses via loca.lt tidak kena "Click to Continue")
    headers: {
      'bypass-tunnel-reminder': 'true',
    },
  },
})
