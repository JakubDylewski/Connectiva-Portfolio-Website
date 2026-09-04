/**
 * Przełącznik „Dla kogo" (SPEC 8.0, interakcja 1).
 *
 * Wybór segmentu ląduje jako `data-segment` na `<html>` i jest rozgłaszany
 * zdarzeniem, żeby kolejne miejsca mogły się podpiąć bez znajomości siebie
 * nawzajem: sekcja Projekty (Etap 2) i sprawdzarka miast (Etap 3, SPEC 8.3 —
 * „te same chipy, zsynchronizowane").
 *
 * Stan trzymamy wyłącznie w pamięci — bez localStorage (SPEC 8.0).
 */

export type Segment = 'salon' | 'kosmetologia' | 'klinika';

export const ZDARZENIE_SEGMENT = 'segment:zmiana';

/**
 * Prośba o przewinięcie do kotwicy. Warstwa ruchu przechwytuje ją i prowadzi
 * przez Lenis (wtedy woła `preventDefault()`); bez Lenis zostaje skok natywny.
 */
export const ZDARZENIE_PRZEWIN = 'przewin:do';

export interface PrzewinDetail {
  cel: string;
}

export interface SegmentDetail {
  segment: Segment;
  /** `true`, gdy zmiana wyszła od użytkowniczki (a nie z synchronizacji). */
  zDotkniecia: boolean;
}

/** Zapisuje segment na `<html>` i rozgłasza zmianę. */
export function ustawSegment(segment: Segment, zDotkniecia = false): void {
  document.documentElement.dataset.segment = segment;
  document.dispatchEvent(
    new CustomEvent<SegmentDetail>(ZDARZENIE_SEGMENT, {
      detail: { segment, zDotkniecia },
    }),
  );
}

/** Przewija do kotwicy — przez Lenis, jeśli warstwa ruchu jest aktywna. */
export function przewinDo(cel: string): void {
  const el = document.querySelector(cel);
  if (!el) return;

  const zdarzenie = new CustomEvent<PrzewinDetail>(ZDARZENIE_PRZEWIN, {
    detail: { cel },
    cancelable: true,
  });
  document.dispatchEvent(zdarzenie);

  if (!zdarzenie.defaultPrevented) el.scrollIntoView({ block: 'start' });
}

/**
 * Uruchamia wszystkie grupy chipów na stronie i trzyma je w zgodzie.
 * Zwraca funkcję sprzątającą.
 *
 * Klawiatura zgodnie ze wzorcem `radiogroup`: strzałki przesuwają zaznaczenie,
 * Home/End skaczą na skraje, Tab wchodzi i wychodzi z całej grupy.
 */
export function initSegmentChips(): () => void {
  const grupy = [...document.querySelectorAll<HTMLElement>('[data-chipy]')];
  if (grupy.length === 0) return () => {};

  const sprzatanie: Array<() => void> = [];

  const chipyGrupy = (grupa: HTMLElement) =>
    [...grupa.querySelectorAll<HTMLButtonElement>('[data-segment]')];

  /** Odświeża wygląd i ARIA wszystkich grup na podstawie stanu na `<html>`. */
  function odswiez(): void {
    const aktywny = document.documentElement.dataset.segment;
    for (const grupa of grupy) {
      const chipy = chipyGrupy(grupa);
      const jestZaznaczony = chipy.some((c) => c.dataset.segment === aktywny);
      chipy.forEach((chip, i) => {
        const wybrany = chip.dataset.segment === aktywny;
        chip.setAttribute('aria-checked', String(wybrany));
        // Roving tabindex: do grupy wchodzi się na zaznaczony chip, a gdy nic
        // nie jest zaznaczone — na pierwszy.
        chip.tabIndex = wybrany || (!jestZaznaczony && i === 0) ? 0 : -1;
      });
    }
  }

  for (const grupa of grupy) {
    const chipy = chipyGrupy(grupa);

    const naKlik = (e: Event) => {
      const chip = (e.target as HTMLElement).closest<HTMLButtonElement>(
        '[data-segment]',
      );
      if (!chip) return;
      ustawSegment(chip.dataset.segment as Segment, true);

      // Świadome dotknięcie przewija do sekcji Projekty (SPEC 8.0).
      // Sterowanie aktywnym projektem dochodzi w Etapie 2.
      const cel = grupa.dataset.przewin;
      if (cel) przewinDo(cel);
    };

    const naKlawisz = (e: KeyboardEvent) => {
      const chip = (e.target as HTMLElement).closest<HTMLButtonElement>(
        '[data-segment]',
      );
      if (!chip) return;

      const i = chipy.indexOf(chip);
      let cel: number | null = null;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') cel = (i + 1) % chipy.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        cel = (i - 1 + chipy.length) % chipy.length;
      else if (e.key === 'Home') cel = 0;
      else if (e.key === 'End') cel = chipy.length - 1;

      if (cel === null) return;
      e.preventDefault();
      // Strzałki zmieniają zaznaczenie, ale nie przewijają strony — przewinięcie
      // zostaje reakcją na świadome dotknięcie (kliknięcie, Enter, spacja).
      ustawSegment(chipy[cel].dataset.segment as Segment, false);
      chipy[cel].focus();
    };

    grupa.addEventListener('click', naKlik);
    grupa.addEventListener('keydown', naKlawisz);
    sprzatanie.push(() => {
      grupa.removeEventListener('click', naKlik);
      grupa.removeEventListener('keydown', naKlawisz);
    });
  }

  document.addEventListener(ZDARZENIE_SEGMENT, odswiez);
  sprzatanie.push(() => document.removeEventListener(ZDARZENIE_SEGMENT, odswiez));

  odswiez();

  return () => sprzatanie.splice(0).forEach((f) => f());
}
