/**
 * Obsługa akordeonów (SPEC 7.7).
 *
 * Bez GSAP — całe rozwijanie robi CSS (`grid-template-rows: 0fr → 1fr`),
 * więc akordeon działa tak samo przy ograniczonym ruchu, tylko bez przejścia.
 * Tutaj zostaje sam stan: `aria-expanded`, klasa i reguła „jeden otwarty
 * naraz" na wąskich ekranach.
 */

const WASKI_EKRAN = '(max-width: 1023px)';

export function initAccordions(): () => void {
  const grupy = [...document.querySelectorAll<HTMLElement>('[data-akordeon]')];
  if (grupy.length === 0) return () => {};

  const sprzatanie: Array<() => void> = [];
  const waski = window.matchMedia(WASKI_EKRAN);

  const pozycjeGrupy = (grupa: HTMLElement) =>
    [...grupa.querySelectorAll<HTMLElement>('[data-poz]')];

  function ustaw(poz: HTMLElement, otwarta: boolean): void {
    poz.classList.toggle('jest-otwarta', otwarta);
    poz
      .querySelector<HTMLButtonElement>('[data-przycisk]')
      ?.setAttribute('aria-expanded', String(otwarta));
  }

  for (const grupa of grupy) {
    const pozycje = pozycjeGrupy(grupa);

    const naKlik = (e: Event) => {
      const przycisk = (e.target as HTMLElement).closest<HTMLButtonElement>(
        '[data-przycisk]',
      );
      if (!przycisk) return;

      const poz = przycisk.closest<HTMLElement>('[data-poz]');
      if (!poz) return;

      const bylaOtwarta = poz.classList.contains('jest-otwarta');

      // Na wąskim ekranie otwarta jest najwyżej jedna pozycja (SPEC 7.7).
      // Na desktopie można mieć otwarte dowolnie wiele.
      if (!bylaOtwarta && waski.matches) {
        for (const inna of pozycje) if (inna !== poz) ustaw(inna, false);
      }

      ustaw(poz, !bylaOtwarta);
    };

    grupa.addEventListener('click', naKlik);
    sprzatanie.push(() => grupa.removeEventListener('click', naKlik));
  }

  // Po zwężeniu okna zostawiamy tylko pierwszą otwartą pozycję w grupie.
  const naZmianeSzerokosci = () => {
    if (!waski.matches) return;
    for (const grupa of grupy) {
      let juzOtwarta = false;
      for (const poz of pozycjeGrupy(grupa)) {
        if (!poz.classList.contains('jest-otwarta')) continue;
        if (juzOtwarta) ustaw(poz, false);
        juzOtwarta = true;
      }
    }
  };

  waski.addEventListener('change', naZmianeSzerokosci);
  sprzatanie.push(() => waski.removeEventListener('change', naZmianeSzerokosci));

  return () => sprzatanie.splice(0).forEach((f) => f());
}
