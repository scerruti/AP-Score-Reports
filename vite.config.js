import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig({
  base: '/AP-Score-Reports/',
  plugins: [
    react(),
    {
      name: 'copy-pdf-worker',
      buildEnd() {
        // Copy PDF worker to dist on build
        mkdirSync('./dist', { recursive: true })
        copyFileSync(
          './public/pdf.worker.min.js',
          './dist/pdf.worker.min.js'
        )
      },
    },
  ],
  server: {
    port: 3000,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
})
