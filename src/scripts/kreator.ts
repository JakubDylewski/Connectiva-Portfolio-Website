/**
 * Kreator wyceny (SPEC 17.4) — logika kroków, widełek i ekranu wyniku.
 *
 * CZYSTY JS — bez GSAP i bez Lenis. Zmiana kroku i schodki postępu to
 * przełączanie klas; ruch robi CSS i sam znika przy ograniczonym ruchu.
 * Tween liczby (300 ms) to jedna pętla `requestAnimationFrame`, przy
 * `prefers-reduced-motion: reduce` wartość wpisuje się od razu (SPEC 10.1).
 *
 * Wysyłką formularza zajmuje się wspólny `forms.ts` — tu tylko uzupełniamy
 * ukryte pola: odpowiedzi 1–6, uwagi i wyliczone widełki (SPEC 17.4).
 */
import {
  pytania,
  policzWidelki,
  zbudujSklad,
  type KluczPytania,
  type Widelki,
} from '../data/kreator';
import { ogloszZmianeUkladu } from './forms';

// Zmianę kroku (opacity 200 ms) robi w całości CSS — tu tylko tween liczby.
const CZAS_TWEENA = 300;

/** Zapis kwoty po polsku: tysiące rozdzielone twardą spacją (SPEC 5). */
export function zlotowki(kwota: number): string {
  return Math.round(kwota)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

/** Widełki jako tekst, z półpauzą (SPEC 5): „8 500–11 500". */
export function tekstWidelek(w: Widelki): string {
  return `${zlotowki(w.dol)}–${zlotowki(w.gora)}`;
}

function ograniczonyRuch(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Licznik widełek z tweenem: obie granice jadą do celu w jednej pętli rAF,
 * tekst składany na bieżąco. Bezpiecznik czasowy dopina wartość docelową,
 * gdyby karta była w tle i klatki nie leciały (lekcja ze starego cennika).
 */
function zrobLicznikWidelek(cel: HTMLElement) {
  let pokazywane: Widelki | null = null;
  let klatka = 0;
  let dopiecie = 0;

  const wypisz = (w: Widelki) => {
    cel.textContent = tekstWidelek(w);
  };

  return (nowe: Widelki) => {
    cancelAnimationFrame(klatka);
    clearTimeout(dopiecie);

    dopiecie = window.setTimeout(() => {
      if (
        !pokazywane ||
        pokazywane.dol !== nowe.dol ||
        pokazywane.gora !== nowe.gora
      ) {
        pokazywane = { ...nowe };
        wypisz(nowe);
      }
    }, CZAS_TWEENA + 50);

    // Pierwsze pokazanie i ograniczony ruch: bez tweena (SPEC 17.4).
    if (!pokazywane || ograniczonyRuch()) {
      pokazywane = { ...nowe };
      wypisz(nowe);
      return;
    }

    const start = { ...pokazywane };
    if (start.dol === nowe.dol && start.gora === nowe.gora) return;

    const t0 = performance.now();
    const krok = (teraz: number) => {
      const p = Math.min(1, (teraz - t0) / CZAS_TWEENA);
      // power2.out — spokojne dojście do wartości, bez odbicia
      const e = 1 - (1 - p) ** 3;
      pokazywane = {
        dol: start.dol + (nowe.dol - start.dol) * e,
        gora: start.gora + (nowe.gora - start.gora) * e,
      };
      wypisz(pokazywane);
      if (p < 1) klatka = requestAnimationFrame(krok);
      else {
        pokazywane = { ...nowe };
        wypisz(nowe);
      }
    };
    klatka = requestAnimationFrame(krok);
  };
}

export function initKreator(): () => void {
  const widgety = [...document.querySelectorAll<HTMLElement>('[data-kreator]')];
  if (widgety.length === 0) return () => {};

  const sprzatanie: Array<() => void> = [];
  for (const widget of widgety) sprzatanie.push(uruchom(widget));
  return () => sprzatanie.splice(0).forEach((f) => f());
}

function uruchom(widget: HTMLElement): () => void {
  const kroki = [...widget.querySelectorAll<HTMLElement>('[data-krok-k]')];
  const schodki = [...widget.querySelectorAll<HTMLElement>('[data-schodek]')];
  const lacza = [...widget.querySelectorAll<HTMLElement>('[data-schodek-lacze]')];
  const licznik = widget.querySelector<HTMLElement>('[data-kreator-licznik]');
  const panelKrokow = widget.querySelector<HTMLElement>('[data-kreator-kroki]');
  const panelWyniku = widget.querySelector<HTMLElement>('[data-kreator-wynik]');
  const dalej = widget.querySelector<HTMLButtonElement>('[data-dalej]');
  const wstecz = widget.querySelector<HTMLButtonElement>('[data-wstecz]');
  const zmien = widget.querySelector<HTMLButtonElement>('[data-zmien]');
  const uwagi = widget.querySelector<HTMLTextAreaElement>('[data-uwagi]');

  const biezaca = widget.querySelector<HTMLElement>('[data-biezaca]');
  const biezacaKwota = widget.querySelector<HTMLElement>('[data-biezaca-kwota]');
  const kwotaWyniku = widget.querySelector<HTMLElement>('[data-kwota-widelki]');
  const listaSkladu = widget.querySelector<HTMLElement>('[data-sklad]');

  const poleOdpowiedzi = widget.querySelector<HTMLInputElement>('[data-pole-odpowiedzi]');
  const poleUwag = widget.querySelector<HTMLInputElement>('[data-pole-uwagi]');
  const poleWidelek = widget.querySelector<HTMLInputElement>('[data-pole-widelki]');

  // 6 pytań + krok uwag. Rozjazd znaczników z danymi to zawsze błąd —
  // zostawiamy widok bez prowadzenia (wszystkie pytania naraz), ale głośno.
  if (kroki.length !== pytania.length + 1 || !panelKrokow || !panelWyniku) {
    console.warn(
      `[kreator] oczekiwano ${pytania.length + 1} kroków, znaleziono ${kroki.length}; widget zostaje bez prowadzenia`,
    );
    return () => {};
  }

  const odpowiedzi: Partial<Record<KluczPytania, string>> = {};
  let aktywny = 0;

  const ustawBiezaca = biezacaKwota ? zrobLicznikWidelek(biezacaKwota) : null;
  const ustawWynik = kwotaWyniku ? zrobLicznikWidelek(kwotaWyniku) : null;

  // Skrypt działa, więc przejmujemy prowadzenie: po jednym kroku naraz.
  widget.dataset.tryb = 'krokowy';

  /** Schodki postępu: wypełnione segmenty do bieżącego kroku włącznie. */
  function wypelnijSchodki(doKroku: number): void {
    schodki.forEach((s, j) => s.classList.toggle('jest-wypelniony', j <= doKroku));
    for (const l of lacza) {
      const j = Number(l.dataset.schodekLacze);
      l.classList.toggle('jest-wypelniony', j <= doKroku);
    }
  }

  /** Bieżące widełki pod krokiem — dopiero gdy znana jest baza (rozmiar). */
  function odswiezBiezaca(): void {
    if (!biezaca || !ustawBiezaca) return;
    const w = policzWidelki(odpowiedzi);
    if (!w) {
      biezaca.hidden = true;
      return;
    }
    biezaca.hidden = false;
    ustawBiezaca(w);
  }

  function czyKrokUwag(i: number): boolean {
    return i === kroki.length - 1;
  }

  function odpowiedziano(i: number): boolean {
    if (czyKrokUwag(i)) return true;
    return Boolean(odpowiedzi[pytania[i].klucz]);
  }

  function pokazKrok(i: number, przenieFokus = true): void {
    aktywny = i;

    kroki.forEach((krok, j) => {
      const widoczny = j === i;
      krok.classList.toggle('jest-widoczny', widoczny);
      krok.hidden = !widoczny;
    });

    wypelnijSchodki(i);

    if (licznik) licznik.textContent = `krok ${i + 1} z\u00A0${kroki.length}`;
    if (wstecz) wstecz.disabled = i === 0;
    if (dalej) {
      dalej.disabled = !odpowiedziano(i);
      const podpis = dalej.querySelector<HTMLElement>('.btn__tresc') ?? dalej;
      podpis.textContent = czyKrokUwag(i) ? 'Pokaż wycenę' : 'Dalej';
    }

    if (przenieFokus) kroki[i].focus();
  }

  function pokazWynik(): void {
    const w = policzWidelki(odpowiedzi);
    // Nie powinno się zdarzyć — „Dalej" pilnuje kompletu odpowiedzi.
    if (!w) return;

    if (ustawWynik) ustawWynik(w);

    if (listaSkladu) {
      listaSkladu.replaceChildren();
      for (const pozycja of zbudujSklad(odpowiedzi)) {
        const li = document.createElement('li');
        li.textContent = pozycja;
        listaSkladu.append(li);
      }
    }

    // Ukryte pola do maila (SPEC 17.4): odpowiedzi po ludzku, uwagi, widełki.
    if (poleOdpowiedzi) {
      poleOdpowiedzi.value = pytania
        .map((p) => {
          const wybor = p.opcje.find((o) => o.klucz === odpowiedzi[p.klucz]);
          return `${p.pytanie} ${wybor?.etykieta ?? '—'}`;
        })
        .join('; ');
    }
    if (poleUwag) poleUwag.value = uwagi?.value.trim() ?? '';
    if (poleWidelek) poleWidelek.value = `${tekstWidelek(w)} zł`;

    panelKrokow!.hidden = true;
    panelWyniku!.hidden = false;
    panelWyniku!.classList.add('jest-widoczny');
    wypelnijSchodki(kroki.length - 1);

    // Formularz właśnie się pojawił — pasek dolny i ScrollTriggery muszą
    // przeliczyć geometrię (SPEC 7.3, 10.2).
    ogloszZmianeUkladu();

    panelWyniku!.focus();
  }

  function wrocDoKrokow(): void {
    panelWyniku!.hidden = true;
    panelWyniku!.classList.remove('jest-widoczny');
    panelKrokow!.hidden = false;
    ogloszZmianeUkladu();
    pokazKrok(kroki.length - 1);
  }

  // --- zdarzenia -----------------------------------------------------------

  const naZmiane = (e: Event) => {
    const wejscie = e.target as HTMLInputElement;
    const pytanie = wejscie.dataset.pytanie as KluczPytania | undefined;
    if (!pytanie) return;

    odpowiedzi[pytanie] = wejscie.value;
    if (dalej) dalej.disabled = false;
    // Po każdym kliknięciu widać, jak wybór ruszył cenę (17.4).
    odswiezBiezaca();
  };

  const naDalej = () => {
    if (!odpowiedziano(aktywny)) return;
    if (czyKrokUwag(aktywny)) pokazWynik();
    else pokazKrok(aktywny + 1);
  };

  const naWstecz = () => {
    if (aktywny > 0) pokazKrok(aktywny - 1);
  };

  panelKrokow.addEventListener('change', naZmiane);
  dalej?.addEventListener('click', naDalej);
  wstecz?.addEventListener('click', naWstecz);
  zmien?.addEventListener('click', wrocDoKrokow);

  pokazKrok(0, false);

  return () => {
    panelKrokow.removeEventListener('change', naZmiane);
    dalej?.removeEventListener('click', naDalej);
    wstecz?.removeEventListener('click', naWstecz);
    zmien?.removeEventListener('click', wrocDoKrokow);
    delete widget.dataset.tryb;
  };
}
