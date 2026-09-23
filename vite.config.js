import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        menu: fileURLToPath(new URL('./index.html', import.meta.url)),
        homeOffice: fileURLToPath(new URL('./Home/home-office.html', import.meta.url)),
        office: fileURLToPath(new URL('./Office/office.html', import.meta.url)),
        travelling: fileURLToPath(new URL('./Travelling/travelling.html', import.meta.url)),
      },
    },
  },
});
