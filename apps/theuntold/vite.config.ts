import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  // `vite preview` serves the built app for tunnel/phone testing.
  preview: { port: 4173, allowedHosts: true },
});
