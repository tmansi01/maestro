import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'unicorn-icon.svg'],
      manifest: {
        name: 'Maestro: Unicorn Piano Adventure',
        short_name: 'Maestro',
        description: 'Learn to read Treble and Bass Clef piano notes with Maestro the Unicorn!',
        theme_color: '#7c3aed',
        background_color: '#fdf4ff',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'unicorn-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
      }
    })
  ]
});
