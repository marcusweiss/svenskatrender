import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // GitHub Pages: serve SPA for any path so /svenskatrender/tillit etc. work on refresh
    {
      name: 'copy-404-for-github-pages',
      closeBundle() {
        const outDir = join(__dirname, 'dist')
        copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))
      },
    },
  ],
  base: '/svenskatrender/', // Set base path for deployment to som-institutet.se/svenskatrender
  server: {
    // Ensure dev server handles the base path correctly
    strictPort: false,
    host: true, // Allow external access (for ngrok testing)
  },
})
