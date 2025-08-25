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
            open: true
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
