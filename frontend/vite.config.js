import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var __filename = fileURLToPath(import.meta.url);
    var __dirname = dirname(__filename);
    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': resolve(__dirname, './src')
            }
        },
        server: {
            port: 5173,
            open: true,
            proxy: {
                // Forward frontend /api requests to HTTP backend to avoid mixed-content
                '/api': {
                    target: env.VITE_DEV_PROXY_TARGET || env.VITE_API_BASE_URL || 'http://localhost:8000',
                    changeOrigin: true,
                    // Do not secure, backend runs over HTTP
                    secure: false
                }
            }
        },
        build: {
            sourcemap: true,
            outDir: 'dist'
        },
        define: {
            __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || '')
        }
    };
});
