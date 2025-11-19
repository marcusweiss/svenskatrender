import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/svenskatrender/', // Set base path for deployment to som-institutet.se/svenskatrender
  server: {
    // Ensure dev server handles the base path correctly
    strictPort: false,
    host: true, // Allow external access (for ngrok testing)
  },
})
