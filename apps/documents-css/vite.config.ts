import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // kit подключён как workspace-пакет (исходники на TS); не пребандлим его,
  // чтобы Vite транспилировал его на лету как код проекта.
  optimizeDeps: {
    exclude: ['@proto/kit'],
  },
});
