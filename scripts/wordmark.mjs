/**
 * Generator wordmarku „Connectiva" do SVG (SPEC 3.2, wariant 2).
 *
 * Zamienia napis złożony w Montserrat 300 na ścieżki SVG i zapisuje je do
 * `src/data/wordmark.ts`. Dzięki temu logo nie zależy od załadowania fontu:
 * nie miga, nie generuje CLS i nie wymaga wysyłania 18 KB Montserrata na
 * każdą podstronę tylko po to, żeby złożyć jedno słowo.
 *
 * Geometria (z SPEC 3.2):
 *   viewBox 0 0 1442 328
 *   wersalik y 60 → linia bazowa y 259 (wysokość wersalika 199)
 *   napis x 0 → 1411 (ink bbox), tracking dobierany tak, żeby trafić w 1411
 *
 * Uruchomienie: npm run wordmark
 *
 * Jeżeli Jakub dostarczy `brand/logo.svg` z Canvy (wariant 1 ze SPEC 3.2),
 * ten skrypt przestaje być potrzebny — wtedy ścieżki bierzemy z eksportu.
 */

import * as fontkit from 'fontkit';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

const TEKST = 'Connectiva';

// Docelowa geometria z SPEC 3.2
const CAP_HEIGHT = 199; // y 60 → 259
const BASELINE = 259;
const INK_LEFT = 0;
const INK_WIDTH = 1411;
const VIEWBOX_W = 1442;
const VIEWBOX_H = 328;

const MONTSERRAT = resolve(
  ROOT,
  'node_modules/@fontsource/montserrat/files/montserrat-latin-300-normal.woff2',
);

const font = fontkit.openSync(MONTSERRAT);

const upm = font.unitsPerEm;
const capUnits = font.capHeight;
// Skala tak dobrana, żeby nominalna wysokość wersalika wyniosła dokładnie 199.
const scale = CAP_HEIGHT / capUnits;
const fontSize = (CAP_HEIGHT * upm) / capUnits;

/** Składa napis z podanym trackingiem (w jednostkach viewBoxa na jedną szparę). */
function ulozNapis(tracking) {
  const run = font.layout(TEKST);
  const glify = [];
  let pen = 0; // w jednostkach fontu

  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    glify.push({
      glyph,
      x: (pen + (pos.xOffset ?? 0)) * scale + tracking * i,
      y: (pos.yOffset ?? 0) * scale,
    });
    pen += pos.xAdvance;
  });

  return glify;
}

/** Ścieżka glifu przeskalowana i odwrócona w pionie, gotowa do SVG. */
function sciezkaGlifu(glyph, dx, dy) {
  const KOMENDY = {
    moveTo: 'M',
    lineTo: 'L',
    quadraticCurveTo: 'Q',
    bezierCurveTo: 'C',
    closePath: 'Z',
  };
  const r = (n) => {
    const v = Math.round(n * 100) / 100;
    return Object.is(v, -0) ? 0 : v;
  };

  let d = '';
  for (const cmd of glyph.path.commands) {
    const litera = KOMENDY[cmd.command];
    if (!litera) throw new Error(`Nieznana komenda ścieżki: ${cmd.command}`);
    if (litera === 'Z') {
      d += 'Z';
      continue;
    }
    const punkty = [];
    for (let i = 0; i < cmd.args.length; i += 2) {
      punkty.push(r(dx + cmd.args[i] * scale));
      punkty.push(r(BASELINE - dy - cmd.args[i + 1] * scale));
    }
    d += litera + punkty.join(' ');
  }
  return d;
}

/** Ink bbox całego napisu przy danym trackingu. */
function zmierz(glify) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const { glyph, x, y } of glify) {
    const b = glyph.bbox;
    if (b.minX === b.maxX && b.minY === b.maxY) continue; // glif pusty
    minX = Math.min(minX, x + b.minX * scale);
    maxX = Math.max(maxX, x + b.maxX * scale);
    minY = Math.min(minY, BASELINE - y - b.maxY * scale);
    maxY = Math.max(maxY, BASELINE - y - b.minY * scale);
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

// Szerokość ink jest liniowa względem trackingu: width(t) = width(0) + (n-1) * t
const szpary = TEKST.length - 1;
const bazowa = zmierz(ulozNapis(0));
const tracking = (INK_WIDTH - bazowa.width) / szpary;

const glify = ulozNapis(tracking);
const zmierzone = zmierz(glify);

// Przesunięcie tak, żeby lewa krawędź ink wypadła dokładnie na INK_LEFT.
const przesuniecie = INK_LEFT - zmierzone.minX;

const sciezki = glify
  .map(({ glyph, x, y }) => sciezkaGlifu(glyph, x + przesuniecie, y))
  .join('');

const koncowe = zmierz(
  glify.map((g) => ({ ...g, x: g.x + przesuniecie })),
);

const raport = {
  font: 'Montserrat 300 (@fontsource/montserrat, latin)',
  unitsPerEm: upm,
  capHeightUnits: capUnits,
  fontSizePx: Math.round(fontSize * 100) / 100,
  trackingViewBox: Math.round(tracking * 1000) / 1000,
  trackingEm: Math.round((tracking / fontSize) * 10000) / 10000,
  inkBBox: {
    x: Math.round(koncowe.minX * 100) / 100,
    y: Math.round(koncowe.minY * 100) / 100,
    width: Math.round(koncowe.width * 100) / 100,
    height: Math.round(koncowe.height * 100) / 100,
  },
  dlugoscSciezki: sciezki.length,
};

const plik = `// PLIK GENEROWANY — nie edytować ręcznie.
// Źródło: scripts/wordmark.mjs (npm run wordmark). Zob. SPEC 3.2.
//
// Wordmark „Connectiva" złożony w ${raport.font} i zamieniony na ścieżki,
// żeby logo nie zależało od załadowania fontu (bez migotania, bez CLS).
//
// font-size:  ${raport.fontSizePx} px (wersalik = ${CAP_HEIGHT})
// tracking:   ${raport.trackingViewBox} jednostek viewBoxa = ${raport.trackingEm}em
// ink bbox:   x ${raport.inkBBox.x}, y ${raport.inkBBox.y}, ${raport.inkBBox.width} × ${raport.inkBBox.height}
//             (cel wg SPEC: x 0, szerokość ${INK_WIDTH}, wersalik ${CAP_HEIGHT})

/** Wymiary viewBoxa logo — z analizy oryginału (SPEC 3.2). */
export const VIEWBOX = { width: ${VIEWBOX_W}, height: ${VIEWBOX_H} } as const;

/** Proporcja logo, do rezerwowania miejsca w układzie (bez CLS). */
export const PROPORCJA = VIEWBOX.width / VIEWBOX.height;

/** Dwie linie w przesunięciu — sygnatura marki (SPEC 3.2 i 6). */
export const LINIE = {
  gora: { x1: 712, x2: 1442, y: 5.5 },
  dol: { x1: 23, x2: 711, y: 322.5 },
  szerokosc: 11,
} as const;

/** Jak wordmark został złożony — do podglądu na /styleguide/. */
export const METRYKI = {
  font: '${raport.font}',
  fontSizePx: ${raport.fontSizePx},
  trackingEm: ${raport.trackingEm},
  wysokoscWersalika: ${CAP_HEIGHT},
  liniaBazowa: ${BASELINE},
  inkBBox: {
    x: ${raport.inkBBox.x},
    y: ${raport.inkBBox.y},
    width: ${raport.inkBBox.width},
    height: ${raport.inkBBox.height},
  },
} as const;

/** Ścieżki wordmarku, w układzie współrzędnych VIEWBOX. */
export const WORDMARK_PATH =
  '${sciezki}';
`;

writeFileSync(resolve(ROOT, 'src/data/wordmark.ts'), plik, 'utf8');

console.log('Wordmark zapisany do src/data/wordmark.ts');
console.log(raport);

// ---------------------------------------------------------------------------
// Metryki fontów treściowych — do `size-adjust` fallbacku w global.css (SPEC 5).
// ---------------------------------------------------------------------------

const FALLBACKI = {
  // Arial (Windows/macOS), typowy fallback dla grotesku
  arial: { upm: 2048, ascent: 1854, descent: -434, lineGap: 67, xHeight: 1062 },
  // Times New Roman, typowy fallback dla szeryfa
  times: { upm: 2048, ascent: 1825, descent: -443, lineGap: 87, xHeight: 916 },
};

const RODZINY = [
  {
    nazwa: 'Newsreader Variable',
    plik: 'node_modules/@fontsource-variable/newsreader/files/newsreader-latin-wght-normal.woff2',
    fallback: 'times',
  },
  {
    nazwa: 'Hanken Grotesk Variable',
    plik: 'node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2',
    fallback: 'arial',
  },
];

console.log('\nMetryki fallbacku (do @font-face w global.css):');
for (const r of RODZINY) {
  const f = fontkit.openSync(resolve(ROOT, r.plik));
  const fb = FALLBACKI[r.fallback];
  const pct = (n) => `${Math.round(n * 10000) / 100}%`;

  const sizeAdjust = f.xHeight / f.unitsPerEm / (fb.xHeight / fb.upm);
  console.log(`  ${r.nazwa} → ${r.fallback}`);
  console.log(`    size-adjust:       ${pct(sizeAdjust)}`);
  console.log(`    ascent-override:   ${pct(f.ascent / f.unitsPerEm / sizeAdjust)}`);
  console.log(`    descent-override:  ${pct(Math.abs(f.descent) / f.unitsPerEm / sizeAdjust)}`);
  console.log(`    line-gap-override: ${pct(f.lineGap / f.unitsPerEm / sizeAdjust)}`);
}
