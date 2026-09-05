/**
 * Obraz Open Graph i logo PNG (SPEC 11.2).
 *
 * Generujemy raz i trzymamy w repo:
 *   src/assets/og/og.png    1200 × 630 — czerń, logo, jedno zdanie
 *   src/assets/og/logo.png   600 × 137 — logo do JSON-LD `Organization`
 *
 * Uruchomienie: npm run og
 *
 * Zdanie zamieniamy na ścieżki tak samo jak wordmark (scripts/wordmark.mjs).
 * Rasteryzator w sharpie nie ma dostępu do naszych fontów — gdyby zdanie
 * zostało tekstem, podstawiłby cokolwiek albo nic. Ścieżki są niezależne
 * od tego, co jest zainstalowane w systemie.
 */

import * as fontkit from 'fontkit';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

import { VIEWBOX, LINIE, WORDMARK_PATH } from '../src/data/wordmark.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const WYJSCIE = resolve(ROOT, 'src/assets/og');

const ZDANIE = 'Strona, która zapełnia kalendarz.';

const KATALOG_FONTU = resolve(
  ROOT,
  'node_modules/@fontsource-variable/newsreader/files',
);

/**
 * Newsreader jest w paczce pocięty na podzbiory: `latin` ma wszystko poza
 * „ł", a „ł" (U+0142) siedzi osobno w `latin-ext`. Żeby złożyć polskie zdanie,
 * trzeba sięgnąć do obu i dobierać font per znak.
 */
const FONTY = [
  join(KATALOG_FONTU, 'newsreader-latin-wght-normal.woff2'),
  join(KATALOG_FONTU, 'newsreader-latin-ext-wght-normal.woff2'),
];

/** Dzieli tekst na odcinki obsługiwane przez ten sam font. */
function naOdcinki(fonty, tekst) {
  const odcinki = [];
  for (const znak of tekst) {
    const font =
      fonty.find((f) => f.hasGlyphForCodePoint(znak.codePointAt(0))) ?? fonty[0];
    const ostatni = odcinki[odcinki.length - 1];
    if (ostatni && ostatni.font === font) ostatni.tekst += znak;
    else odcinki.push({ font, tekst: znak });
  }
  return odcinki;
}

/**
 * Zamienia napis na ścieżkę SVG w podanym rozmiarze.
 * Kerning zachowujemy wewnątrz odcinków; gubimy go tylko na styku fontów,
 * czyli wokół pojedynczego „ł" — na oko nie do wychwycenia.
 */
function napisNaSciezke(fonty, tekst, rozmiar, x0, linaBazowa) {
  let kursor = x0;
  let d = '';

  for (const odcinek of naOdcinki(fonty, tekst)) {
    const wynik = odcinekNaSciezke(odcinek.font, odcinek.tekst, rozmiar, kursor, linaBazowa);
    d += wynik.d;
    kursor += wynik.szerokosc;
  }

  return { d, szerokosc: kursor - x0 };
}

function odcinekNaSciezke(font, tekst, rozmiar, x0, linaBazowa) {
  const skala = rozmiar / font.unitsPerEm;
  const run = font.layout(tekst);

  const KOMENDY = {
    moveTo: 'M',
    lineTo: 'L',
    quadraticCurveTo: 'Q',
    bezierCurveTo: 'C',
    closePath: 'Z',
  };
  const r = (n) => Math.round(n * 100) / 100;

  let d = '';
  let pen = 0;

  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    const dx = x0 + (pen + (pos.xOffset ?? 0)) * skala;
    const dy = linaBazowa - (pos.yOffset ?? 0) * skala;

    for (const cmd of glyph.path.commands) {
      const litera = KOMENDY[cmd.command];
      if (!litera) continue;
      if (litera === 'Z') {
        d += 'Z';
        continue;
      }
      const punkty = [];
      for (let k = 0; k < cmd.args.length; k += 2) {
        punkty.push(r(dx + cmd.args[k] * skala));
        punkty.push(r(dy - cmd.args[k + 1] * skala));
      }
      d += litera + punkty.join(' ');
    }
    pen += pos.xAdvance;
  });

  return { d, szerokosc: pen * skala };
}

/** Logo jako fragment SVG w podanym miejscu i szerokości. */
function logoSvg(x, y, szerokosc, idGradientu) {
  const skala = szerokosc / VIEWBOX.width;
  return `
  <g transform="translate(${x} ${y}) scale(${skala})">
    <line x1="${LINIE.gora.x1}" y1="${LINIE.gora.y}" x2="${LINIE.gora.x2}" y2="${LINIE.gora.y}"
          stroke="url(#${idGradientu})" stroke-width="${LINIE.szerokosc}" stroke-linecap="butt"/>
    <line x1="${LINIE.dol.x1}" y1="${LINIE.dol.y}" x2="${LINIE.dol.x2}" y2="${LINIE.dol.y}"
          stroke="url(#${idGradientu})" stroke-width="${LINIE.szerokosc}" stroke-linecap="butt"/>
    <path d="${WORDMARK_PATH}" fill="url(#${idGradientu})"/>
  </g>`;
}

function gradient(id, x1, x2) {
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" x2="${x2}">
    <stop offset="0" stop-color="#4898AB"/>
    <stop offset="0.5" stop-color="#6CB68B"/>
    <stop offset="1" stop-color="#8FD46C"/>
  </linearGradient>`;
}

const fonty = FONTY.map((f) => fontkit.openSync(f));

mkdirSync(WYJSCIE, { recursive: true });

// --- og.png ----------------------------------------------------------------
{
  const W = 1200;
  const H = 630;
  const margines = 80;

  const logoSzer = 420;
  const logoY = margines;

  const rozmiarZdania = 62;
  const zdanie = napisNaSciezke(fonty, ZDANIE, rozmiarZdania, margines, H - margines - 24);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${gradient('g-logo', margines, margines + logoSzer)}
  </defs>
  <rect width="${W}" height="${H}" fill="#000000"/>
  ${logoSvg(margines, logoY, logoSzer, 'g-logo')}
  <path d="${zdanie.d}" fill="#EEF2EF"/>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(join(WYJSCIE, 'og.png'));
  console.log(
    `og.png        ${W} × ${H}   zdanie ${Math.round(zdanie.szerokosc)} px szerokości (dostępne ${W - 2 * margines})`,
  );
  if (zdanie.szerokosc > W - 2 * margines) {
    console.error('  UWAGA: zdanie nie mieści się w marginesach — zmniejsz rozmiarZdania');
    process.exitCode = 1;
  }
}

// --- logo.png (do JSON-LD Organization) ------------------------------------
{
  const W = 600;
  const H = Math.round((W / VIEWBOX.width) * VIEWBOX.height);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${gradient('g-logo2', 0, W)}</defs>
  <rect width="${W}" height="${H}" fill="#000000"/>
  ${logoSvg(0, 0, W, 'g-logo2')}
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(join(WYJSCIE, 'logo.png'));
  console.log(`logo.png      ${W} × ${H}`);
}
