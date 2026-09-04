# CONNECTIVA — STRONA PORTFOLIO · SPECYFIKACJA v1

> **Jak używać:** ten plik trafia do repozytorium jako `SPEC.md` i jest pamięcią projektu. Claude Code wykonuje JEDEN etap na polecenie (sekcja 14), robi build, pisze podsumowanie i STOP. Jakub sprawdza (na prawdziwym telefonie), commituje, dopiero potem następny etap. Decyzje trwałe zapisujemy tutaj, nie w promptach.
>
> Prompt startowy do Claude Code: „Przeczytaj `SPEC.md` w całości. Wykonaj Etap N zgodnie z sekcją 14. Nie wychodź poza zakres etapu. Po zakończeniu: `npm run build`, podsumowanie zmian, lista rzeczy do sprawdzenia na telefonie, STOP."

---

## 0. Meta projektu

| | |
|---|---|
| Repozytorium | `JakubDylewski/Connectiva-Portfolio` (nowe, od zera) |
| Lokalnie | `C:\Users\jakdy\Documents\Connectiva Portfolio` |
| Hosting | Cloudflare Pages (Connect to Git, production branch `main`) → `connectiva-portfolio.pages.dev` |
| Domena | `connectiva.biz` (GoDaddy). **DNS nie ruszamy bez wyraźnego polecenia.** Stara wizytówka `connectiva-website.pages.dev` zostaje nietknięta. |
| Stack | Astro 5 · Tailwind 4 (`@tailwindcss/vite`) · TypeScript/waniliowy JS · GSAP 3.13+ (core + ScrollTrigger; bez SplitText) · Lenis · @fontsource-variable · sharp · Playwright (tylko dev, do zrzutów) |
| Język | Polski, `lang="pl"`. Cała treść i komentarze w kodzie po polsku lub neutralnie. |
| Formularze | Web3Forms — klucz `TODO_WEB3FORMS_KEY` (uzupełnić przy publikacji) |
| Analityka | Cloudflare Web Analytics (bez ciasteczek, bez banera). Meta Pixel odłożony — wymagałby zgody i banera. |

---

## 1. Cel strony i odbiorczyni

**Jedno zadanie:** właścicielka salonu beauty, gabinetu kosmetologii albo kliniki medycyny estetycznej (30–50 lat, ogląda na telefonie, nietechniczna) ma po 60 sekundach uznać: „to wygląda drogo i ten ktoś ogarnia" — i wysłać link do swojej strony po bezpłatny audyt.

- **Konwersja główna:** formularz audytu (link do strony + kontakt). Cel: audyt wideo → rozmowa → umowa.
- **Konwersja wtórna:** formularz kontaktowy / e-mail / Instagram.
- **Ton:** spokojny ekspert. Konkret, krótkie zdania, zero żargonu, zero krzyku, zero emoji. Mówimy do niej („Ty", „Twoja klientka", „Twój kalendarz"), o jej problemach (pusty kalendarz, prowizje, klientki, które oglądają i wychodzą), nie o naszej technologii.
- **To NIE jest strona dla programistów.** Stack pojawia się raz, nisko, jako dowód, nie argument.

---

## 2. Marka na stronie (decyzja Jakuba)

**Connectiva jako agencja, bez twarzy.** Skoro nie ma zdjęcia założyciela, zaufanie musi wynikać z czterech rzeczy, które stronę mają nieść w całości:

1. **Trzy projekty pokazowe** — rzemiosło widać, da się kliknąć i pooglądać na żywo.
2. **Jawna cena** — w rynku, w którym wszyscy ją chowają.
3. **Gwarancje wprost:** jedna marka na miasto, pełne prawa do strony, brak ukrytych abonamentów, cena końcowa bez „od".
4. **Dane rejestrowe w stopce** — nazwa firmy, NIP, adres (TODO od Jakuba). Uwaga: przy JDG nazwa firmy zawiera nazwisko, więc „Connectiva Jakub Dylewski" i tak pojawi się w stopce. Bez twarzy ≠ bez nazwiska.

**Głos:** druga osoba („dostajesz", „Twoja strona") i konstrukcje bezosobowe („strona powstaje w cztery tygodnie"). „My" dopuszczalne oszczędnie, jako konwencja studia, ale strona nigdzie nie sugeruje zespołu, którego nie ma (żadnego „nasz zespół", „nasi projektanci").

---

## 3. Logo — analiza i użycie

Analiza wykonana na pliku `Connectiva (2).png` (2000×476 px, czarne tło, brak przezroczystości).

### 3.1 Co jest w logo
- **Wordmark „Connectiva"** — geometryczny grotesk w lekkiej odmianie (najpewniej **Montserrat Light**; do potwierdzenia w Canvie). Wysokość wersalika ≈ 199 px, szerokość napisu 1411 px.
- **Jeden gradient poziomy** na całej kompozycji (napis i linie dzielą ten sam gradient):
  - lewa krawędź `#4898AB` (chłodny morski)
  - środek `#6CB68B` (zieleń szałwiowa)
  - prawa krawędź `#8FD46C` (jasna, świeża zieleń — nie neon)
- **Dwie linie w przesunięciu** o tej samej grubości ≈ 5% wysokości wersalika, końce proste (butt):
  - **dolna-lewa** pod „Conne": od lewej krawędzi napisu do środka kompozycji, ~30% wysokości wersalika pod linią bazową;
  - **górna-prawa** nad „ctiva": od środka kompozycji do prawej krawędzi napisu, ~30% wysokości wersalika nad wersalikiem.
  - Linie **nie stykają się** — kończą się w tym samym punkcie w poziomie (x = 50%), z przeskokiem w pionie. To jest motyw marki: **dwa poziomy, jedno miejsce połączenia.**
- Proporcje całości (ink bbox): 1442 × 328 → ok. **4,4 : 1**.

### 3.2 Odtworzenie w SVG (Etap 0)
PNG na czarnym tle nie nadaje się do animacji ani na przebarwione tła. Logo odtwarzamy jako komponent `Logo.astro`:

```
viewBox="0 0 1442 328"
<linearGradient id="g-brand" gradientUnits="userSpaceOnUse" x1="0" x2="1442">
  <stop offset="0"   stop-color="#4898AB"/>
  <stop offset="0.5" stop-color="#6CB68B"/>
  <stop offset="1"   stop-color="#8FD46C"/>
</linearGradient>
linia górna:  x 712 → 1442, y = 5.5,   stroke-width 11, stroke-linecap butt
linia dolna:  x 23  → 711,  y = 322.5, stroke-width 11, stroke-linecap butt
napis:        wersalik y 60 → linia bazowa y 259; szerokość napisu 1411 (x 0 → 1411)
```

Procedura dla napisu (kolejność preferencji):
1. **Jakub eksportuje SVG z Canvy** (jeśli ma taką opcję) → tekst zamieniony na ścieżki, gradient jak wyżej. Najlepsze i ostateczne.
2. Jeśli nie: `<text>` w SVG, font **Montserrat 300** dołączony jako subset tylko z glifami „Connectiva" (fontsource + subset, kilka KB), `fill="url(#g-brand)"`. Font-size i letter-spacing dobrane tak, żeby nałożenie na PNG (przeskalowany do 1442 px szerokości) różniło się ≤ 2 px. Claude Code robi zrzut porównawczy `styleguide` i pokazuje go Jakubowi.
3. PNG z Canvy zostaje wyłącznie jako podkład do obrazka OG.

### 3.3 Zasady użycia
- Tylko na czerni lub ciemnych przebarwieniach z sekcji 4. Nigdy na jasnym tle. Nigdy w innym kolorze.
- Minimalna szerokość: 120 px (nav mobile 112 px dopuszczalne). Pole ochronne = wysokość wersalika z każdej strony.
- W nawigacji: 132 px desktop, 112 px mobile; po przewinięciu skaluje się do 110 px.
- Wersja mono (pełna biel `#EEF2EF`) tylko w favicon 16/32 px i w miejscach, gdzie gradient nie ma szans się wyświetlić (np. e-mail). Favicon: same dwie linie w przesunięciu bez napisu (czytelne w 16 px).

---

## 4. Paleta (tokeny)

Baza jest **prawdziwą czernią** — jak w logo i jak na ekranach OLED, na których ogląda odbiorczyni. Powierzchnie mają zielony podton, żeby marka była obecna nawet tam, gdzie nie ma gradientu. Gradient jest rzadki: **maksymalnie trzy wystąpienia na jeden ekran** (logo, jedna sygnatura, jedno podkreślenie CTA). Bez gradientu na przyciskach, bez gradientowego tekstu poza wordmarkiem, bez jasnej zieleni jako dużej plamy — to prosta droga do kliszy „czarne tło + kwaśna zieleń".

```css
@theme {
  --color-black:   #000000;  /* tło główne */
  --color-ink-1:   #0E1210;  /* panele, karty, tło inputów */
  --color-ink-2:   #171D1A;  /* powierzchnie podniesione, hover, focus inputu */
  --color-line:    rgb(242 246 243 / 0.10);  /* linie podziału */
  --color-line-2:  rgb(242 246 243 / 0.22);  /* obramowania przycisków wtórnych */
  --color-text:    #EEF2EF;  /* tekst główny — nie czysta biel */
  --color-text-2:  #A6B0AA;  /* tekst wtórny (≈ 9,6 : 1 na czerni) */
  --color-text-3:  #6E7873;  /* meta; tylko ≥ 14 px (≈ 4,6 : 1) */
  --color-teal:    #4898AB;  /* początek gradientu */
  --color-green:   #6CB68B;  /* środek gradientu = jednolity akcent: linki, aktywne stany, ramka inputu */
  --color-lime:    #8FD46C;  /* koniec gradientu: tylko w gradiencie i w focus ringu */
  --color-tint-aurelia: #1A1407;  /* przebarwienie sekcji projektu — złoto Aurelii */
  --color-tint-elara:   #1C1210;  /* róż/miedź ELARY */
  --color-tint-halicka: #0A1611;  /* zieleń HALICKIEJ */
}
--g-brand: linear-gradient(90deg, #4898AB 0%, #6CB68B 50%, #8FD46C 100%);
```

Zasady:
- Tekst na czerni: `text` dla treści, `text-2` dla leadów i opisów, `text-3` tylko dla liczników i meta ≥ 14 px.
- Linki w treści: `green`, podkreślenie 1 px `line-2`, na hover podkreślenie `green`.
- Focus ring: 2 px `lime`, offset 3 px — zawsze widoczny, nigdy `outline: none` bez zamiennika.
- Przebarwienia (`tint-*`) tylko w sekcji Projekty i na podstronach projektów, jako warstwy pod treścią (sekcja 10.6). Wartości docelowe wyprowadzić z realnych tokenów dem, jeśli różnią się od powyższych.
- Cienie: brak. Głębię robi różnica `black` / `ink-1` / `ink-2` i linie.
- Zaokrąglenia: przyciski i inputy 6 px, panele 12 px, ramka telefonu 44 px. Nie pill — to sygnatura Vantaframe.

---

## 5. Typografia

Dwie rodziny, obie zmienne, obie z podzbiorem **latin-ext** (polskie znaki: ąęśćżźńłó — sprawdzić w obu fontach w Etapie 0).

| Rola | Font | Odmiany | Uwagi |
|---|---|---|---|
| Display (H1, H2, liczby cen) | **Newsreader** (`@fontsource-variable/newsreader`) | 300–500, optical size auto | Serif redakcyjny, spokojny, nie „Playfair". Kursywy nie ładujemy. |
| Body i UI | **Hanken Grotesk** (`@fontsource-variable/hanken-grotesk`) | 400 / 500 / 600 | Neutralny grotesk, dobrze pracuje obok geometrycznego wordmarku. |

Skala (mobile → desktop, `clamp`):

| Token | Rozmiar | Font / waga | Interlinia | Tracking |
|---|---|---|---|---|
| `display-1` (H1 hero) | 44 → 96 px | Newsreader 400 | 1.02 | −0.015em |
| `display-2` (H2 sekcji) | 34 → 64 px | Newsreader 400 | 1.06 | −0.01em |
| `price` (liczby) | 48 → 88 px | Newsreader 300, `tabular-nums` | 1 | 0 |
| `h3` | 22 → 28 px | Hanken 500 | 1.25 | 0 |
| `lead` | 18 → 20 px | Hanken 400, `text-2` | 1.55 | 0 |
| `body` | 16 → 17 px | Hanken 400 | 1.6 | 0 |
| `small` | 14 px | Hanken 400/500 | 1.5 | 0 |
| `index` (licznik sekcji „02 / 07") | 14 px | Hanken 500, `tabular-nums`, `text-3` | 1 | 0 |

Reguły (nienegocjowalne — to są najczęstsze „zdrady" generycznej strony):
- **Zdania z małej litery po pierwszej.** Żadnych etykiet WIELKIMI LITERAMI, żadnych rozstrzelonych „eyebrow" nad każdym nagłówkiem.
- **Żadnego akcentowania jednego słowa** w nagłówku kursywą, kolorem ani wagą. Nagłówek jest obiektem typograficznym jako całość (zasada przesunięcia, sekcja 6).
- Żadnych ciągów z kropką środkową („A · B · C"), żadnych „SŁOWO — fragment", żadnych „→" doklejonych do linków i przycisków. Meta rozdzielamy przecinkami lub łamaniem linii.
- Bez fontu monospace na etykiety i liczby — liczby robi `tabular-nums` w Hanken.
- Miara tekstu ≤ 72 znaki (`max-width: 40rem` dla akapitów).
- Polska typografia: cudzysłowy „ ", półpauza – w zakresach (8 000–10 000 zł), twarda spacja po spójnikach jednoliterowych (w, i, z, o, a, u — „w Gdyni" → `w&nbsp;Gdyni`), tysiące z twardą spacją (`8&nbsp;000 zł`). W treściach `.astro` używać encji, nie znaków „" w stringach JS (lekcja z ELARY: polskie cudzysłowy w JS potrafią wywalić build).
- Ładowanie: `font-display: swap` + metryki fallbacku (`size-adjust`, `ascent-override`) dla obu rodzin, żeby CLS był 0.

---

## 6. Sygnatura graficzna: „Łącznik" i zasada przesunięcia

Cała tożsamość wizualna strony wynika z jednego elementu logo: **dwóch linii w przesunięciu, które łączą się w jednym punkcie**. Nie dodajemy drugiego motywu. To jest miejsce, na które wydajemy całą odwagę — reszta strony ma być cicha.

### 6.1 Komponent `Lacznik.astro`
```
<svg viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">
  <path class="l-bottom" d="M0 22 H99"   vector-effect="non-scaling-stroke"/>
  <path class="l-top"    d="M101 2 H200" vector-effect="non-scaling-stroke"/>
</svg>
stroke: url(#g-brand) (gradient userSpaceOnUse x 0→200), stroke-width 2 (mobile 1.5), linecap butt
```
Warianty (`size`): `hero` (szerokość ~60% kontenera, pod H1), `section` (160 px, między nagłówkiem a treścią, statyczny), `inline` (56 px, marker pozycji w listach), `cta` (podkreślenie przycisku głównego: widoczna tylko dolna kreska; na hover górna kreska dorysowuje się w prawo — 250 ms).

Animacja rysowania (tylko `hero` i `proces`): `scaleX` od 0 do 1 z `transform-origin: left`, najpierw dolna, po 120 ms górna, `expo.out`, 0.7 s. Bez `stroke-dashoffset` w pętli scrolla — `scaleX` jest tańszy.

### 6.2 Zasada przesunięcia (obowiązuje wszędzie)
Motyw „dwa poziomy" wraca w układzie, nie tylko w kresce:
- **Nagłówki H1/H2 mają dokładnie dwie linie**, druga wcięta: `margin-left: clamp(1.25rem, 8vw, 6rem)`. Łamanie ręczne (`<span class="l1">` / `<span class="l2">`), nie automatyczne. Jeśli tekst nie mieści się w dwóch linijkach na mobile — skracamy tekst, nie łamiemy zasady.
- **Pary elementów są przesunięte**: dwa zrzuty ekranu na podstronie projektu (desktop + mobile) — mobile niżej i w prawo; dwa przyciski CTA — wtórny lekko niżej na desktopie (baseline różne o 8 px); telefon w sekcji Projekty przesunięty względem osi tekstu.
- **Oś czasu procesu** to linia, która przy każdym kroku przeskakuje o poziom wyżej (schodki) — naturalne rozwinięcie motywu.
- **Nawigacja**: pasek postępu scrolla to jedna cienka linia gradientowa pod górną belką — jedyna gradientowa rzecz w nav poza logo.

---

## 7. Układ, nawigacja, komponenty bazowe

### 7.1 Siatka i rytm
- Kontener treści 1200 px, marginesy boczne 20 px (mobile) → 48 px (desktop). Siatka 12 kolumn na desktopie.
- Odstępy sekcji: 88 px (mobile) → 160 px (desktop). Wewnątrz sekcji skala 8 px: 8 / 16 / 24 / 40 / 64 / 96.
- **Wszystko wyrównane do lewej.** Żadnych wycentrowanych hero. Asymetria bierze się z przesunięcia (sekcja 6.2).
- Sekcja = `<section id="…">` z nagłówkiem `SectionHead` (licznik pozycji „02 / 07" w `index`, H2 w dwóch liniach, lead ≤ 72 znaki, opcjonalny `Lacznik section`).

### 7.2 Górna belka (`Nav.astro`)
- Wysokość 64 px, tło przezroczyste. Lewa: logo (link do `/`). Prawa (desktop): `Projekty`, `Cennik`, `Kontakt` + przycisk główny `Bezpłatny audyt` (→ `/audyt/`).
- Po przewinięciu > 80 px: tło `rgb(0 0 0 / 0.72)` + `backdrop-filter: blur(12px)`, dolna linia `line`, logo 110 px. Przejście 200 ms.
- Pod belką **linia postępu** 1 px, `--g-brand`, `scaleX` = postęp scrolla (jeden ScrollTrigger, `scrub: true`).
- Mobile: logo + przycisk-ikona menu (etykieta „Menu", 44×44). Menu pełnoekranowe na `ink-1`: trzy linki jako `display-2`, pod nimi e-mail i Instagram. Zamykanie: przycisk „Zamknij", `Esc`, klik w link. Focus trap.

### 7.3 Dolny pasek mobile (`MobileBar.astro`)
- Tylko < 1024 px. Stały, 56 px + `env(safe-area-inset-bottom)`, tło `rgb(0 0 0 / 0.8)` + blur, górna linia `line`.
- Dwa przyciski: `Bezpłatny audyt` (główny) i `Napisz` (wtórny, → `/kontakt/`).
- Pojawia się dopiero, gdy hero wyjedzie z ekranu (żeby nie zasłaniać CTA hero); znika, gdy widoczny jest formularz audytu lub kontaktu. Przejście `translateY`, 250 ms.

### 7.4 Przyciski (`Button.astro`)
- **Główny:** tło `text` (#EEF2EF), tekst `black`, wysokość 48 px, padding 0 20 px, radius 6 px, Hanken 500 16 px. Hover: tło `#FFFFFF`, pod przyciskiem `Lacznik cta`. Active: `scale(0.98)`.
- **Wtórny:** przezroczysty, 1 px `line-2`, tekst `text`. Hover: obramowanie `green`.
- **Tekstowy:** link z podkreśleniem 1 px `line-2` → `green`.
- Magnetyzm (desktop, `pointer: fine`): przesunięcie do 6 px w stronę kursora w promieniu 40 px, `gsap.quickTo`, 0.4 s `power3.out`, powrót na `mouseleave`. Nigdy na mobile.
- Wszystkie cele dotyku ≥ 44×44 px, odstęp ≥ 8 px.

### 7.5 Pola formularzy
- Etykieta widoczna nad polem (nie placeholder-only), 14 px `text-2`. Pole: 48 px, tło `ink-1`, obramowanie 1 px `line`, focus obramowanie `green` + focus ring. Błąd: komunikat pod polem, `#E08C7C`, ikona nie jest jedynym nośnikiem.
- Honeypot (ukryte pole) w każdym formularzu. Stan wysyłki inline: „Wysłane. Wideo przyjdzie w 48 h." / „Nie udało się wysłać. Napisz na TODO_EMAIL."

### 7.6 Ramka telefonu (`PhoneFrame.astro`)
- Proporcja 390 : 844, radius 44 px, obwódka 8 px `#1A1F1C`, wnętrze `overflow: hidden`, tło `ink-2` zanim załaduje się zrzut. **Bez notcha, bez dynamic island, bez paska statusu** — nie udajemy konkretnego telefonu.
- Wewnątrz `<img>` (WebP, 780 px szerokości fizycznej, wysokość ≤ 4800 px fiz., ≤ 200 KB), `decoding="async"`, `loading="lazy"`, jawne `width/height`.

### 7.7 Akordeon (`Accordion.astro`)
- Nagłówek = `<button aria-expanded>` na całej szerokości, 56 px min, po lewej `Lacznik inline` jako marker, po prawej znak plus obracany o 45° po otwarciu.
- Rozwijanie przez `grid-template-rows: 0fr → 1fr` (320 ms, `expo.out`) — **nigdy animacja `height`** (lekcja z ELARY). Na mobile jeden otwarty naraz, na desktopie dowolnie.
- Bez kart z cieniem: elementy rozdzielone liniami `line`, hover tła `ink-1`.

---

## 8. Strona główna — sekcje, treść, interakcje

Kolejność i licznik: hero (bez numeru) → 01 Projekty → 02 Co dostajesz → 03 Jedna marka na miasto → 04 Audyt w 60 sekund → 05 Proces → 06 Cena → 07 Pytania → Kontakt (bez numeru) → stopka. Licznik „NN / 07" pokazuje pozycję na stronie — to jedyna numeracja poza krokami procesu.

### 8.0 Hero (`#top`)
Typograficzne, bez obrazu — LCP to tekst, czyli natychmiastowe.

- **H1 (dwie linie, przesunięte):** `Strona, która` / `zapełnia kalendarz.`
  Alternatywy do wyboru przez Jakuba: `Klientka wchodzi z telefonu.` / `Wychodzi z rezerwacją.` · `Piękna strona.` / `Pełny kalendarz.`
- **Łącznik hero** pod H1.
- **Lead:** „Strony i systemy pozyskiwania klientek dla salonów beauty, gabinetów kosmetologii i klinik medycyny estetycznej. Jedna marka na miasto. Cena znana przed pierwszą rozmową."
- **CTA:** główny `Bezpłatny audyt w 60 sekund` (→ `#audyt`), wtórny `Zobacz projekty` (→ `#projekty`), wtórny przesunięty 8 px niżej na desktopie.
- **Przełącznik „Dla kogo"** (interakcja 1): trzy chipy `Salon beauty` / `Gabinet kosmetologii` / `Klinika lekarska`. Dotknięcie: (a) zapisuje `data-segment` na `<html>`, (b) przewija do `#projekty`, gdzie aktywny staje się projekt tego segmentu, (c) pod nagłówkiem Projektów pojawia się jedno zdanie dla segmentu:
  - salon: „Salon beauty: cennik z filtrem, vouchery i pakiety, rezerwacja z Twojego systemu."
  - kosmetologia: „Gabinet kosmetologii: programy kuracji i diagnoza skóry, która zbiera leady z pełnym profilem."
  - klinika: „Klinika lekarska: strona informacyjna zgodna z art. 14, bez przed/po i bez promocji."
  Chipy: 40 px wysokości, obramowanie `line-2`, aktywny — tło `ink-2` + obramowanie `green`. Stan w pamięci, bez storage.
- **Sekwencja otwarcia (jedyny ruch, który dzieje się sam):** logo (opacity 0→1, 0.4 s) → linia 1 H1 i linia 2 H1 odsłaniane maską `clip-path: inset(0 0 100% 0 → 0)` z `y: 24 → 0`, 0.9 s, odstęp 0.12 s → Łącznik rysuje się (0.7 s) → lead, CTA, chipy (opacity + `y: 12`, 0.4 s, odstęp 0.06 s). Całość ≤ 1.6 s, start po `document.fonts.ready` (żeby nie animować fallbacku). Poza tą sekwencją **żadna sekcja nie „wjeżdża" sama** — reszta ruchu odpowiada na scroll albo dotyk.
- Reduced motion: wszystko widoczne od razu.

### 8.1 · 01 Projekty (`#projekty`) — interakcja 2 i 3
- **H2:** `Trzy segmenty rynku.` / `Trzy projekty pokazowe.`
- **Lead:** „Trzy pełne strony dla fikcyjnych marek — po jednej na każdy typ gabinetu — żebyś zobaczyła produkt, zanim go zamówisz. Każdą otworzysz w przeglądarce jak prawdziwą."
- **Etykieta na każdym projekcie (obowiązkowa):** `Projekt pokazowy (marka fikcyjna)`. Zdjęcia w projektach są wygenerowane — ujawnione w stopce i na podstronach (sekcja 15).

**Układ desktop (≥ 1024 px):** sekcja przypięta (**pin nr 1 z 2**). Prawa kolumna: jeden `PhoneFrame` przesunięty względem osi tekstu, zajmuje 42% szerokości. Lewa kolumna: trzy panele tekstowe przewijane po kolei. Postęp scrolla w sekcji (`end: +=300%`, `scrub: 0.8`) steruje: (a) crossfade zrzutu w telefonie przy zmianie panelu (opacity, 0.5 s), (b) przewijaniem zrzutu wewnątrz ekranu (`translateY` od 0 do −(wysokość zrzutu − wysokość ekranu) w obrębie panelu), (c) przebarwieniem tła (sekcja 10.6).

**Układ mobile (< 1024 px):** bez pinowania. Trzy bloki jeden pod drugim: tekst, pod nim telefon (szerokość 68% ekranu, przesunięty w prawo). Zrzut wewnątrz telefonu przewija się scrubem w zakresie widoczności bloku (`translateY` ≤ −1600 px). Atrybut `data-motion="off"` na sekcji wyłącza scrub i zostawia statyczny zrzut (włączyć, jeśli test na prawdziwym telefonie pokaże szarpanie).

**Panele (treść):**

| | Klinika Aurelia | ELARA Instytut Urody | HALICKA Kosmetologia Estetyczna |
|---|---|---|---|
| Segment | Klinika medycyny estetycznej (lekarska) | Salon beauty | Gabinet kosmetologii, marka osobista |
| Problem | Pacjentka nie wie, który zabieg rozwiąże jej problem — i nie wolno jej niczego „reklamować". | Pięćdziesiąt usług i klientka, która chce znaleźć swoją w trzy sekundy. | Kosmetolożka sprzedaje programy w seriach, a nie pojedyncze zabiegi. |
| Rozwiązanie | Moduł „Dobierz zabieg": od problemu do konsultacji, językiem informacyjnym zgodnym z art. 14. | Cennik z filtrem na żywo, vouchery i pakiety, rezerwacja z kontekstem wybranej usługi. | „Karta Twojej Skóry": 7 pytań, raport i lead z pełnym profilem; programy z osią czasu wizyt. |
| Liczby | 36 podstron, 12 zabiegów, 15 stron lokalnego SEO, Lighthouse 95–100 | 27 podstron, 6 kategorii, 10 stron lokalnego SEO, Lighthouse 98–100 | 29 podstron, 15 stron lokalnego SEO, Lighthouse 95–100, dostępność 100 |
| Linki | `Zobacz case study` → `/projekty/aurelia/` · `Otwórz demo` → aurelia-beauty-demo.pages.dev | `/projekty/elara/` · elara-beauty-demo.pages.dev | `/projekty/halicka/` · halicka-kosmetologia-demo.pages.dev |

Linki zewnętrzne: `target="_blank" rel="noopener"`, z tekstem „otwiera się w nowej karcie" dla czytników. Liczby Lighthouse podawać z datą pomiaru (`src/data/projekty.ts`, pole `lighthouseDate`).

**Zrzuty ekranu — pipeline (`scripts/shots.mjs`, Playwright):** viewport 390×844, `deviceScaleFactor: 2`, dla każdego dema: otwórz stronę główną, zamknij popup demo (ustawić flagę w `sessionStorage`, którą dema sprawdzają, albo kliknąć zamknięcie), poczekaj na `networkidle` i fonty, `fullPage: true`, przytnij do 2400 px CSS wysokości, `sharp` → WebP q80 → `src/assets/shots/{slug}-mobile.webp`. Dodatkowo hero desktop 1440×900 → `{slug}-desktop.webp` (na podstrony). Skrypt jest powtarzalny — po zmianach w demach odpalamy go ponownie.

### 8.2 · 02 Co dostajesz (`#zakres`) — interakcja 4
- **H2:** `Jeden produkt.` / `Wszystko, co zapełnia kalendarz.`
- **Lead:** „Nie sprzedajemy pakietów. Jest jedna strona, zrobiona do końca — od projektu po pierwsze rezerwacje."
- Akordeon, sześć pozycji (marker: `Lacznik inline`, nie numer — to nie jest kolejność). Po prawej (desktop) trzy tagi w `small`.

1. **Projekt szyty pod Twoją markę** — tagi: własna paleta i typografia; Twoje zdjęcia lub sesja; zero szablonów. „Nie dostajesz motywu z podmienionym logo. Strona ma własny charakter, dopasowany do wnętrza, cen i klientek, które chcesz przyciągać."
2. **System pozyskiwania klientek** — tagi: dobór zabiegu; cennik z filtrem; diagnoza skóry. „Element, który zamienia oglądanie w decyzję: pacjentka wybiera problem i trafia na właściwy zabieg, klientka salonu znajduje usługę w trzy sekundy, kosmetolożka zbiera leady z pełnym profilem skóry."
3. **Rezerwacja online bez prowizji** — tagi: Booksy; Fresha; Estetify; Calendly. „Wpinamy w stronę kalendarz systemu, którego używasz albo który wybierzemy razem. Rezerwacje z Twojej strony trafiają prosto do Twojego kalendarza, bez prowizji marketplace'u. Nie budujemy własnego kalendarza — to kosztuje więcej, niż daje."
4. **Lokalne SEO od pierwszego dnia** — tagi: strony miasto + usługa; wizytówka Google; dane strukturalne. „Osobne strony na frazy, których szukają klientki („manicure hybrydowy Gdynia", „mezoterapia Toruń"), wizytówka Google spięta ze stroną i dane, które Google rozumie bez zgadywania."
5. **Bezpieczeństwo prawne** — tagi: art. 14 dla klinik; RODO; zgody na wizerunek. „Klinika lekarska nie może reklamować świadczeń — dostaje stronę informacyjną, która buduje autorytet bez ryzyka. Gabinet kosmetologiczny może więcej, ale bez obietnic leczenia. Zdjęcia przed/po tylko z pisemną zgodą klientki."
6. **Szybkość, dostępność i własność** — tagi: Lighthouse 95+; hosting Cloudflare; pełne prawa. „Strona otwiera się w ułamku sekundy na telefonie, spełnia wymagania dostępności i jest Twoja: kod, domena, treści. Żadnych ukrytych abonamentów — opieka jest opcją, nie warunkiem."

### 8.3 · 03 Jedna marka na miasto (`#miasto`) — interakcja 5
- **H2:** `Jedna marka na miasto.` / `Sprawdź, czy Twoje jest wolne.`
- **Lead:** „Nie zrobimy strony Twojej konkurencji z tej samej ulicy. W każdym mieście pracujemy z jednym salonem beauty, jednym gabinetem kosmetologii i jedną kliniką." *(reguła „per segment" — decyzja otwarta nr 1, sekcja 16)*
- **Sprawdzarka:** pole `Miasto` + trzy chipy segmentu (te same co w hero, zsynchronizowane) + przycisk `Sprawdź`. Wynik pod spodem, bez przeładowania:
  - wolne: „**Gdynia, salon beauty: wolne.** Po pierwszej rozmowie rezerwujemy miasto na 14 dni, żebyś mogła spokojnie zdecydować."
  - zajęte: „**Gdynia, salon beauty: zajęte.** Możemy zaproponować sąsiednie miasto albo wpisać Cię na listę na wypadek zakończenia współpracy."
  - puste pole: „Wpisz miasto, żeby sprawdzić."
- Dane: `src/data/miasta.json` — `{ "gdynia": { "salon": "wolne", "kosmetologia": "wolne", "klinika": "wolne" } }`. Normalizacja wejścia: trim, małe litery, usunięcie znaków diakrytycznych (`Gdańsk` = `gdansk` = `GDAŃSK`). Miasto spoza pliku → „wolne" (bo naprawdę jest wolne). Dziś wszystkie wpisy = „wolne"; plik aktualizujemy ręcznie po podpisaniu umowy. **Nigdy nie wpisujemy „zajęte" dla efektu.**
- Pod sprawdzarką statyczna linia: „Zaczynamy od Trójmiasta i Torunia. Pracujemy zdalnie z całą Polską."

### 8.4 · 04 Audyt w 60 sekund (`#audyt`) — interakcja 6 (główna konwersja)
- **H2:** `Sprawdź swoją stronę` / `w 60 sekund.`
- **Lead:** „Sześć pytań. Bez logowania, bez maila. Na końcu zdecydujesz, czy chcesz pełny audyt wideo."
- **Sześć pytań**, każde z odpowiedziami `Tak` / `Nie` / `Nie wiem` (grupa radio, klawiatura, 48 px cele), jedno pytanie na ekranie, postęp jako sześć kresek, z których aktywna jest gradientowa:
  1. Czy klientka może umówić wizytę bezpośrednio na Twojej stronie, bez przechodzenia do aplikacji zewnętrznej?
  2. Czy na telefonie da się dojść do rezerwacji w maksymalnie trzech dotknięciach?
  3. Czy pełny cennik jest na stronie i da się go przeszukać?
  4. Czy Twoja strona pojawia się w Google po wpisaniu usługi i Twojego miasta?
  5. Czy zdjęcia na stronie są Twoje — wnętrze, zespół, prace — a nie ze stocku?
  6. Czy strona otwiera się na telefonie w mniej niż trzy sekundy?
- **Werdykt** (liczba „Tak"): 6 → „Twoja strona robi robotę. Jeśli chcesz, sprawdzimy, czy da się z niej wycisnąć więcej." · 4–5 → „Solidna baza i kilka dziur, przez które uciekają rezerwacje." · 2–3 → „Strona jest, ale nie sprzedaje. Klientki oglądają i wychodzą." · 0–1 → „Ta strona kosztuje Cię klientki każdego dnia."
- Pod werdyktem lista tylko tych punktów, na które padło „Nie" lub „Nie wiem", każdy z jednym zdaniem konsekwencji, np. pytanie 1: „Każda rezerwacja przez aplikację zewnętrzną to prowizja i klientka, która widzi obok Twoją konkurencję." Dla „Nie wiem": „Sprawdzimy to za Ciebie w audycie." Pełne teksty w `src/data/audyt.ts`.
- Dopisek: „To autodiagnoza, nie pomiar. Pełny audyt robimy ręcznie, na Twojej stronie."
- **Formularz pod werdyktem:** `Link do Twojej strony` (wymagany, URL), `Instagram albo e-mail` (wymagany), `Miasto` (opcjonalny), zgoda RODO (checkbox z linkiem do polityki). Przycisk `Wyślij do audytu`. Obietnica pod przyciskiem: „Dostaniesz 3-minutowe wideo z konkretami w 48 godzin. Bez zobowiązań."
- Wysyłka do Web3Forms z ukrytym polem `wynik_audytu` (odpowiedzi 1–6) — Jakub widzi w mailu, co zaznaczyła.
- Ten sam komponent renderuje stronę `/audyt/` (link do wysyłania w DM).

### 8.5 · 05 Proces (`#proces`) — interakcja 7 (jedyna prawdziwa sekwencja, więc numerowana)
- **H2:** `Cztery tygodnie.` / `Pięć kroków.`
- **Lead:** „Termin liczy się od dnia, w którym mamy Twoje teksty źródłowe i zdjęcia. Bez niespodzianek po drodze."

| # | Krok | Kiedy | Treść |
|---|---|---|---|
| 1 | Rozmowa | 30 minut | Online albo na żywo w Trójmieście. Cel, klientki, konkurencja, systemy, których używasz. Po rozmowie dostajesz cenę końcową, nie „od". |
| 2 | Koncept | tydzień 1 | Struktura strony, kierunek wizualny, plan treści. Jedna runda uwag. |
| 3 | Projekt | tydzień 2 | Ekrany główne na telefonie i na desktopie. Dwie rundy uwag. |
| 4 | Budowa | tygodnie 3–4 | Kod, treści, zdjęcia, rezerwacja, SEO, testy na prawdziwych telefonach. |
| 5 | Start i opieka | publikacja | Publikacja, godzina szkolenia z edycji treści, 30 dni poprawek w cenie. |

- **Desktop:** sekcja przypięta (**pin nr 2 z 2**), pięć kroków w poziomej ścieżce (`xPercent` scrub), nad nimi **linia-schodki**: jedna ścieżka SVG, która przy każdym kroku przeskakuje poziom wyżej (motyw z logo), rysowana `stroke-dashoffset` sterowanym scrubem (jedna ścieżka, niski koszt).
- **Mobile:** pionowa lista, linia-schodki po lewej rysowana `scaleY`, bez pinowania.

### 8.6 · 06 Cena (`#cennik`) — interakcja 8
- **H2:** `8 000–10 000 zł.` / `Tyle, nie „od".`
- **Lead:** „Jedna cena widełkowa, znana przed startem. Po rozmowie dostajesz kwotę końcową i to ona jest w umowie."
- **Konfigurator:** duża liczba (`price`) + lista przełączników. Baza **8 000 zł** zawiera: stronę główną i do 6 podstron usługowych, jeden moduł systemu pozyskiwania klientek, rezerwację online (integracja z Twoim systemem), 5 stron lokalnego SEO, wizytówkę Google spiętą ze stroną, RODO i polityki, godzinę szkolenia, 30 dni poprawek, hosting na Cloudflare (0 zł miesięcznie, na zawsze).
  Przełączniki (`src/data/cennik.json`, kwoty do potwierdzenia przez Jakuba — placeholdery):
  - `+6 podstron usługowych (do 12)` +600 zł
  - `+10 stron lokalnego SEO (do 15)` +500 zł
  - `Drugi moduł systemu (np. cennik z filtrem i diagnoza skóry)` +600 zł
  - `Teksty dla kliniki lekarskiej zgodne z art. 14` +300 zł
  Suma wszystkich = 10 000 zł (górna granica). Liczba animuje się do nowej wartości (tween 300 ms, `tabular-nums`) — ruch odpowiada na dotyk, więc jest dozwolony.
- **Płatność:** „W trzech częściach: 30% na start, 40% po akceptacji projektu, 30% po publikacji. Faktura na każdą część."
- **Opieka (osobno, opcjonalnie):** „249 zł miesięcznie: aktualizacje, kopie zapasowe, monitoring, do dwóch godzin zmian w treści. Bez zobowiązania, wypowiedzenie w każdej chwili. Bez opieki strona działa dalej — jest Twoja."
- **Nie ma w cenie (wypisane wprost):** honorarium fotografa, abonament systemu rezerwacji (Booksy, Fresha, Estetify), reklamy i ich obsługa, teksty specjalistyczne pisane od zera przez lekarza.
- Netto / brutto: TODO (zależy, czy JDG jest podatnikiem VAT — decyzja otwarta nr 2).
- Strona `/cennik/` = ten sam konfigurator + „Nie ma w cenie" + pytania o cenę z FAQ.

### 8.7 · 07 Pytania (`#pytania`) — interakcja 9
Akordeon, osiem pytań, plus JSON-LD `FAQPage`.

1. **Ile trwa realizacja?** — Cztery tygodnie od dnia, w którym mamy teksty źródłowe i zdjęcia. Przy większym zakresie (12 podstron, 15 stron SEO) pięć.
2. **Mam Booksy. Muszę z niego rezygnować?** — Nie. Wpinamy kalendarz Booksy w Twoją stronę, więc rezerwacje ze strony trafiają do Twojego kalendarza. Marketplace Booksy działa dalej na swoich zasadach — Ty decydujesz, z czego korzystasz.
3. **Będę mogła sama zmieniać treści?** — Cennik, godziny, zespół i aktualności zmieniasz sama po godzinnym szkoleniu albo zgłaszasz zmiany nam w ramach opieki — wykonujemy je w ciągu jednego dnia roboczego. *(treść zależna od decyzji otwartej nr 4 w sekcji 16 — panel CMS)*
4. **Dostanę fakturę?** — Tak, na każdą z trzech części płatności.
5. **Do kogo należy strona?** — Do Ciebie: kod, treści, domena, zdjęcia z sesji. Możesz ją przenieść w każdej chwili, bez naszej zgody.
6. **Jestem lekarzem. Strona nie złamie zakazu reklamy?** — Strony dla podmiotów leczniczych piszemy językiem informacyjnym: zakres świadczeń, kwalifikacje, przebieg zabiegu, przeciwwskazania. Bez ocen, promocji i przed/po. Przy wątpliwościach rekomendujemy konsultację prawną — praktyka izb bywa aktualizowana.
7. **Moje miasto jest zajęte. Co wtedy?** — Nie zrobimy drugiej strony w tym samym segmencie w tym samym mieście. Możemy zaproponować sąsiednie miasto albo wpisać Cię na listę na wypadek zakończenia współpracy.
8. **Prowadzicie reklamy i social media?** — Nie. Budujemy stronę i system, do którego reklamy mają prowadzić. Przy kampanii możemy przygotować dedykowane lądowisko.

### 8.8 Kontakt (`#kontakt`, bez numeru)
- **H2:** `Zacznijmy` / `od Twojej strony.`
- Lewa kolumna: „Najbliższy wolny termin startu: **październik 2026**" (z `site.config.ts`, aktualizowane ręcznie — interakcja 10, uczciwy licznik), „Odpowiedź w ciągu 24 godzin w dni robocze", e-mail (TODO), Instagram (TODO).
- Prawa: formularz `Imię`, `Salon i miasto`, `Link do strony lub Instagrama`, `Wiadomość` (opcjonalna), zgoda RODO, przycisk `Wyślij`. Web3Forms, honeypot, stany inline.
- Strona `/kontakt/` = ta sama sekcja + sprawdzarka miast.

### 8.9 Stopka
- Logo, kolumny linków: `Projekty` (trzy podstrony), `Oferta` (Cennik, Audyt, Proces), `Kontakt` (e-mail, Instagram, Polityka prywatności).
- Dane rejestrowe: `TODO_NAZWA_FIRMY`, `TODO_NIP`, `TODO_ADRES` (decyzja otwarta nr 2).
- Linia technologii (jedyne miejsce, `small`, `text-3`): „Strona zbudowana w Astro, hostowana na Cloudflare. Ruch: GSAP."
- **Ujawnienie:** „Projekty pokazowe przedstawiają fikcyjne marki. Zdjęcia w projektach pokazowych są wygenerowane — u realnych klientek pracujemy na sesji zdjęciowej."
- © rok dynamiczny.

---

## 9. Podstrony

| Ścieżka | Zawartość |
|---|---|
| `/` | strona główna (sekcja 8) |
| `/projekty/aurelia/`, `/projekty/elara/`, `/projekty/halicka/` | case study (9.1) |
| `/cennik/` | konfigurator + „Nie ma w cenie" + FAQ o cenie |
| `/audyt/` | komponent audytu jako osobna strona (link do DM) |
| `/kontakt/` | formularz + sprawdzarka miast |
| `/polityka-prywatnosci/` | RODO, Web3Forms jako procesor, Cloudflare Web Analytics bez ciasteczek |
| `/404` | „Tej strony nie ma. Zobacz projekty albo napisz." + dwa przyciski |
| `/styleguide/` | `noindex`; tokeny, typografia, przyciski, Łącznik, logo z porównaniem do PNG — do przeglądu w Etapie 0 |

Ścieżki statyczne mają końcowy ukośnik — porównania `pathname` robić przez `startsWith` lub z normalizacją (lekcja z ELARY).

### 9.1 Case study (`/projekty/[slug]/`)
Treść z `src/data/projekty.ts` (jedno źródło prawdy dla sekcji 01 i podstron). Układ:
1. Nagłówek: nazwa, segment, etykieta `Projekt pokazowy (marka fikcyjna)`, przycisk `Otwórz demo`.
2. Dwa zrzuty w przesunięciu: desktop (1440×900) i mobile (`PhoneFrame`) niżej i w prawo. Statyczne; na desktopie lekki paralaks zrzutu mobile (`yPercent` ≤ 8, tylko dekoracja).
3. `Wyzwanie` — 2–3 zdania (z tabeli 8.1, rozwinięte).
4. `Co zbudowaliśmy` — lista 6–8 punktów (z briefu: np. Aurelia — moduł „Dobierz zabieg", 12 podstron zabiegowych, 15 stron lokalnego SEO, język zgodny z art. 14; ELARA — cennik z filtrem, 6 stron kategorii, vouchery i pakiety, rezerwacja z parametrami usługi; HALICKA — „Karta Twojej Skóry", programy z osią czasu wizyt, nabór z realnym limitem).
5. `Liczby` — podstrony, strony SEO, Lighthouse z datą pomiaru, dostępność.
6. `Dla kogo to wzór` — jedno zdanie do segmentu + link do sprawdzarki miast.
7. Ujawnienie o wygenerowanych zdjęciach i fikcyjnej marce.
8. CTA: `Bezpłatny audyt` + linki do dwóch pozostałych projektów (przesunięte).
Breadcrumbs (`Projekty › Aurelia`) + JSON-LD `BreadcrumbList`.

---

## 10. Warstwa ruchu — reguły (GSAP + ScrollTrigger + Lenis)

### 10.1 Architektura
- `src/scripts/motion.ts` eksportuje `initMotion()` i `destroyMotion()`. Jedna instancja Lenis, jeden `gsap.ticker`, wszystkie ScrollTriggery tworzone w `gsap.context()`, żeby dało się je zabić jednym `revert()`.
- Do Etapu 8 strona działa bez View Transitions (`initMotion()` na `DOMContentLoaded`). W Etapie 8 przechodzimy na `astro:page-load` → `initMotion()`, `astro:before-swap` → `destroyMotion()`. Test: po trzech nawigacjach `ScrollTrigger.getAll().length` równa się liczbie na świeżo załadowanej stronie (bez duplikatów).
- Lenis: `new Lenis({ lerp: 0.1, smoothWheel: true })`, `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`. Dotyk zostaje natywny (domyślne `syncTouch: false`) — na telefonie Lenis tylko raportuje pozycję.
- `gsap.matchMedia()` z trzema kontekstami:
  - `(prefers-reduced-motion: no-preference) and (min-width: 1024px)` — pełny ruch, 2 piny;
  - `(prefers-reduced-motion: no-preference) and (max-width: 1023px)` — ruch lekki: 0 pinów, scruby tylko `translateY` zrzutów i `scaleY` linii, bez magnetyzmu;
  - `(prefers-reduced-motion: reduce)` — bez Lenis, bez scrubów, wszystko w stanie końcowym. Akordeony i chipy działają, ale przełączają się natychmiast.

### 10.2 Budżet i zasady twarde (z lekcji ELARY)
- Animujemy **wyłącznie `transform` i `opacity`**. Żadnego `height`, `top`, `width`, `background-color` w pętli scrolla.
- **Maksymalnie 2 sekcje przypięte** (Projekty, Proces) i tylko na desktopie. Pin wymusza reflow — testować na średnim Androidzie, nie tylko na iPhonie Jakuba.
- Geometrię mierzymy raz (`ScrollTrigger.refresh()` po `document.fonts.ready` i po `img.decode()` zrzutów), nie w pętli. Żadnego `getBoundingClientRect()` w handlerze scrolla.
- `will-change: transform` tylko na aktualnie scrubowanej warstwie: dodać `onEnter`, zdjąć `onLeave`.
- `scrub` 0.6–1.0 (nigdy `true` dla dużych warstw obrazu — lekkie opóźnienie wygładza dotyk).
- Zrzuty w telefonie: przed startem triggerów `await img.decode()`; ruch ≤ 1600 px na mobile; obraz ≤ 200 KB.
- Bez „wjazdów" sekcji przy wejściu w viewport. Jedyny autonomiczny ruch to sekwencja hero (8.0).
- Czasy: 150 ms hover, 200–250 ms przełączniki i pasek mobile, 320 ms akordeon, 0.5–0.7 s przebarwienia i rysowanie linii. Easing: `expo.out` dla wejść, `power2.out` dla przebarwień, `none` dla scrubów.

### 10.3 Katalog interakcji (numeracja z sekcji 8)
1. Hero: sekwencja otwarcia + przełącznik „Dla kogo".
2. Projekty desktop: pin, crossfade zrzutów, przewijanie ekranu telefonu scrubem.
3. Projekty: przebarwienie tła (10.6).
4. Co dostajesz: akordeon `grid-rows`, marker Łącznika (dolna kreska przesuwa się, gdy pozycja otwarta).
5. Miasto: sprawdzarka z wynikiem bez przeładowania, wynik pojawia się `opacity + y 8`, 200 ms.
6. Audyt: kroki z paskiem postępu (aktywna kreska gradientowa), zmiana pytania `opacity`, 200 ms, focus na nowym pytaniu.
7. Proces: linia-schodki rysowana scrubem, pin na desktopie.
8. Cena: liczba tweenowana do nowej wartości po przełączniku.
9. Pytania: akordeon.
10. Kontakt: uczciwy termin startu (bez animacji — to informacja, nie efekt).
11. Nav: linia postępu scrolla, kurczenie belki, pasek mobile.
12. Przyciski: magnetyzm (desktop), Łącznik `cta` na hover.
13. Etap 8: View Transitions między podstronami (fade 250 ms), lekki paralaks zrzutu na case study.

### 10.4 Nawigacja i belka
Jeden ScrollTrigger `start: 80px` przełącza klasę `.is-scrolled` na `<header>`. Linia postępu: `gsap.to(line, { scaleX: 1, ease: 'none', scrollTrigger: { scrub: true } })`.

### 10.5 Pasek mobile
ScrollTrigger na hero (`onLeave` pokaż, `onEnterBack` ukryj) i na sekcjach z formularzami (`onEnter` ukryj, `onLeave`/`onLeaveBack` pokaż). Klasa + CSS `transform`, 250 ms.

### 10.6 Przebarwienia sekcji Projekty
Trzy warstwy `position: fixed; inset: 0; z-index: -1; pointer-events: none; opacity: 0`, każda z tłem `tint-*`. ScrollTrigger każdego panelu: `onEnter`/`onEnterBack` → tween `opacity: 1` na swojej warstwie i `0` na pozostałych (0.6 s, `power2.out`). Po wyjściu z sekcji wszystkie do 0 (czerń wraca). Opacity = kompozytor, bez repaintu całej strony. Na podstronie projektu warstwa danego projektu ma stałe `opacity: 1`.

### 10.7 Test rozstrzygający
Headless Chrome nie mierzy rasteryzacji ani kompozycji GPU. Po każdym etapie z ruchem Jakub testuje na prawdziwym telefonie; jego obserwacja jest ważniejsza niż dowolny automatyczny pomiar. Jeśli coś szarpie: najpierw `data-motion="off"` na sekcji, potem diagnoza.

---

## 11. Wydajność, SEO, dostępność

### 11.1 Budżety
- Lighthouse mobile na każdej stronie: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100.
- JS łącznie ≤ 130 KB gzip (GSAP core + ScrollTrigger + Lenis ≈ 45–50 KB; własny kod ≤ 30 KB). Bez SplitText, bez React.
- Fonty: 2 rodziny zmienne, subset latin + latin-ext, bez kursyw. `font-display: swap` z metrykami fallbacku.
- Obrazy: WebP, ≤ 1600 px, `width/height` jawne, `loading="lazy"` poza pierwszym ekranem. Hero bez obrazu. Zrzuty mobile ≤ 200 KB, desktop ≤ 260 KB. Źródła zrzutów poza `dist/`, w `.gitignore` tylko surowe PNG.
- CLS < 0.05 (rezerwa miejsca na zrzuty, fonty z metrykami, pasek mobile poza przepływem).

### 11.2 SEO
- Tytuły i opisy per strona (PL). Wzór tytułu: `Strony dla salonów beauty i klinik medycyny estetycznej — Connectiva`. Case study: `Klinika Aurelia — projekt pokazowy strony kliniki medycyny estetycznej — Connectiva`.
- Obraz OG 1200×630: czerń, logo, jedno zdanie (`Strona, która zapełnia kalendarz.`), generowany raz w `src/assets/og/`.
- `@astrojs/sitemap`, `robots.txt` (`/styleguide/` disallow), canonical, `lang="pl"`.
- JSON-LD: `Organization` (nazwa, URL, logo, `areaServed`: Gdańsk, Gdynia, Sopot, Toruń, Polska), `FAQPage` na `/`, `BreadcrumbList` na podstronach. Bez `AggregateRating` — nie ma opinii.
- Strony lokalnego SEO Connectivy („strona dla salonu beauty Gdynia") — **poza zakresem v1**, do rozważenia po pierwszym kliencie.

### 11.3 Dostępność
- Skip link, landmarki (`header`, `main`, `nav`, `footer`), jeden `h1` na stronę, nagłówki w kolejności.
- Akordeony: `button[aria-expanded][aria-controls]`. Chipy segmentu: `role="radiogroup"`. Audyt: `fieldset` + `legend` na pytanie, `aria-live="polite"` na werdykt i wyniki sprawdzarki.
- Kontrasty z sekcji 4; kolor nigdy nie jest jedynym nośnikiem (aktywny chip ma też obramowanie i tekst).
- Focus widoczny wszędzie; kolejność tabulacji zgodna z układem; pasek mobile nie zasłania fokusowanego elementu (`scroll-padding-bottom`).
- Alt: zrzuty — „Strona główna projektu pokazowego Klinika Aurelia na telefonie"; logo — „Connectiva"; Łącznik — `aria-hidden`.
- Reduced motion respektowany w CSS (`@media`) i w GSAP (`matchMedia`).

---

## 12. Struktura plików

```
src/
  site.config.ts          # termin startu, e-mail, Instagram, dane firmy (TODO), klucz Web3Forms (TODO)
  layouts/Base.astro      # meta, OG, JSON-LD, skip link, Nav, MobileBar, Footer, TintLayers, skrypt motion
  styles/global.css       # @import "tailwindcss"; @theme z tokenami; fonty; typografia bazowa; reduced motion
  components/
    Logo.astro  Lacznik.astro  Nav.astro  MobileBar.astro  Footer.astro
    Button.astro  SectionHead.astro  Accordion.astro  PhoneFrame.astro  TintLayers.astro
    SegmentChips.astro  ProjectPanel.astro  CityCheck.astro  Audit.astro
    Process.astro  Pricing.astro  Faq.astro  ContactForm.astro  Breadcrumbs.astro
  data/
    projekty.ts   # 3 projekty: nazwa, segment, problem, rozwiązanie, liczby (+ data pomiaru), linki, zrzuty
    miasta.json   # status wyłączności per miasto per segment
    cennik.json   # baza + przełączniki z kwotami
    audyt.ts      # pytania, konsekwencje, werdykty
    faq.ts        # pytania i odpowiedzi
  scripts/
    motion.ts     # Lenis + GSAP: init/destroy, matchMedia, wszystkie ScrollTriggery
    audit.ts  city.ts  pricing.ts  forms.ts  nav.ts
  pages/
    index.astro  cennik.astro  audyt.astro  kontakt.astro  polityka-prywatnosci.astro  404.astro  styleguide.astro
    projekty/[slug].astro
  assets/shots/   # zrzuty WebP z scripts/shots.mjs
  assets/og/      # obraz OG
scripts/shots.mjs # Playwright: zrzuty trzech dem (mobile 390 i desktop 1440)
public/favicon.svg  public/robots.txt
SPEC.md           # ten plik
```

Konwencje Astro/Tailwind 4 (lekcje z dem): klasy `bg-linear-to-r` (nie `bg-gradient-to-r`), proporcje `aspect-[390/844]`, klasa `.eyebrow` zamiast `.overline` (koliduje z Tailwind), `:global()` w scoped CSS dla `@media print`, folder `images`/`assets` małymi literami, uwaga na Astro przycinające spacje na granicy znaczników przy łamaniu linii.

---

## 13. Czego NIE robimy (anty-plagiat i anty-slop)

Wzorce (Vantaframe, Jan Nawrot) dały nam **rzemiosło**: płynność przewijania, odwagę typograficzną, prosty proces, konkretny FAQ. Poniższa lista to rzeczy, których Claude Code ma nie wprowadzać nawet „dla efektu":

- Bez pływającego pill-nav (Vantaframe), bez okrągłego przycisku z tekstem po okręgu i hamburgera w kółku (Nawrot).
- Bez marquee z powtarzanym tekstem, bez gradientowych obwódek kart, bez mega-napisów WIELKIMI LITERAMI wypełniających ekran.
- Bez kart „001 / 002" z tagami technologii — u nas tagi opisują korzyści dla właścicielki, nie biblioteki.
- Bez sekcji „Technologia" jako argumentu sprzedażowego; stack to jedna linia w stopce.
- Bez czarno-białej palety — mamy czerń, zielony podton i gradient z logo, używany oszczędnie.
- Bez pionowego paska ikon social przy krawędzi.
- Bez „01." przed nagłówkami sekcji stylizowanymi na Nawrota; numeracja tylko jako licznik pozycji „02 / 07" i w krokach procesu.
- Bez wjeżdżających sekcji, hover-efektów na każdej karcie, kursorów-gadżetów (własny kursor odrzucony — dorzuca ruch bez informacji).
- Bez fałszywych liczb: liczników odliczających, „+500 klientek", opinii, których nie ma, logotypów klientów, których nie ma.
- Bez zdjęć stockowych i bez generowanego „założyciela". Bez marmuru, złota, żyrandoli i orchidei, gdyby kiedykolwiek powstawała tu grafika.
- Bez `outline: none`, bez `user-scalable=no`, bez poziomego scrolla strony.

---

## 14. Etapy budowy (jeden etap = jedno polecenie do Claude Code, STOP po każdym)

Każdy etap kończy się: `npm run build` bez błędów, podsumowaniem zmian, listą „sprawdź na telefonie" i propozycją wiadomości commita. Commit robi Jakub: `git add -A` → `git commit -m "…"` → `git push`.

### Etap 0 — Fundament
**Zakres:** `npm create astro@latest` (szablon minimal, TypeScript strict) → Tailwind 4 przez `@tailwindcss/vite` → fonty (`@fontsource-variable/newsreader`, `@fontsource-variable/hanken-grotesk`, tylko potrzebne wagi, latin + latin-ext) → `global.css` z tokenami z sekcji 4 i skalą z sekcji 5 → `site.config.ts` z polami TODO → `Base.astro` (meta, skip link, `lang="pl"`) → `Logo.astro` (SVG wg 3.2, wariant 1 lub 2) → `Lacznik.astro` → `Button.astro` → `SectionHead.astro` → szkielet `Nav.astro` i `Footer.astro` (bez ruchu) → `/styleguide/` z tokenami, skalą typograficzną z polskimi znakami, przyciskami, Łącznikiem w czterech wariantach i logo nałożonym na oryginalny PNG → `gsap` i `lenis` zainstalowane, `motion.ts` z pustym `initMotion()` i obsługą reduced motion → `.gitignore`, `README.md` (jak uruchomić, jak odpalić zrzuty), `SPEC.md` (ten plik).
**Definicja ukończenia:** build przechodzi; `/styleguide/` ma Lighthouse 100/100/100/100 mobile; „ąęśćżźńłó" wygląda dobrze w obu fontach; logo nałożone na PNG różni się ≤ 2 px; brak CLS przy ładowaniu fontów.
**Jakub:** `git init` → `git branch -M main` → remote → push → Cloudflare Pages (Connect to Git, production branch `main` z listy rozwijanej, komenda `npm run build`, katalog `dist`). Sprawdza `/styleguide/` na telefonie.
**Commit:** `Etap 0: fundament — tokeny, fonty, logo SVG, komponenty bazowe, styleguide`

### Etap 1 — Hero i belki
**Zakres:** hero wg 8.0 (H1 w dwóch liniach, Łącznik hero, lead, CTA, chipy z zapisem `data-segment`), sekwencja otwarcia w GSAP po `document.fonts.ready`, Lenis, `matchMedia` z trzema kontekstami, belka z kurczeniem i linią postępu, menu mobile z focus trapem, pasek mobile (pojawianie po wyjściu hero). Reszta strony: puste sekcje-placeholdery z `SectionHead` i licznikami, żeby scroll miał długość.
**DoD:** sekwencja ≤ 1,6 s, przy reduced motion wszystko widoczne od razu, CLS 0, Lighthouse ≥ 95, menu obsługiwane klawiaturą, `Esc` zamyka.
**Jakub:** telefon — czy hero czyta się w dwóch liniach na 360 px, czy pasek mobile nie zasłania CTA hero, czy dotyk scrolla jest natywny (bez „pływania").
**Commit:** `Etap 1: hero, sekwencja otwarcia, nawigacja, pasek mobile, silnik ruchu`

### Etap 2 — Projekty
**Zakres:** `scripts/shots.mjs` + wykonanie zrzutów trzech dem (mobile 390 i desktop 1440) → `projekty.ts` z pełną treścią z tabeli 8.1 i datą pomiarów Lighthouse → `PhoneFrame`, `ProjectPanel`, `TintLayers` → układ desktop z pinem (pin 1/2) i mobile bez pinu → chipy z hero sterują aktywnym projektem → przełącznik `data-motion="off"`.
**DoD:** trzy zrzuty łącznie ≤ 600 KB; ekran telefonu przewija się scrubem; przebarwienia wchodzą i wychodzą (czerń wraca po sekcji); linki do dem otwierają się w nowej karcie; etykieta „Projekt pokazowy (marka fikcyjna)" na każdym panelu; Lighthouse ≥ 95.
**Jakub:** telefon — czy scrub zrzutu nie szarpie (jeśli tak: `data-motion="off"` i zgłoszenie), czy przebarwienie jest widoczne, ale subtelne.
**Commit:** `Etap 2: projekty — zrzuty, telefon, pin, przebarwienia`

### Etap 3 — Co dostajesz i Jedna marka na miasto
**Zakres:** `Accordion` (grid-rows, aria) → sześć pozycji z 8.2 → `CityCheck` z `miasta.json`, normalizacją i trzema wynikami → synchronizacja chipów segmentu z hero → linia „Zaczynamy od Trójmiasta i Torunia".
**DoD:** akordeon bez skoku layoutu, klawiatura, jeden otwarty na mobile; sprawdzarka: `Gdańsk` = `gdansk` = `GDAŃSK`, miasto spoza pliku → „wolne", puste → komunikat; wynik czytany przez czytnik (`aria-live`).
**Commit:** `Etap 3: co dostajesz, sprawdzarka miast`

### Etap 4 — Audyt w 60 sekund
**Zakres:** `audyt.ts` (pytania, konsekwencje, werdykty) → `Audit.astro` (kroki, pasek postępu, werdykt, lista braków, formularz z polem ukrytym `wynik_audytu`, honeypot, Web3Forms z `TODO_WEB3FORMS_KEY`, stany inline) → sekcja na `/` i strona `/audyt/` → `forms.ts` wspólny dla wszystkich formularzy.
**DoD:** działa bez GSAP (czysty JS); klawiatura i czytnik przechodzą całość; walidacja URL i pola kontaktu z komunikatami pod polami; po wysłaniu stan sukcesu bez przeładowania; pasek mobile chowa się, gdy formularz widoczny.
**Jakub:** telefon — przejście sześciu pytań kciukiem, bez przewijania w bok.
**Commit:** `Etap 4: audyt w 60 sekund i strona /audyt/`

### Etap 5 — Proces i Cena
**Zakres:** `Process.astro` (desktop pin 2/2 z poziomą ścieżką i linią-schodkami; mobile pionowo ze `scaleY`) → `cennik.json` z bazą i przełącznikami → `Pricing.astro` (liczba `price`, przełączniki, płatność, opieka, „Nie ma w cenie", TODO netto/brutto) → `/cennik/`.
**DoD:** dokładnie 2 piny na desktopie, 0 na mobile; kwota zawsze w widełkach 8 000–10 000; liczba z `tabular-nums` nie „skacze" szerokością; tween 300 ms po przełączniku; reduced motion ustawia wartość bez tweena.
**Jakub:** telefon — czy oś procesu rysuje się przy przewijaniu, czy przełączniki cen są wygodne kciukiem.
**Commit:** `Etap 5: proces, konfigurator ceny, strona /cennik/`

### Etap 6 — Pytania, kontakt, stopka, SEO
**Zakres:** `faq.ts` + `Faq.astro` z JSON-LD `FAQPage` → `ContactForm.astro` i sekcja Kontakt z terminem startu z `site.config.ts` → `/kontakt/` → `Footer.astro` z danymi TODO, linią technologii i ujawnieniem → `/polityka-prywatnosci/`, `/404`, `robots.txt`, `@astrojs/sitemap`, obraz OG, JSON-LD `Organization`, tytuły i opisy per strona.
**DoD:** wszystkie istniejące strony Lighthouse ≥ 95 / 100 / 100 / 100 mobile; walidator danych strukturalnych bez błędów; `/styleguide/` w `robots` disallow i `noindex`.
**Commit:** `Etap 6: FAQ, kontakt, stopka, SEO i strony pomocnicze`

### Etap 7 — Podstrony projektów
**Zakres:** `projekty/[slug].astro` wg 9.1 z treścią z `projekty.ts`, dwa zrzuty w przesunięciu, `Breadcrumbs` + JSON-LD, stałe przebarwienie warstwy projektu, ujawnienie, CTA i linki krzyżowe.
**DoD:** trzy strony budują się z jednego źródła danych; Lighthouse ≥ 95; obrazy z `width/height`; tytuły wg 11.2.
**Commit:** `Etap 7: case study trzech projektów`

### Etap 8 — Dopieszczenie ruchu
**Zakres:** magnetyzm przycisków (desktop), Łącznik `cta` na hover, marker akordeonu, `<ClientRouter />` z `initMotion()`/`destroyMotion()` na `astro:page-load`/`astro:before-swap`, fade 250 ms między stronami, lekki paralaks zrzutu na case study, audyt reduced motion na wszystkich stronach.
**DoD:** po trzech nawigacjach liczba ScrollTriggerów równa liczbie po świeżym załadowaniu; brak podwójnych nasłuchów; brak duplikatów Lenis; reduced motion nadal wyłącza wszystko.
**Jakub:** telefon — przejścia między stronami, każdy scrub jeszcze raz.
**Commit:** `Etap 8: dopieszczenie ruchu i przejścia między stronami`

### Etap 9 — Audyt końcowy i publikacja
**Zakres:** tabela Lighthouse wszystkich stron z datą (do `README.md`) → przegląd dostępności (axe, nawigacja klawiaturą, czytnik na telefonie) → korekta językowa całości: cudzysłowy „ ", półpauzy, twarde spacje po „w, i, z, o, a, u", tysiące z twardą spacją, brak WIELKICH LITER w etykietach, brak „→", brak kropek środkowych → lista kontrolna uczciwości (sekcja 15) → lista TODO do uzupełnienia przed publikacją (Web3Forms, e-mail, Instagram, dane firmy, netto/brutto, termin startu, wartości `miasta.json`) → plan domeny: `connectiva.biz` podpinamy w Cloudflare Pages dopiero na wyraźne polecenie Jakuba.
**Commit:** `Etap 9: audyt końcowy, korekta, przygotowanie do publikacji`

---

## 15. Lista kontrolna uczciwości (sprawdzana w każdym etapie)

- [ ] Każde pojawienie się dema ma etykietę „Projekt pokazowy (marka fikcyjna)".
- [ ] Wygenerowane zdjęcia w demach są ujawnione (stopka + podstrony).
- [ ] Jedyne liczby na stronie: liczba podstron, wyniki Lighthouse z datą pomiaru, terminy, ceny. Żadnych „klientek", „rezerwacji", opinii, logotypów.
- [ ] Sprawdzarka miast pokazuje stan faktyczny. Dziś: wszystko „wolne".
- [ ] „Najbliższy wolny termin startu" to prawdziwa data z `site.config.ts`.
- [ ] Żadnego „od" przy cenie; widełki z jawnym „co decyduje o cenie".
- [ ] „0% prowizji" opisane precyzyjnie: dotyczy rezerwacji przez stronę; marketplace działa na swoich zasadach.
- [ ] Strona nigdzie nie sugeruje zespołu, którego nie ma.
- [ ] Wszystkie obietnice (4 tygodnie, 30 dni poprawek, odpowiedź w 24 h, wideo w 48 h) potwierdzone przez Jakuba jako wykonalne.

---

## 16. Decyzje otwarte (do potwierdzenia przez Jakuba przed Etapem 3–6)

1. **Wyłączność: per miasto czy per segment w mieście?** Specyfikacja zakłada „per segment" (salon / kosmetologia / klinika = trzy sloty na miasto). „Per miasto" zamyka Gdańsk po pierwszym kliencie i kłóci się z celem 4–10 klientów miesięcznie.
2. **Dane rejestrowe:** nazwa firmy, NIP, adres do stopki i polityki. Czy JDG jest podatnikiem VAT (ceny netto czy brutto)?
3. **Głos:** czy „my" w ogóle ma się pojawiać, czy wszystko bezosobowo i w drugiej osobie.
4. **Edycja treści przez klientkę:** panel (Keystatic / Decap na Cloudflare Pages) czy zmiany wyłącznie w ramach opieki? Od tego zależy odpowiedź FAQ nr 3 i zakres „godziny szkolenia".
5. **Kwoty przełączników w konfiguratorze** (600 / 500 / 600 / 300) i cena opieki (249 zł) — placeholdery.
6. **Pojemność:** ile projektów jednocześnie i jaki jest realny najbliższy termin startu (dziś wpisany: październik 2026).
7. **Logo:** czy da się wyeksportować SVG z Canvy; jeśli nie — potwierdzenie, że font to Montserrat Light.
8. **Alternatywy H1** (8.0) — wybór jednego wariantu.

---

*Specyfikacja v1 · 4 września 2026 · Connectiva — strona portfolio. Wersje kolejne: zmieniać w pliku, nie w promptach.*
