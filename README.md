# Connectiva — strona portfolio

Strona portfolio agencji Connectiva. Specyfikacja projektu jest w [`SPEC.md`](./SPEC.md)
i ma pierwszeństwo przed czymkolwiek innym — decyzje trwałe zapisujemy tam,
nie w promptach i nie w komentarzach.

Stan: **Etapy 0–14 ukończone — rewizja v2 (SPEC 17) zamknięta.**
Przed publikacją zostaje lista „Do uzupełnienia" na dole tego pliku.

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

Pomiar z **7 września 2026** (po całej rewizji v2): Lighthouse 12 (npx),
emulacja mobilna z symulowanym wolnym 4G, headless Chromium, `astro preview`
(gzip) na lokalnej maszynie. Cel ze SPEC 11.1: Performance ≥ 95, reszta 100.

| Strona | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 92 | 100 | 100 | 100 |
| `/cennik/` | 95 | 100 | 100 | 100 |
| `/audyt/` | 96 | 100 | 100 | 100 |
| `/kontakt/` | 98 | 100 | 100 | 100 |
| `/projekty/aurelia/` | 94 | 100 | 100 | 100 |
| `/projekty/elara/` | 94 | 100 | 100 | 100 |
| `/projekty/halicka/` | 95 | 100 | 100 | 100 |
| `/polityka-prywatnosci/` | 97 | 100 | 100 | 100 |

Wyniki poniżej 95 (w tym środowisku falują o ±2 między przebiegami):

- na `/` LCP to nagłówek hero, który celowo czeka na fonty i sekwencję
  otwarcia (SPEC 8.0/17.3) — na symulowanym wolnym 4G fonty przychodzą
  późno, a po rewizji dokument jest większy (kreator wyceny w HTML-u);
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
   wszystkie formularze: audyt na `/` i `/audyt/`, kreator wyceny na `/`
   i `/cennik/`, kontakt na `/` i `/kontakt/`. Bez klucza formularz
   pokazuje komunikat zamiast wysyłać.
2. **E-mail kontaktowy** — `email` w `src/site.config.ts` (sekcja Kontakt,
   stopka, menu mobilne, komunikaty błędów formularzy).
3. **Instagram** — `instagram.nazwa` i `instagram.url` w `src/site.config.ts`.
4. **Dane rejestrowe do stopki** — `firma.nazwa`, `firma.nip`, `firma.adres`
   w `src/site.config.ts` (stopka + polityka prywatności). Uwaga: przy JDG
   nazwa zawiera nazwisko (SPEC 2). *(17.11, pkt 1)*
5. **VAT: netto czy brutto** — `cenyVat` w `src/site.config.ts` (dziś `null`;
   kwoty kreatora są domyślnie netto — 17.4). Po decyzji dopisać jawną
   informację na ekranie wyniku kreatora. *(17.11, pkt 2)*
6. **Weryfikacja modelu cenowego** — `src/data/cennik.json` trzyma model
   addytywny z 17.4 (skrajne widełki 3 000–4 000 i 13 500–18 000; pilnuje
   ich zabezpieczenie budowania w `src/data/kreator.ts`). Zweryfikować, czy
   dolne widełki są opłacalne przy realnym nakładzie pracy. *(17.11, pkt 7)*
7. **Edycja treści przez klientkę** — panel CMS (Keystatic / Decap) czy
   zmiany w ramach opieki. Od decyzji zależy odpowiedź FAQ „Będę mogła sama
   zmieniać treści?" i zakres godziny szkolenia. *(17.11, pkt 5)*
8. **Opieka pomiesięczna** — czy zostaje w ofercie i za ile; dziś strona
   wspomina opiekę tylko w FAQ, bez kwoty. *(17.11, pkt 6)*
9. **Termin startu** — `najblizszyTermin` w `src/site.config.ts` (dziś:
   październik 2026). Potwierdzić przed publikacją, potem aktualizować ręcznie.
10. **Wyniki Lighthouse dem** — `lighthouseDate` w `src/data/projekty.ts`
    jest `null`, więc strona celowo nie pokazuje liczb Lighthouse projektów.
    Po zmierzeniu dem wpisać datę pomiaru — liczby pojawią się same.
11. **Obietnice terminowe** — odpowiedź w 24 h i wideo w 48 h: potwierdzić,
    że są wykonalne (SPEC 15). Sztywne terminy realizacji wypadły z treści
    w rewizji v2 (17.1, 17.7).
