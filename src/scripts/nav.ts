/**
 * Menu pełnoekranowe na mobile (SPEC 7.2).
 *
 * Celowo bez GSAP: menu musi działać także przy `prefers-reduced-motion:
 * reduce`, kiedy warstwa ruchu nie ładuje Lenis i nie animuje niczego.
 * Ruch (fade 200 ms) robi CSS i sam się wyłącza przy ograniczonym ruchu.
 *
 * Zamykanie: przycisk „Zamknij", Esc, kliknięcie w link (SPEC 7.2).
 * Pułapka fokusu trzyma Tab wewnątrz menu; po zamknięciu fokus wraca na
 * przycisk, który menu otworzył.
 */

/** Rozgłaszane, żeby warstwa ruchu mogła zatrzymać Lenis na czas menu. */
export const ZDARZENIE_MENU = 'menu:zmiana';

export interface MenuDetail {
  otwarte: boolean;
}

const FOKUSOWALNE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initNav(): () => void {
  const przyciskMoze = document.querySelector<HTMLButtonElement>('[data-menu-otworz]');
  const menuMoze = document.querySelector<HTMLElement>('[data-menu]');
  if (!przyciskMoze || !menuMoze) return () => {};

  // Przepisujemy na osobne stałe: deklaracje `function` poniżej są wynoszone
  // ponad ten warunek, więc TypeScript nie utrzymałby w nich zawężenia typu.
  const otworzBtn = przyciskMoze;
  const menu = menuMoze;

  let poprzedniFokus: HTMLElement | null = null;
  let otwarte = false;

  const doFokusu = () =>
    [...menu.querySelectorAll<HTMLElement>(FOKUSOWALNE)].filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
    );

  function rozglos(): void {
    document.dispatchEvent(
      new CustomEvent<MenuDetail>(ZDARZENIE_MENU, { detail: { otwarte } }),
    );
  }

  function otworz(): void {
    if (otwarte) return;
    otwarte = true;
    poprzedniFokus = document.activeElement as HTMLElement | null;

    menu.hidden = false;
    // Wymuszony reflow, żeby przeglądarka zauważyła zmianę `hidden` i przejście
    // CSS miało od czego zacząć. Synchronicznie, a nie przez rAF: w karcie
    // w tle klatki nie lecą i menu zostałoby otwarte, ale niewidoczne.
    void menu.offsetHeight;
    menu.classList.add('jest-otwarte');

    otworzBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-otwarte');

    doFokusu()[0]?.focus();
    rozglos();
  }

  function zamknij(przywrocFokus = true): void {
    if (!otwarte) return;
    otwarte = false;

    menu.classList.remove('jest-otwarte');
    otworzBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-otwarte');

    const schowaj = () => {
      if (!otwarte) menu.hidden = true;
    };
    // Poczekaj na koniec przejścia, ale nie zawiśnij, gdyby go nie było
    // (ograniczony ruch skraca przejścia do zera).
    menu.addEventListener('transitionend', schowaj, { once: true });
    window.setTimeout(schowaj, 260);

    // Fokus wraca tam, skąd przyszedł. Gdyby nie było dokąd wracać (menu
    // otwarto programowo albo element zniknął), lądujemy na przycisku „Menu" —
    // nigdy na `body`, bo to gubi miejsce w kolejności tabulacji.
    if (przywrocFokus) {
      const cel =
        poprzedniFokus && poprzedniFokus.isConnected && poprzedniFokus !== document.body
          ? poprzedniFokus
          : otworzBtn;
      cel.focus();
    }
    rozglos();
  }

  function naKlawisz(e: KeyboardEvent): void {
    if (!otwarte) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      zamknij();
      return;
    }

    if (e.key !== 'Tab') return;

    const lista = doFokusu();
    if (lista.length === 0) return;

    const pierwszy = lista[0];
    const ostatni = lista[lista.length - 1];
    const teraz = document.activeElement;

    if (e.shiftKey && (teraz === pierwszy || !menu.contains(teraz))) {
      e.preventDefault();
      ostatni.focus();
    } else if (!e.shiftKey && (teraz === ostatni || !menu.contains(teraz))) {
      e.preventDefault();
      pierwszy.focus();
    }
  }

  function naKlikWMenu(e: Event): void {
    const el = e.target as HTMLElement;
    if (el.closest('[data-menu-zamknij]')) {
      zamknij();
      return;
    }
    // Kliknięcie w link zamyka menu, ale fokus zostawiamy tam, gdzie zabrał
    // go odnośnik — inaczej wracałby na przycisk „Menu" i gubił kontekst.
    if (el.closest('a[href]')) zamknij(false);
  }

  otworzBtn.addEventListener('click', otworz);
  menu.addEventListener('click', naKlikWMenu);
  document.addEventListener('keydown', naKlawisz);

  return () => {
    otworzBtn.removeEventListener('click', otworz);
    menu.removeEventListener('click', naKlikWMenu);
    document.removeEventListener('keydown', naKlawisz);
    document.documentElement.classList.remove('menu-otwarte');
  };
}
