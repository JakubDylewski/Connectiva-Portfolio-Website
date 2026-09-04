# brand/

Materiały źródłowe marki. Nic z tego katalogu nie trafia bezpośrednio na
produkcję — służy do odtwarzania i weryfikacji logo (SPEC 3).

## Czego tu brakuje

| Plik | Po co | Status |
|---|---|---|
| `logo-oryginal.png` | Oryginał z Canvy (2000 × 476 px, czarne tło). Po wrzuceniu `/styleguide/` sam pokaże nałożenie SVG na PNG. | **brak — do wrzucenia przez Jakuba** |
| `logo.svg` | Eksport wektorowy z Canvy, tekst zamieniony na ścieżki (wariant 1 ze SPEC 3.2). Najlepsze i ostateczne źródło. | **brak — decyzja otwarta nr 7** |

## Jak to działa dzisiaj

Bez `logo.svg` wordmark jest odtwarzany z **Montserrat 300** i zamieniany na
ścieżki przez `npm run wordmark` (skrypt `scripts/wordmark.mjs`). Wynik ląduje
w `src/data/wordmark.ts` — plik generowany, nie edytujemy go ręcznie.

Geometria jest wzięta wprost ze SPEC 3.2: viewBox `0 0 1442 328`, wysokość
wersalika 199, linia bazowa 259, szerokość napisu 1411.

## Do sprawdzenia

Montserrat Light przy wysokości wersalika 199 składa „Connectiva" na 1536
jednostek, a oryginał ma 1411. Żeby trafić w szerokość, skrypt schodzi
z trackingiem do −0,049 em. To dużo jak na logo — albo w Canvie ustawiony jest
ujemny odstęp liter, albo font nie jest Montserratem.

Rozstrzygnie to nałożenie na `logo-oryginal.png` na `/styleguide/`. Jeśli okaże
się, że font jest inny, zmieniamy jedną stałą w `scripts/wordmark.mjs`
i odpalamy `npm run wordmark` ponownie.
