import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// En desarrollo, /api se reenvía al backend; en Docker lo hace nginx. El alias @/ apunta a src/.
// VITE_ASSET_BASE: dónde se sirven los archivos estáticos compilados (JS, CSS). Vacío = el mismo origen; con un CDN,
// su URL (p. ej. https://cdn.ejemplo.com/). Los nombres llevan huella de contenido, así que pueden cachearse para siempre.
export default defineConfig({
  base: process.env.VITE_ASSET_BASE || '/',
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
  build: { sourcemap: false },
});
