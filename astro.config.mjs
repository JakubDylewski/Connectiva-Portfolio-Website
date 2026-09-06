// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Adres produkcyjny. Domenę connectiva.biz podpinamy dopiero na wyraźne
  // polecenie Jakuba (SPEC 0 i Etap 9) — do tego czasu zostaje adres Pages.
  site: 'https://connectiva-portfolio.pages.dev',

  // Wszystkie ścieżki statyczne z końcowym ukośnikiem (SPEC 9).
  trailingSlash: 'always',

  build: {
    format: 'directory',
    // Etap 9 (audyt wydajności): style lądują w HTML-u zamiast w pięciu
    // małych, blokujących renderowanie plikach CSS. Na wolnym łączu mobilnym
    // to zauważalnie szybszy pierwszy rysunek, a adresy fontów są widoczne
    // od razu w dokumencie. Koszt: brak cache'owania CSS między stronami —
    // przy tej skali strony pomijalny.
    inlineStylesheets: 'always',
  },

  integrations: [
    sitemap({
      // Strona robocza i 404 nie należą do mapy strony (SPEC 9, 11.2).
      filter: (strona) => !strona.includes('/styleguide/') && !strona.includes('/404'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
