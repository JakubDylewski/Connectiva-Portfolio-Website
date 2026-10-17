/**
 * Smoke test formularza kontaktowego (Margo) na lokalnym podglądzie.
 * Uruchomienie: npm run preview, potem `node scripts/test-form.mjs`.
 * Plik roboczy — nie jest częścią builda.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const FORM = 'form[data-margo]';

const bledyJs = [];
const zadaniaMargo = [];

function zaloz(warunek, opis) {
  if (!warunek) throw new Error(`FAIL: ${opis}`);
  console.log(`OK: ${opis}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', (e) => bledyJs.push(String(e)));
page.on('request', (r) => {
  if (r.url().includes('margo.connectiva')) zadaniaMargo.push(r.url());
});

const niepusteBledy = async () =>
  (await page.locator(`${FORM} .pole__blad`).allInnerTexts())
    .map((t) => t.trim())
    .filter(Boolean);

await page.goto(`${BASE}/kontakt/`);
await page.waitForLoadState('load');
  await page.waitForTimeout(900);

zaloz((await page.locator(FORM).count()) === 1, 'formularz margo jest na /kontakt/');
console.log(
  'skrypt turnstile w dokumencie:',
  await page.locator('script[src*="challenges.cloudflare.com"]').count(),
);

// 1) pusta wysyłka → walidacja: imie, kontakt, wiadomosc, zgoda (salon NIE)
await page.locator(`${FORM} button[type=submit]`).click();
await page.waitForTimeout(400);
let bledy = await niepusteBledy();
console.log('komunikaty po pustej wysyłce:', bledy);
zaloz(bledy.length === 4, '4 komunikaty walidacji po pustej wysyłce');

// 2) telefon przechodzi regułę kontakt-tel (rewalidacja na input)
await page.fill(`${FORM} input[name="kontakt"]`, '+48 601 234 567');
await page.waitForTimeout(300);
zaloz((await niepusteBledy()).length === 3, 'telefon przechodzi walidację pola kontakt');

// 3) e-mail i IG też przechodzą
for (const wartosc of ['anna@salon.pl', '@salon.urody']) {
  await page.fill(`${FORM} input[name="kontakt"]`, wartosc);
  await page.waitForTimeout(250);
  zaloz((await niepusteBledy()).length === 3, `${wartosc} przechodzi walidację`);
}

// 4) komplet pól bez salonu → walidacja czysta; wysyłka staje najwyżej
//    na tokenie Turnstile (localhost nie jest w allowliście klucza)
await page.fill(`${FORM} input[name="imie"]`, 'Anna');
await page.fill(`${FORM} textarea[name="wiadomosc"]`, 'Dzień dobry, proszę o kontakt.');
await page.check(`${FORM} input[name="zgoda"]`);
await page.waitForTimeout(300);
await page.locator(`${FORM} button[type=submit]`).click();
await page.waitForTimeout(1500);
zaloz((await niepusteBledy()).length === 0, 'salon opcjonalny — walidacja czysta');
const stan = (await page.locator(`${FORM} [data-stan]`).innerText()).trim();
console.log('stan po wysyłce bez tokenu:', JSON.stringify(stan));
zaloz(stan !== '', 'komunikat stanu po wysyłce jest widoczny');
zaloz(
  !(await page.locator(`${FORM} button[type=submit]`).isDisabled()),
  'przycisk odblokowany po nieudanej próbie',
);
console.log('żądania do margo:', zadaniaMargo.length ? zadaniaMargo : 'brak');

// 5) margo na stronie głównej; audyt zostaje na starej ścieżce
await page.goto(`${BASE}/`);
await page.waitForLoadState('load');
  await page.waitForTimeout(900);
zaloz((await page.locator(FORM).count()) === 1, 'formularz margo jest na stronie głównej');

await page.goto(`${BASE}/audyt/`);
await page.waitForLoadState('load');
  await page.waitForTimeout(900);
zaloz(
  (await page.locator('form[data-formularz]:not([data-margo])').count()) >= 1,
  'formularz audytu bez data-margo',
);

// zrzut formularza na telefonie
await page.goto(`${BASE}/kontakt/`);
await page.waitForLoadState('load');
  await page.waitForTimeout(900);
await page.locator(FORM).screenshot({ path: 'scripts/test-form-mobile.png' });

await browser.close();

console.log('błędy JS strony:', bledyJs.length ? bledyJs : 'brak');
// TurnstileError 110200 („domena niedozwolona") jest spodziewany na
// localhoście — klucz przepuszcza tylko connectiva.studio.
if (bledyJs.some((b) => !b.includes('challenges.cloudflare.com') && !b.includes('Turnstile'))) {
  console.error('FAIL: błąd JS poza skryptem Turnstile');
  process.exit(1);
}
console.log('PASS');
