# Connectiva — strona portfolio

Strona portfolio agencji Connectiva. Specyfikacja projektu jest w [`SPEC.md`](./SPEC.md)
i ma pierwszeństwo przed czymkolwiek innym — decyzje trwałe zapisujemy tam,
nie w promptach i nie w komentarzach.

Stan: **Etapy 0–9 ukończone.** Przed publikacją zostaje lista
„Do uzupełnienia" na dole tego pliku.

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

Strona robocza z tokenami i komponentami: **http://localhost:4321/styleguide/**
(`noindex`, poza sitemapą).

---

## Lighthouse (mobile)

Pomiar z **6 września 2026**: Lighthouse 12 (npx), emulacja mobilna
z symulowanym wolnym 4G, headless Chromium, `astro preview` (gzip) na
lokalnej maszynie. Cel ze SPEC 11.1: Performance ≥ 95, reszta 100.

| Strona | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 94 | 100 | 100 | 100 |
| `/cennik/` | 96 | 100 | 100 | 100 |
| `/audyt/` | 96 | 100 | 100 | 100 |
| `/kontakt/` | 96 | 100 | 100 | 100 |
| `/projekty/aurelia/` | 94 | 100 | 100 | 100 |
| `/projekty/elara/` | 94 | 100 | 100 | 100 |
| `/projekty/halicka/` | 95 | 100 | 100 | 100 |
| `/polityka-prywatnosci/` | 97 | 100 | 100 | 100 |

Trzy strony z wynikiem 94 dzieli od celu 1 punkt i w tym środowisku wynik
faluje o ±2 między przebiegami. Co go trzyma:

- na `/` LCP to nagłówek hero, który celowo czeka na fonty i sekwencję
  otwarcia (SPEC 8.0) — na symulowanym wolnym 4G fonty przychodzą późno;
- na podstronach projektów LCP to zrzut desktopowy, który dzieli łącze
  z czterema plikami fontów.

Pomiar rozstrzygający robimy po wdrożeniu, na produkcyjnym adresie
(Cloudflare: Brotli, HTTP/3, CDN) i na prawdziwym telefonie — zgodnie ze
SPEC 10.7 obserwacja na urządzeniu jest ważniejsza niż liczby z symulacji.

---

## Zrzuty ekranu dem

Pipeline Playwrighta: `scripts/shots.mjs`. Dla każdego z trzech dem robi
dwa pliki do `src/assets/shots/`:

- `{slug}-mobile.webp` — 390 × 2400 CSS px przy `deviceScaleFactor: 2`
  (budżet ≤ 200 KB),
- `{slug}-desktop.webp` — 1440 × 900, sam pierwszy ekran (budżet ≤ 260 KB).

```bash
npm run shots            # wszystkie trzy dema
npm run shots -- elara   # tylko wybrane
```

Skrypt sam zamyka popup dema i baner ciasteczek, dociąga leniwe obrazy
i schodzi z jakością WebP, aż zmieści się w budżecie. Po każdej zmianie
w demach odpalamy go ponownie — pliki się nadpisują.

---

## Logo

Wordmark jest **zamieniony na ścieżki SVG**, nie składany z żywego fontu.
Dzięki temu logo nie czeka na `document.fonts.ready`, nie mruga przy wczytywaniu
i nie ciągnie 18 KB Montserrata na każdą podstronę.

```bash
npm run wordmark   # przelicza geometrię i zapisuje src/data/wordmark.ts
```

Skrypt wypisuje też metryki fallbacku fontów treściowych — te same wartości
siedzą w `global.css` przy regułach `@font-face` i to jest ich jedyne źródło.

---

## Publikacja

Cloudflare Pages, Connect to Git, gałąź produkcyjna `main`, komenda
`npm run build`, katalog wyjściowy `dist`.

**Plan dla domeny:** `connectiva.biz` (GoDaddy) podpinamy w Cloudflare Pages
**dopiero na wyraźne polecenie Jakuba** — do tego czasu strona żyje na
`connectiva-portfolio.pages.dev`, a DNS-u nie ruszamy (SPEC 0). Stara
wizytówka `connectiva-website.pages.dev` zostaje nietknięta.

---

## DO UZUPEŁNIENIA PRZED PUBLIKACJĄ

Wszystkie pola żyją w jednym miejscu i są oznaczone `TODO_` — dopóki tak
jest, formularze grzecznie odmawiają wysyłki, a stopka pokazuje placeholdery.

1. **Klucz Web3Forms** — `web3formsKey` w `src/site.config.ts`. Zasila
   wszystkie formularze: audyt na `/` i `/audyt/`, kontakt na `/`
   i `/kontakt/`. Bez klucza formularz pokazuje komunikat zamiast wysyłać.
2. **E-mail kontaktowy** — `email` w `src/site.config.ts` (sekcja Kontakt,
   stopka, menu mobilne, komunikaty błędów formularzy).
3. **Instagram** — `instagram.nazwa` i `instagram.url` w `src/site.config.ts`.
4. **Dane firmy do stopki** — `firma.nazwa`, `firma.nip`, `firma.adres`
   w `src/site.config.ts` (stopka + polityka prywatności). Uwaga: przy JDG
   nazwa zawiera nazwisko (SPEC 2).
5. **Netto czy brutto** — `cenyVat` w `src/site.config.ts` (decyzja otwarta
   nr 2, SPEC 16). Dopóki `null`, cennik uczciwie pisze „do ustalenia".
6. **Kwoty przełączników cennika** — `src/data/cennik.json` (600 / 500 /
   600 / 300 zł i opieka 249 zł to placeholdery — decyzja otwarta nr 5).
   Suma bazy i przełączników musi się równać górnej granicy widełek —
   build pilnuje tego sam.
7. **Wartości `src/data/miasta.json`** — dziś wszystkie „wolne" i to jest
   stan faktyczny. Aktualizacja ręcznie po podpisaniu umowy; nigdy „zajęte"
   dla efektu (SPEC 15).
8. **Termin startu** — `najblizszyTermin` w `src/site.config.ts` (dziś:
   październik 2026). Potwierdzić przed publikacją, potem aktualizować ręcznie.
9. **Wyniki Lighthouse dem** — `lighthouseDate` w `src/data/projekty.ts`
   jest `null`, więc strona celowo nie pokazuje liczb Lighthouse projektów.
   Po zmierzeniu dem wpisać datę pomiaru — liczby pojawią się same.
10. **Wariant H1 hero** — decyzja otwarta nr 8 (SPEC 16). Żaden z trzech
    wariantów nie mieści się w dwóch liniach na 360 px (raport z Etapu 1) —
    do rozstrzygnięcia razem z ewentualnym skróceniem tekstu.
11. **Obietnice terminowe** — 4 tygodnie realizacji, 30 dni poprawek,
    odpowiedź w 24 h, wideo w 48 h: potwierdzić, że są wykonalne (SPEC 15).
