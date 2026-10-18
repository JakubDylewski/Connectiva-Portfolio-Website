/**
 * Smoke test trzech formularzy (Margo) na lokalnym podglądzie.
 * Uruchomienie: npm run preview, potem `node scripts/test-form.mjs`.
 *
 * Turnstile dostaje atrapę (klucz działa tylko na produkcji), a POST do
 * Margo jest przechwytywany — test sprawdza dokładnie ten JSON, który
 * poszedłby na serwer, razem z nagłówkami [AUDYT]/[CENNIK] w wiadomości.
 * Plik roboczy — nie jest częścią builda.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const FORM = 'form[data-margo]';

const bledyJs = [];
const payloady = [];

function zaloz(warunek, opis) {
  if (!warunek) throw new Error(`FAIL: ${opis}`);
  console.log(`OK: ${opis}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', (e) => bledyJs.push(String(e)));

// Atrapa Turnstile: zawsze gotowy token, bez sieci.
await page.addInitScript(() => {
  window.turnstile = {
    render: () => 'w-test',
    reset: () => {},
    remove: () => {},
    getResponse: () => 'test-token-e2e',
  };
});

// Przechwycony endpoint Margo — zapisujemy payload, odpowiadamy sukcesem.
await page.route('**/lead', async (route) => {
  payloady.push(JSON.parse(route.request().postData() ?? '{}'));
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
});

const otworz = async (sciezka) => {
  await page.goto(`${BASE}${sciezka}`);
  await page.waitForLoadState('load');
  await page.waitForTimeout(700);
};

const niepusteBledy = async () =>
  (await page.locator(`${FORM} .pole__blad`).allInnerTexts())
    .map((t) => t.trim())
    .filter(Boolean);

/** Przechodzi pytania audytu/kreatora aż pokaże się formularz. */
async function przejdzPytania(odpSelektor) {
  for (let i = 0; i < 12; i++) {
    if (await page.locator(FORM).first().isVisible()) return;
    // Radio przykrywa etykietę (opacity: 0, inset: 0) — zaznaczamy input.
    const odp = page.locator(odpSelektor).first();
    if (await odp.isVisible().catch(() => false)) {
      await odp.check();
      await page.waitForTimeout(350);
    }
    if (await page.locator(FORM).first().isVisible()) return;
    const dalej = page.locator('[data-dalej]:visible').first();
    if (await dalej.isEnabled().catch(() => false)) {
      await dalej.click();
      await page.waitForTimeout(350);
    }
  }
  throw new Error('FAIL: formularz nie pokazał się po przejściu pytań');
}

const wyslijIOdbierz = async () => {
  const przed = payloady.length;
  await page.locator(`${FORM} button[type=submit]:visible`).click();
  await page.waitForSelector(`${FORM}[data-stan-wysylki="ok"]`, { timeout: 8000 });
  zaloz(payloady.length === przed + 1, 'poszło dokładnie jedno zgłoszenie');
  return payloady[payloady.length - 1];
};

/* --- kontakt ------------------------------------------------------------- */

await otworz('/kontakt/');
zaloz((await page.locator(FORM).count()) === 1, 'formularz kontaktowy na /kontakt/');

await page.locator(`${FORM} button[type=submit]`).click();
await page.waitForTimeout(400);
zaloz((await niepusteBledy()).length === 4, '4 komunikaty walidacji po pustej wysyłce');

await page.fill(`${FORM} input[name="kontakt"]`, '+48 601 234 567');
await page.waitForTimeout(300);
zaloz((await niepusteBledy()).length === 3, 'telefon przechodzi walidację pola kontakt');

await page.fill(`${FORM} input[name="imie"]`, 'Anna');
await page.fill(`${FORM} textarea[name="wiadomosc"]`, 'Dzień dobry, proszę o kontakt.');
await page.check(`${FORM} input[name="zgoda"]`);
let dane = await wyslijIOdbierz();
zaloz(dane.imie === 'Anna' && dane.kontakt === '+48 601 234 567', 'kontakt: imię i kontakt w payloadzie');
zaloz(dane.wiadomosc === 'Dzień dobry, proszę o kontakt.', 'kontakt: wiadomość bez nagłówka źródła');
zaloz(dane.www === '' && dane['cf-turnstile-response'] === 'test-token-e2e', 'kontakt: www puste, token w payloadzie');

/* --- audyt ---------------------------------------------------------------- */

await otworz('/audyt/');
await przejdzPytania('[data-krok]:not([hidden]) .odp__input');
console.log('audyt: formularz widoczny po pytaniach');

await page.fill(`${FORM} input[name="strona"]`, 'twojsalon.pl');
await page.fill(`${FORM} input[name="kontakt"]`, 'anna@salon.pl');
await page.fill(`${FORM} input[name="miasto"]`, 'Gdańsk');
await page.check(`${FORM} input[name="zgoda"]`);
dane = await wyslijIOdbierz();
console.log('audyt wiadomosc:', JSON.stringify(dane.wiadomosc));
zaloz(dane.imie === '(nie podano)', 'audyt: puste imię jedzie jako „(nie podano)"');
zaloz(dane.salon === '', 'audyt: salon pusty');
zaloz(dane.kontakt === 'anna@salon.pl', 'audyt: kontakt w payloadzie');
zaloz(
  dane.wiadomosc.startsWith('[AUDYT] Strona: https://twojsalon.pl/ | Miasto: Gdańsk | Wynik: '),
  'audyt: nagłówek [AUDYT] ze stroną, miastem i wynikiem',
);
zaloz(dane.wiadomosc.includes('na tak)'), 'audyt: wynik zawiera podsumowanie odpowiedzi');

/* --- kreator (cennik) ------------------------------------------------------ */

await otworz('/cennik/');
await przejdzPytania('[data-krok-k]:not([hidden]) .opcja-k__input');
console.log('kreator: ekran wyniku z formularzem widoczny');

await page.fill('[data-uwagi]', 'Proszę o kontakt po 17.');
await page.fill(`${FORM} input[name="imie"]`, 'Ola');
await page.fill(`${FORM} input[name="salon"]`, 'Salon X, Gdynia');
await page.fill(`${FORM} input[name="kontakt"]`, '@salon.x');
await page.check(`${FORM} input[name="zgoda"]`);
dane = await wyslijIOdbierz();
console.log('kreator wiadomosc:', JSON.stringify(dane.wiadomosc));
zaloz(dane.imie === 'Ola' && dane.salon === 'Salon X, Gdynia', 'kreator: imię i salon w payloadzie');
zaloz(dane.wiadomosc.startsWith('[CENNIK] Wybrane: '), 'kreator: nagłówek [CENNIK] z odpowiedziami');
zaloz(dane.wiadomosc.includes(' | Szacunek: ') && dane.wiadomosc.includes(' zł'), 'kreator: widełki w nagłówku');
zaloz(dane.wiadomosc.endsWith('\nProszę o kontakt po 17.'), 'kreator: uwagi jako treść wiadomości');

await browser.close();

console.log('błędy JS strony:', bledyJs.length ? bledyJs : 'brak');
if (bledyJs.length > 0) {
  console.error('FAIL: błędy JS na stronie');
  process.exit(1);
}
console.log('PASS');
