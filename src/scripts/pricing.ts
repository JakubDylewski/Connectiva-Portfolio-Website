/**
 * Konfigurator ceny (SPEC 8.6, interakcja 8).
 *
 * Liczba tweenuje do nowej wartości przez 300 ms. To jedyny rodzaj ruchu,
 * który wolno wywołać samemu z siebie poza sekwencją hero, bo odpowiada
 * na dotyk (SPEC 8.6, 10.2).
 *
 * Przy `prefers-reduced-motion: reduce` wartość ustawia się od razu, bez
 * tweena (SPEC 10.1). Bez GSAP — wystarczy jedna pętla `requestAnimationFrame`.
 */

const CZAS_TWEENA = 300;

/** Zapis kwoty po polsku: tysiące rozdzielone twardą spacją (SPEC 5). */
export function zlotowki(kwota: number): string {
  return Math.round(kwota)
    .toString()
    // Twarda spacja (U+00A0) jako escape — przy zwykłej spacji kwota
    // mogłaby się złamać na końcu wiersza (SPEC 5).
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

function ograniczonyRuch(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initPricing(): () => void {
  const konfiguratory = [...document.querySelectorAll<HTMLElement>('[data-cennik]')];
  if (konfiguratory.length === 0) return () => {};

  const sprzatanie: Array<() => void> = [];
  for (const k of konfiguratory) sprzatanie.push(uruchom(k));
  return () => sprzatanie.splice(0).forEach((f) => f());
}

function uruchom(root: HTMLElement): () => void {
  const wyswietlacz = root.querySelector<HTMLElement>('[data-kwota]');
  const przelaczniki = [...root.querySelectorAll<HTMLInputElement>('[data-kwota-opcji]')];
  const baza = Number(root.dataset.baza ?? '0');
  const gorna = Number(root.dataset.gorna ?? '0');

  if (!wyswietlacz || przelaczniki.length === 0 || !baza) return () => {};

  let pokazywana = baza;
  let klatka = 0;
  let dopiecie = 0;

  function docelowa(): number {
    const dodatki = przelaczniki
      .filter((p) => p.checked)
      .reduce((suma, p) => suma + Number(p.dataset.kwotaOpcji ?? '0'), 0);
    // Kwota nigdy nie wychodzi poza widełki (SPEC 8.6, DoD Etapu 5).
    return Math.min(gorna, Math.max(baza, baza + dodatki));
  }

  function wypisz(kwota: number): void {
    wyswietlacz!.textContent = zlotowki(kwota);
  }

  function doWartosci(cel: number): void {
    cancelAnimationFrame(klatka);
    clearTimeout(dopiecie);

    // Bezpiecznik: w karcie w tle klatki nie lecą, więc tween nigdy by się nie
    // domknął i na ekranie zostałaby kwota niezgodna z zaznaczeniami. Po czasie
    // trwania tweena wpisujemy wartość docelową niezależnie od klatek.
    dopiecie = window.setTimeout(() => {
      if (pokazywana !== cel) {
        pokazywana = cel;
        wypisz(cel);
      }
    }, CZAS_TWEENA + 50);

    if (ograniczonyRuch()) {
      pokazywana = cel;
      wypisz(cel);
      return;
    }

    const start = pokazywana;
    const roznica = cel - start;
    if (roznica === 0) return;

    const t0 = performance.now();
    const krok = (teraz: number) => {
      const p = Math.min(1, (teraz - t0) / CZAS_TWEENA);
      // power2.out — spokojne dojście do wartości, bez odbicia
      const e = 1 - (1 - p) ** 3;
      pokazywana = start + roznica * e;
      wypisz(pokazywana);
      if (p < 1) klatka = requestAnimationFrame(krok);
      else {
        pokazywana = cel;
        wypisz(cel);
      }
    };
    klatka = requestAnimationFrame(krok);
  }

  const naZmiane = () => doWartosci(docelowa());

  for (const p of przelaczniki) p.addEventListener('change', naZmiane);

  // Stan startowy bez tweena — wartość jest już w HTML-u, tu tylko synchronizacja
  // na wypadek, gdyby przeglądarka przywróciła zaznaczenia po odświeżeniu.
  pokazywana = docelowa();
  wypisz(pokazywana);

  return () => {
    cancelAnimationFrame(klatka);
    clearTimeout(dopiecie);
    for (const p of przelaczniki) p.removeEventListener('change', naZmiane);
  };
}
