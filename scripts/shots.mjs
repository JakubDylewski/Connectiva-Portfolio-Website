/**
 * Zrzuty ekranu trzech dem (SPEC 8.1).
 *
 * Dla każdego dema robimy dwa pliki:
 *   {slug}-mobile.webp   390 × 2400 CSS px przy deviceScaleFactor 2 → 780 px fizycznych
 *   {slug}-desktop.webp  1440 × 900 (sam hero, na podstrony z Etapu 7)
 *
 * Skrypt jest powtarzalny — po zmianach w demach odpalamy go ponownie
 * i pliki się nadpisują:
 *
 *   npm run shots            wszystkie trzy dema
 *   npm run shots -- elara   tylko wybrane
 *
 * Budżety ze SPEC 11.1: mobile ≤ 200 KB, desktop ≤ 260 KB. Zaczynamy od
 * jakości 80; jeśli plik nie mieści się w budżecie, schodzimy z jakością
 * i wypisujemy, na czym stanęło. Budżet jest twardy, jakość negocjowalna.
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const WYJSCIE = resolve(ROOT, 'src/assets/shots');

/** Dema (SPEC 8.1). */
const DEMA = [
  { slug: 'aurelia', url: 'https://aurelia-beauty-demo.pages.dev/' },
  { slug: 'elara', url: 'https://elara-beauty-demo.pages.dev/' },
  { slug: 'halicka', url: 'https://halicka-kosmetologia-demo.pages.dev/' },
];

/**
 * Klucze `sessionStorage`, którymi dema pamiętają zamknięty popup „to jest
 * demo". Nazwa nie jest jednolita — Aurelia używa `{slug}-demo-notice`,
 * ELARA i HALICKA `{slug}-demo-notice-seen` — więc ustawiamy obie wersje.
 * Gdyby doszła trzecia, zostaje kliknięcie w „Zamknij" jako zapasowa droga.
 */
const kluczePopupu = (slug) => [`${slug}-demo-notice`, `${slug}-demo-notice-seen`];

const MOBILE = { width: 390, height: 844, dsf: 2, wysokoscCiecia: 2400, budzetKB: 200 };
const DESKTOP = { width: 1440, height: 900, dsf: 1, budzetKB: 260 };

const KB = (b) => Math.round(b / 102.4) / 10;

/**
 * Zapisuje WebP mieszczący się w budżecie. Zwraca użytą jakość i rozmiar.
 */
async function zapiszWebp(obraz, sciezka, budzetKB) {
  for (const jakosc of [80, 72, 65, 58, 50]) {
    const bufor = await obraz.clone().webp({ quality: jakosc, effort: 6 }).toBuffer();
    if (KB(bufor.length) <= budzetKB || jakosc === 50) {
      writeFileSync(sciezka, bufor);
      return { jakosc, kb: KB(bufor.length), wBudzecie: KB(bufor.length) <= budzetKB };
    }
  }
  throw new Error('nieosiągalne');
}

/** Przewija stronę do końca i z powrotem, żeby dociągnąć obrazy `loading="lazy"`. */
async function dociagnijLeniwe(page) {
  await page.evaluate(async () => {
    const krok = window.innerHeight;
    const koniec = document.body.scrollHeight;
    for (let y = 0; y < koniec; y += krok) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 250));
  });
}

/**
 * Odklikuje baner ciasteczek, wybierając wariant najbardziej oszczędny dla
 * prywatności („tylko niezbędne" / „odrzuć"), nigdy „akceptuję wszystkie".
 * Baner nie ma prawa wylądować na zrzucie.
 */
async function odklikBanerCiasteczek(page) {
  const wzorce = [/tylko niezb/i, /odrzu/i, /niezb[eę]dne/i];
  for (const wzorzec of wzorce) {
    const btn = page.getByRole('button', { name: wzorzec }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(400);
      return true;
    }
  }
  return false;
}

/** Domyka popup dema, gdyby flaga w sessionStorage nie zadziałała. */
async function domknijPopup(page) {
  const zamknij = page.locator('#demo-notice-close');
  if (await zamknij.isVisible().catch(() => false)) {
    await zamknij.click();
    await page.waitForTimeout(400);
    return 'kliknięciem';
  }
  return 'flagą w sessionStorage';
}

/**
 * Upewnia się, że po zamknięciu nie zostało nic z nakładki popupu.
 * Dema robią go różnie: Aurelia divem `#demo-notice-overlay`, ELARA
 * i HALICKA elementem `<dialog>` — sprawdzamy oba warianty, plus to,
 * czy demo nie zablokowało przewijania na `body`.
 */
async function sprawdzBrakPopupu(page, slug) {
  const problem = await page.evaluate(() => {
    const overlay = document.querySelector('#demo-notice-overlay');
    if (overlay && getComputedStyle(overlay).display !== 'none') return 'overlay widoczny';
    if (document.querySelector('dialog[open]')) return 'dialog otwarty';
    if (document.body.style.overflow === 'hidden') return 'przewijanie zablokowane';
    return null;
  });
  if (problem) {
    throw new Error(`[${slug}] popup dema wciąż zasłania stronę (${problem}) — zrzut byłby do niczego`);
  }
}

async function zrzucDemo(browser, demo) {
  const wyniki = [];

  // --- mobile ---------------------------------------------------------------
  {
    const ctx = await browser.newContext({
      viewport: { width: MOBILE.width, height: MOBILE.height },
      deviceScaleFactor: MOBILE.dsf,
      locale: 'pl-PL',
      reducedMotion: 'reduce', // zrzut ma być stanem końcowym, nie klatką animacji
    });
    // Flaga musi być na miejscu, zanim wystartuje skrypt dema.
    await ctx.addInitScript((klucze) => {
      for (const k of klucze) {
        try {
          sessionStorage.setItem(k, '1');
        } catch {
          /* prywatny tryb — zostaje kliknięcie */
        }
      }
    }, kluczePopupu(demo.slug));

    const page = await ctx.newPage();
    await page.goto(demo.url, { waitUntil: 'networkidle', timeout: 60_000 });
    const sposob = await domknijPopup(page);
    const banerCiasteczek = await odklikBanerCiasteczek(page);
    await page.evaluate(() => document.fonts.ready);
    await dociagnijLeniwe(page);
    await sprawdzBrakPopupu(page, demo.slug);

    const wysokoscStrony = await page.evaluate(() => document.body.scrollHeight);
    const wysokoscCiecia = Math.min(MOBILE.wysokoscCiecia, wysokoscStrony);

    // Zamiast `fullPage` rozciągamy sam viewport na docelową wysokość i wracamy
    // na górę strony. Przy `fullPage` elementy `fixed` i `sticky` odbijają się
    // na zrzucie w miejscu, w którym akurat stały po przewijaniu — belka
    // powtarza się w połowie obrazka, a dekoracje sterowane scrollem
    // rozciągają się na całą wysokość. Wysoki viewport tego nie robi:
    // każdy element renderuje się raz, w swoim naturalnym położeniu.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.setViewportSize({ width: MOBILE.width, height: wysokoscCiecia });
    await page.waitForTimeout(600);
    await sprawdzBrakPopupu(page, demo.slug);

    const png = await page.screenshot();

    const plik = join(WYJSCIE, `${demo.slug}-mobile.webp`);
    const obraz = sharp(png);
    const meta = await obraz.metadata();
    const zapis = await zapiszWebp(obraz, plik, MOBILE.budzetKB);

    wyniki.push({
      plik: `${demo.slug}-mobile.webp`,
      wymiary: `${meta.width} × ${meta.height}`,
      wysokoscCSS: wysokoscCiecia,
      popup: sposob,
      banerCiasteczek,
      ...zapis,
    });
    await ctx.close();
  }

  // --- desktop (hero, na podstrony z Etapu 7) -------------------------------
  {
    const ctx = await browser.newContext({
      viewport: { width: DESKTOP.width, height: DESKTOP.height },
      deviceScaleFactor: DESKTOP.dsf,
      locale: 'pl-PL',
      reducedMotion: 'reduce',
    });
    await ctx.addInitScript((klucze) => {
      for (const k of klucze) {
        try {
          sessionStorage.setItem(k, '1');
        } catch {
          /* prywatny tryb — zostaje kliknięcie */
        }
      }
    }, kluczePopupu(demo.slug));

    const page = await ctx.newPage();
    await page.goto(demo.url, { waitUntil: 'networkidle', timeout: 60_000 });
    await domknijPopup(page);
    await odklikBanerCiasteczek(page);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await sprawdzBrakPopupu(page, demo.slug);

    // Sam pierwszy ekran — bez `fullPage`.
    const png = await page.screenshot();

    const plik = join(WYJSCIE, `${demo.slug}-desktop.webp`);
    const obraz = sharp(png);
    const meta = await obraz.metadata();
    const zapis = await zapiszWebp(obraz, plik, DESKTOP.budzetKB);

    wyniki.push({
      plik: `${demo.slug}-desktop.webp`,
      wymiary: `${meta.width} × ${meta.height}`,
      ...zapis,
    });
    await ctx.close();
  }

  return wyniki;
}

// ---------------------------------------------------------------------------

const filtr = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const doZrobienia = filtr.length
  ? DEMA.filter((d) => filtr.includes(d.slug))
  : DEMA;

if (doZrobienia.length === 0) {
  console.error(`Nie znam takiego dema. Dostępne: ${DEMA.map((d) => d.slug).join(', ')}`);
  process.exit(1);
}

mkdirSync(WYJSCIE, { recursive: true });

const browser = await chromium.launch();
const wszystko = [];

try {
  for (const demo of doZrobienia) {
    console.log(`\n→ ${demo.slug}  ${demo.url}`);
    const wyniki = await zrzucDemo(browser, demo);
    for (const w of wyniki) {
      const ostrzezenie = w.wBudzecie ? '' : '  ← POZA BUDŻETEM';
      console.log(
        `   ${w.plik.padEnd(24)} ${String(w.wymiary).padEnd(13)} q${w.jakosc}  ${w.kb} KB${ostrzezenie}`,
      );
      if (w.popup) {
        console.log(
          `   popup zamknięty ${w.popup}` +
            (w.banerCiasteczek ? ', baner ciasteczek odklikany (tylko niezbędne)' : ''),
        );
      }
    }
    wszystko.push(...wyniki);
  }
} finally {
  await browser.close();
}

const suma = wszystko
  .filter((w) => w.plik.includes('mobile'))
  .reduce((a, w) => a + statSync(join(WYJSCIE, w.plik)).size, 0);

console.log(`\nTrzy zrzuty mobile razem: ${KB(suma)} KB (DoD Etapu 2: ≤ 600 KB)`);

const pozaBudzetem = wszystko.filter((w) => !w.wBudzecie);
if (pozaBudzetem.length) {
  console.error(
    `\nUWAGA: ${pozaBudzetem.length} plik(ów) nie zmieściło się w budżecie mimo zejścia z jakością.`,
  );
  process.exitCode = 1;
}
