# Connectiva — strona portfolio

Strona portfolio agencji Connectiva. Specyfikacja projektu jest w [`SPEC.md`](./SPEC.md)
i ma pierwszeństwo przed czymkolwiek innym — decyzje trwałe zapisujemy tam,
nie w promptach i nie w komentarzach.

Stan: **Etap 0 (fundament) ukończony.** Hero, sekcje i warstwa ruchu dochodzą
w kolejnych etapach (SPEC 14).

---

## Uruchomienie

Wymagany Node ≥ 22.12.

```bash
npm install
npm run dev       # serwer deweloperski na http://localhost:4321
npm run build     # produkcyjny build do dist/
npm run preview   # podgląd tego, co wyszło z builda
npm run check     # kontrola typów i szablonów Astro
```

Do przeglądu fundamentu: **http://localhost:4321/styleguide/**

---

## Co jest w projekcie

```
src/
  site.config.ts        kontakt, dane firmy, termin startu, klucze — pola TODO
  layouts/Base.astro    meta, skip link, Nav, Footer, wpięcie warstwy ruchu
  styles/global.css     fonty, tokeny palety i typografii, baza, reduced motion
  components/           Logo, Lacznik, Button, SectionHead, Nav, Footer
  scripts/motion.ts     rusztowanie GSAP + Lenis (Etap 0: nic jeszcze nie animuje)
  data/wordmark.ts      GENEROWANY — ścieżki wordmarku, nie edytować ręcznie
  pages/                index (placeholder), styleguide
brand/                  materiały źródłowe marki — patrz brand/README.md
scripts/wordmark.mjs    generator wordmarku i metryk fontów
```

---

## Logo

Wordmark jest **zamieniony na ścieżki SVG**, nie składany z żywego fontu.
Dzięki temu logo nie czeka na `document.fonts.ready`, nie mruga przy wczytywaniu
i nie ciągnie 18 KB Montserrata na każdą podstronę.

Przeliczenie geometrii:

```bash
npm run wordmark
```

Skrypt czyta Montserrat 300 z `node_modules`, składa „Connectiva" tak, żeby
trafić w liczby ze SPEC 3.2 (wysokość wersalika 199, szerokość napisu 1411),
zamienia glify na ścieżki i zapisuje `src/data/wordmark.ts`. Przy okazji wypisuje
metryki fallbacku fontów treściowych — te same wartości siedzą w `global.css`
przy regułach `@font-face` i to jest ich jedyne źródło.

**Otwarte:** czy font w oryginale to na pewno Montserrat Light — patrz
`brand/README.md` i SPEC 16, decyzja nr 7.

---

## Zrzuty ekranu dem

Pipeline Playwrighta (`scripts/shots.mjs`) powstaje w **Etapie 2** (SPEC 8.1).
Docelowo: viewport 390 × 844, `deviceScaleFactor: 2`, `fullPage`, przycięcie do
2400 px CSS, `sharp` → WebP q80 do `src/assets/shots/`. Skrypt jest powtarzalny —
po zmianach w demach odpalamy go ponownie.

---

## Publikacja

Cloudflare Pages, Connect to Git, gałąź produkcyjna `main`, komenda
`npm run build`, katalog wyjściowy `dist`.

**Domeny `connectiva.biz` nie ruszamy bez wyraźnego polecenia** (SPEC 0).
Stara wizytówka `connectiva-website.pages.dev` zostaje nietknięta.

---

## Zanim to pójdzie na produkcję

Pola TODO w `src/site.config.ts`: e-mail, Instagram, nazwa firmy, NIP, adres,
klucz Web3Forms. Do tego decyzje otwarte ze SPEC 16. Pełna lista kontrolna
jest w Etapie 9.

Strona główna jest na razie `noindex` — flagę zdejmujemy w Etapie 1, razem
z prawdziwym hero.
