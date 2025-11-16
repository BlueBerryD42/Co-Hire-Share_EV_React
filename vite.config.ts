import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        // Auth service
        '/api/Auth': {
          target: env.VITE_AUTH_API_URL || 'https://localhost:61601',
          changeOrigin: true,
          secure: false,
        },
        // Group service
        '/api/group': {
          target: env.VITE_GROUP_API_URL || 'https://localhost:61600',
          changeOrigin: true,
          secure: false,
        },
        '/api/document': {
          target: env.VITE_GROUP_API_URL || 'https://localhost:61600',
          changeOrigin: true,
          secure: false,
        },
          '/api/fund': {
          target: env.VITE_GROUP_API_URL || 'https://localhost:61600',
          changeOrigin: true,
          secure: false,
        },
        // Proposal service
        '/api/proposal': {
          target: env.VITE_PROPOSAL_API_URL || 'https://localhost:61600',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})