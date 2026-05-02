import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** https://vercel.com/docs/projects/environment-variables/system-environment-variables */
const isVercel = process.env.VERCEL === '1';

export default defineConfig(({ mode }) => {
    loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            ...(isVercel
                ? []
                : [
                      laravel({
                          input: ['resources/js/main.jsx'],
                          refresh: true,
                      }),
                  ]),
            react(),
        ],
        envPrefix: ['VITE_', 'REACT_APP_'],
        ...(isVercel
            ? {
                  root: __dirname,
                  publicDir: 'public',
                  build: {
                      outDir: 'dist',
                      emptyOutDir: true,
                      rollupOptions: {
                          input: resolve(__dirname, 'index.html'),
                      },
                  },
              }
            : {}),
    };
});
