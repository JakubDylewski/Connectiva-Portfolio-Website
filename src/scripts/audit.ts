/**
 * Audyt w 60 sekund (SPEC 8.4, interakcja 6).
 *
 * Jedno pytanie na ekranie, zmiana przez `opacity` w 200 ms, fokus przenoszony
 * na nowe pytanie. Werdykt liczony z liczby odpowiedzi „tak".
 *
 * CZYSTY JS — bez GSAP i bez Lenis (SPEC 8.4, DoD Etapu 4). Cały ruch to
 * jedna klasa i przejście w CSS, które przy `prefers-reduced-motion` skraca
 * się do zera.
 *
 * Bez skryptu widać wszystkie sześć pytań naraz i formularz pod nimi —
 * strona zostaje używalna, tylko traci prowadzenie za rękę.
 */
import {
  pytania,
  werdyktDla,
  type Odpowiedz,
} from '../data/audyt';
import { ogloszZmianeUkladu } from './forms';

const CZAS_ZMIANY = 200;

export function initAudit(): () => void {
  const widgety = [...document.querySelectorAll<HTMLElement>('[data-audyt]')];
  if (widgety.length === 0) return () => {};

  const sprzatanie: Array<() => void> = [];
  for (const widget of widgety) sprzatanie.push(uruchom(widget));
  return () => sprzatanie.splice(0).forEach((f) => f());
}

function uruchom(widget: HTMLElement): () => void {
  const kroki = [...widget.querySelectorAll<HTMLElement>('[data-krok]')];
  const kreski = [...widget.querySelectorAll<HTMLElement>('[data-kreska]')];
  const licznik = widget.querySelector<HTMLElement>('[data-licznik]');
  const panelPytan = widget.querySelector<HTMLElement>('[data-pytania]');
  const panelWerdyktu = widget.querySelector<HTMLElement>('[data-werdykt]');
  const tekstWerdyktu = widget.querySelector<HTMLElement>('[data-werdykt-tekst]');
  const listaBrakow = widget.querySelector<HTMLElement>('[data-braki]');
  const poleWyniku = widget.querySelector<HTMLInputElement>('[data-wynik-audytu]');
  const dalej = widget.querySelector<HTMLButtonElement>('[data-dalej]');
  const wstecz = widget.querySelector<HTMLButtonElement>('[data-wstecz]');
  const popraw = widget.querySelector<HTMLButtonElement>('[data-popraw]');

  if (kroki.length !== pytania.length || !panelPytan || !panelWerdyktu) {
    // Znaczniki rozjechały się z danymi. Zostawiamy widok bez skryptu —
    // wszystkie pytania naraz — ale głośno, bo to zawsze jest błąd.
    console.warn(
      `[audyt] oczekiwano ${pytania.length} kroków, znaleziono ${kroki.length}; widget zostaje bez prowadzenia`,
    );
    return () => {};
  }

  const odpowiedzi: Array<Odpowiedz | null> = pytania.map(() => null);
  let aktywny = 0;
  // Znacznik ostatniego dotknięcia wskaźnikiem. Strzałki na klawiaturze też
  // zmieniają zaznaczenie w grupie radio — gdyby przeskakiwały do kolejnego
  // pytania, nie dałoby się przejrzeć opcji.
  let ostatnieDotkniecie = 0;

  // Skrypt działa, więc przejmujemy prowadzenie: pokazujemy po jednym pytaniu.
  widget.dataset.tryb = 'krokowy';

  function pokazKrok(i: number, przenieFokus = true): void {
    aktywny = i;

    kroki.forEach((krok, j) => {
      const widoczny = j === i;
      krok.classList.toggle('jest-widoczny', widoczny);
      krok.hidden = !widoczny;
    });

    kreski.forEach((kreska, j) => {
      kreska.classList.toggle('jest-aktywna', j === i);
      kreska.classList.toggle('jest-wypelniona', odpowiedzi[j] !== null && j !== i);
    });

    if (licznik) licznik.textContent = `pytanie ${i + 1} z ${pytania.length}`;
    if (wstecz) wstecz.disabled = i === 0;
    if (dalej) {
      dalej.disabled = odpowiedzi[i] === null;
      // Podpis siedzi w `span` wewnątrz przycisku — nadpisanie `textContent`
      // całego przycisku zjadłoby ten wrapper razem ze stylami.
      const podpis = dalej.querySelector<HTMLElement>('.btn__tresc') ?? dalej;
      podpis.textContent = i === pytania.length - 1 ? 'Pokaż wynik' : 'Dalej';
    }

    // Fokus na nowym pytaniu (SPEC 10.3). Celujemy w `fieldset`, a nie
    // w pierwszy przycisk radio — czytnik przeczyta wtedy całe pytanie
    // z `legend`, zanim zacznie wyliczać odpowiedzi.
    if (przenieFokus) kroki[i].focus();
  }

  function policzTak(): number {
    return odpowiedzi.filter((o) => o === 'tak').length;
  }

  function pokazWerdykt(): void {
    const tak = policzTak();

    if (tekstWerdyktu) tekstWerdyktu.textContent = werdyktDla(tak);

    // Lista tylko tych punktów, na które padło „nie" albo „nie wiem".
    if (listaBrakow) {
      listaBrakow.replaceChildren();
      odpowiedzi.forEach((odp, i) => {
        if (odp === null || odp === 'tak') return;
        const li = document.createElement('li');
        li.className = 'audyt__brak';

        const pytanie = document.createElement('span');
        pytanie.className = 'audyt__brak-pytanie';
        pytanie.textContent = pytania[i].pytanie;

        const skutek = document.createElement('span');
        skutek.className = 'audyt__brak-skutek';
        skutek.textContent =
          odp === 'nie' ? pytania[i].konsekwencjaNie : pytania[i].konsekwencjaNieWiem;

        li.append(pytanie, skutek);
        listaBrakow.append(li);
      });
    }

    // Ukryte pole do maila — Jakub widzi, co zaznaczyła (SPEC 8.4).
    if (poleWyniku) {
      const zapis = pytania
        .map((p, i) => `${p.klucz}: ${odpowiedzi[i] === 'nie-wiem' ? 'nie wiem' : odpowiedzi[i]}`)
        .join('; ');
      poleWyniku.value = `${zapis} (${tak}/${pytania.length} na tak)`;
    }

    panelPytan!.hidden = true;
    panelWerdyktu!.hidden = false;
    panelWerdyktu!.classList.add('jest-widoczny');

    // Formularz właśnie się pojawił — pasek dolny i ScrollTriggery muszą
    // przeliczyć geometrię (SPEC 7.3, 10.2).
    ogloszZmianeUkladu();

    panelWerdyktu!.focus();
  }

  function wrocDoPytan(): void {
    panelWerdyktu!.hidden = true;
    panelWerdyktu!.classList.remove('jest-widoczny');
    panelPytan!.hidden = false;
    ogloszZmianeUkladu();
    pokazKrok(pytania.length - 1);
  }

  // --- zdarzenia -----------------------------------------------------------

  const naDotkniecie = () => {
    ostatnieDotkniecie = performance.now();
  };

  const naZmiane = (e: Event) => {
    const wejscie = e.target as HTMLInputElement;
    if (!wejscie.name?.startsWith('pytanie-')) return;

    const i = Number(wejscie.dataset.nr);
    odpowiedzi[i] = wejscie.value as Odpowiedz;
    if (dalej) dalej.disabled = false;
    kreski[i]?.classList.add('jest-wypelniona');

    // Wskaźnikiem: przechodzimy dalej sami. Klawiaturą: zostawiamy wybór,
    // bo strzałki służą do przeglądania opcji, a nie do zatwierdzania.
    const zeWskaznika = performance.now() - ostatnieDotkniecie < 600;
    if (!zeWskaznika) return;

    window.setTimeout(() => {
      if (i < pytania.length - 1) pokazKrok(i + 1);
      else pokazWerdykt();
    }, CZAS_ZMIANY);
  };

  const naDalej = () => {
    if (odpowiedzi[aktywny] === null) return;
    if (aktywny < pytania.length - 1) pokazKrok(aktywny + 1);
    else pokazWerdykt();
  };

  const naWstecz = () => {
    if (aktywny > 0) pokazKrok(aktywny - 1);
  };

  panelPytan.addEventListener('pointerdown', naDotkniecie);
  panelPytan.addEventListener('change', naZmiane);
  dalej?.addEventListener('click', naDalej);
  wstecz?.addEventListener('click', naWstecz);
  popraw?.addEventListener('click', wrocDoPytan);

  pokazKrok(0, false);

  return () => {
    panelPytan.removeEventListener('pointerdown', naDotkniecie);
    panelPytan.removeEventListener('change', naZmiane);
    dalej?.removeEventListener('click', naDalej);
    wstecz?.removeEventListener('click', naWstecz);
    popraw?.removeEventListener('click', wrocDoPytan);
    delete widget.dataset.tryb;
  };
}
