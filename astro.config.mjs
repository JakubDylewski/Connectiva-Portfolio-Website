// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Adres produkcyjny. Domenę connectiva.biz podpinamy dopiero na wyraźne
  // polecenie Jakuba (SPEC 0 i Etap 9) — do tego czasu zostaje adres Pages.
  site: 'https://connectiva-portfolio.pages.dev',

  // Wszystkie ścieżki statyczne z końcowym ukośnikiem (SPEC 9).
  trailingSlash: 'always',

  build: {
    format: 'directory',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
