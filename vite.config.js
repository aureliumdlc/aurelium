import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Конфиг для AURELIUM с поддержкой GitHub Pages
export default defineConfig({
  plugins: [react()],
  // Относительные пути, чтобы сайт корректно работал из /docs любой репы
  base: './',
  build: {
    outDir: 'docs'
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5174'
    }
  }
})
