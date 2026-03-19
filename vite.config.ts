import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['slediks.alexpshkov.ru'],
    proxy: {
      // Все запросы, начинающиеся с /api, будут перенаправляться на бэкенд
      '/api': {
        target: 'http://slediks.alexpshkov.ru:25565', // URL вашего бэкенда
        changeOrigin: true,
        // Опционально: если нужно переписать путь
        // rewrite: (path) => path.replace(/^\/api/, '')
      },'/news-api': {
        target: 'https://data-api.coindesk.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/news-api/, '/news/v1/article/list'),
      },
    }
  }
})
