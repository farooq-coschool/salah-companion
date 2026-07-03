import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Salaah Companion',
          short_name: 'Salaah',
          description: "A comprehensive companion app for Muslims: Qur'an, prayer times, duas, and more.",
          theme_color: '#0B3D2E',
          background_color: '#F8F4EA',
          display: 'standalone',
          icons: [
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.alquran\.cloud\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'quran-api', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
            },
            {
              urlPattern: /^https:\/\/api\.aladhan\.com\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'prayer-times-api', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 } },
            },
            {
              urlPattern: /^https:\/\/cdn\.islamic\.network\//,
              handler: 'CacheFirst',
              options: { cacheName: 'quran-audio', expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 } },
            },
          ],
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
