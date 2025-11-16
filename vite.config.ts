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
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://localhost:61601',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ Proxy error:', err.message);
              console.log('💡 Make sure backend is running on:', env.VITE_API_BASE_URL || 'https://localhost:61601');
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('➡️  Proxying:', req.method, req.url, '→', env.VITE_API_BASE_URL || 'https://localhost:61601');
            });
          },
        },
      },
    },
  }
})
