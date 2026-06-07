import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 이제 모든 API 요청이 /api로 시작하므로 이 프록시 설정 하나면 전부 다 백엔드로 배달돼!
      '/api': {
        target: 'https://skoach.duckdns.org',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})