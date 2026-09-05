/**
 * Wspólna obsługa formularzy (SPEC 7.5).
 *
 * Jedno miejsce dla wszystkich formularzy na stronie: audyt (Etap 4)
 * i kontakt (Etap 6). Walidacja po stronie przeglądarki z komunikatem pod
 * polem, honeypot, wysyłka do Web3Forms i stany inline bez przeładowania.
 *
 * Kolor nigdy nie jest jedynym nośnikiem błędu (SPEC 11.3): pole dostaje
 * `aria-invalid`, komunikat tekstowy i powiązanie przez `aria-describedby`.
 *
 * Czysty JS — bez GSAP i bez Lenis. Formularze muszą działać także wtedy,
 * gdy warstwa ruchu się nie załaduje (SPEC 8.4, DoD Etapu 4).
 */

const ENDPOINT = 'https://api.web3forms.com/submit';

/** Zdarzenie dla warstwy ruchu: układ się zmienił, przelicz ScrollTriggery. */
export const ZDARZENIE_UKLAD = 'uklad:zmiana';

export function ogloszZmianeUkladu(): void {
  document.dispatchEvent(new CustomEvent(ZDARZENIE_UKLAD));
}

/* -------------------------------------------------------------------------- */
/* Walidacja                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Sprowadza wpisany adres do pełnego URL-a.
 *
 * Przyjmuje wpis bez protokołu („twojsalon.pl") i dokleja `https://`.
 * Zwraca `null`, gdy to nie wygląda na adres strony.
 */
export function znormalizujUrl(wejscie: string): string | null {
  const tekst = wejscie.trim();
  if (tekst === '') return null;

  const zProtokolem = /^https?:\/\//i.test(tekst) ? tekst : `https://${tekst}`;

  let url: URL;
  try {
    url = new URL(zProtokolem);
  } catch {
    return null;
  }

  // Host musi mieć kropkę i końcówkę domeny. `URL` zamienia polskie znaki
  // na punycode, więc tutaj widzimy już same ASCII.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;

  return url.href;
}

/** Czy to wygląda na e-mail albo nazwę na Instagramie. */
export function poprawnyKontakt(wejscie: string): boolean {
  const tekst = wejscie.trim();
  if (tekst.length < 3) return false;
  // e-mail
  if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(tekst)) return true;
  // link do profilu
  if (/instagram\.com\/[^\s/]+/i.test(tekst)) return true;
  // @nazwa albo sama nazwa — bez spacji
  if (/^@?[\w.]{3,}$/.test(tekst)) return true;
  return false;
}

const KOMUNIKATY = {
  wymagane: 'To pole jest wymagane.',
  url: 'To nie wygląda na adres strony. Wpisz na przykład twojsalon.pl',
  kontakt:
    'Wpisz e-mail albo nazwę na Instagramie, żebyśmy wiedzieli, gdzie wysłać wideo.',
  zgoda: 'Bez zgody nie możemy się odezwać.',
};

/* -------------------------------------------------------------------------- */
/* Stan pola                                                                  */
/* -------------------------------------------------------------------------- */

function polePoBledzie(pole: HTMLElement, komunikat: string | null): void {
  const id = pole.getAttribute('aria-describedby');
  const miejsce = id ? document.getElementById(id) : null;

  if (komunikat) {
    pole.setAttribute('aria-invalid', 'true');
    if (miejsce) miejsce.textContent = komunikat;
  } else {
    pole.removeAttribute('aria-invalid');
    if (miejsce) miejsce.textContent = '';
  }
}

/**
 * Sprawdza jedno pole. Zwraca komunikat błędu albo `null`.
 * Reguła bierze się z atrybutu `data-waliduj`.
 */
function sprawdzPole(pole: HTMLInputElement): string | null {
  const regula = pole.dataset.waliduj;
  const wartosc = pole.value;

  if (regula === 'zgoda') return pole.checked ? null : KOMUNIKATY.zgoda;

  if (regula === 'url') {
    if (wartosc.trim() === '') return KOMUNIKATY.wymagane;
    return znormalizujUrl(wartosc) ? null : KOMUNIKATY.url;
  }

  if (regula === 'kontakt') {
    if (wartosc.trim() === '') return KOMUNIKATY.wymagane;
    return poprawnyKontakt(wartosc) ? null : KOMUNIKATY.kontakt;
  }

  if (regula === 'wymagane') {
    return wartosc.trim() === '' ? KOMUNIKATY.wymagane : null;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Wysyłka                                                                    */
/* -------------------------------------------------------------------------- */

function ustawStan(
  formularz: HTMLFormElement,
  stan: 'gotowy' | 'wysyla' | 'ok' | 'blad',
  komunikat = '',
): void {
  const wyjscie = formularz.querySelector<HTMLElement>('[data-stan]');
  const przycisk = formularz.querySelector<HTMLButtonElement>('[type="submit"]');

  formularz.dataset.stanWysylki = stan;
  if (przycisk) przycisk.disabled = stan === 'wysyla';
  if (wyjscie) wyjscie.textContent = komunikat;
}

/**
 * Chowanie dolnego paska, gdy na ekranie jest formularz (SPEC 7.3).
 *
 * Celowo `IntersectionObserver`, a nie ScrollTrigger: pasek ma schodzić
 * z drogi także przy `prefers-reduced-motion`, gdzie kontekst mobilny GSAP-a
 * w ogóle nie startuje. Obserwator radzi sobie też z tym, że formularz audytu
 * pojawia się dopiero po werdykcie — nie trzeba przeliczać geometrii.
 */
export function initPasekPrzyFormularzach(): () => void {
  const pasek = document.querySelector<HTMLElement>('[data-pasek]');
  const strefy = [...document.querySelectorAll<HTMLElement>('[data-chowa-pasek]')];
  if (!pasek || strefy.length === 0) return () => {};

  const widoczne = new Set<Element>();

  const obserwator = new IntersectionObserver(
    (wpisy) => {
      for (const wpis of wpisy) {
        if (wpis.isIntersecting) widoczne.add(wpis.target);
        else widoczne.delete(wpis.target);
      }
      pasek.classList.toggle('jest-schowany', widoczne.size > 0);
    },
    // Margines, żeby pasek schodził dopiero wtedy, gdy formularz naprawdę
    // jest w polu widzenia, a nie ledwie wystaje zza krawędzi.
    { rootMargin: '-15% 0px -25% 0px' },
  );

  for (const strefa of strefy) obserwator.observe(strefa);

  return () => {
    obserwator.disconnect();
    pasek.classList.remove('jest-schowany');
  };
}

export function initForms(): () => void {
  const formularze = [...document.querySelectorAll<HTMLFormElement>('[data-formularz]')];
  if (formularze.length === 0) return () => {};

  const sprzatanie: Array<() => void> = [];

  for (const formularz of formularze) {
    const pola = [...formularz.querySelectorAll<HTMLInputElement>('[data-waliduj]')];

    // Po pierwszej nieudanej próbie poprawiamy komunikat na bieżąco —
    // ale nie krzyczymy, zanim ktokolwiek spróbował wysłać.
    let probowano = false;
    const naZmiane = (e: Event) => {
      if (!probowano) return;
      const pole = e.target as HTMLInputElement;
      if (pole.dataset.waliduj) polePoBledzie(pole, sprawdzPole(pole));
    };
    formularz.addEventListener('input', naZmiane);
    formularz.addEventListener('change', naZmiane);

    const naWyslanie = async (e: Event) => {
      e.preventDefault();
      probowano = true;

      // Honeypot: wypełnia go tylko bot. Udajemy sukces i nic nie wysyłamy.
      const pulapka = formularz.querySelector<HTMLInputElement>('[data-honeypot]');
      if (pulapka && pulapka.value.trim() !== '') {
        ustawStan(formularz, 'ok', formularz.dataset.tekstOk ?? 'Wysłane.');
        return;
      }

      let pierwszyZly: HTMLInputElement | null = null;
      for (const pole of pola) {
        const blad = sprawdzPole(pole);
        polePoBledzie(pole, blad);
        if (blad && !pierwszyZly) pierwszyZly = pole;
      }

      if (pierwszyZly) {
        ustawStan(formularz, 'blad', '');
        pierwszyZly.focus();
        return;
      }

      // Adres strony wysyłamy w pełnej postaci, z protokołem.
      const poleUrl = formularz.querySelector<HTMLInputElement>('[data-waliduj="url"]');
      if (poleUrl) {
        const pelny = znormalizujUrl(poleUrl.value);
        if (pelny) poleUrl.value = pelny;
      }

      const klucz = formularz.dataset.klucz ?? '';
      if (klucz === '' || klucz.startsWith('TODO_')) {
        // Świadomie nie strzelamy do Web3Forms bez klucza — użytkowniczka
        // dostałaby mglisty błąd, a my nie wiedzielibyśmy dlaczego.
        ustawStan(
          formularz,
          'blad',
          'Formularz nie jest jeszcze podłączony: brakuje klucza Web3Forms. Uzupełnij pole web3formsKey w src/site.config.ts.',
        );
        return;
      }

      ustawStan(formularz, 'wysyla', 'Wysyłam…');

      try {
        const dane = new FormData(formularz);
        dane.set('access_key', klucz);

        const odpowiedz = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: dane,
        });

        if (!odpowiedz.ok) throw new Error(String(odpowiedz.status));

        ustawStan(formularz, 'ok', formularz.dataset.tekstOk ?? 'Wysłane.');
        formularz.querySelector<HTMLElement>('[data-pola]')?.setAttribute('hidden', '');
        ogloszZmianeUkladu();
      } catch {
        ustawStan(formularz, 'blad', formularz.dataset.tekstBlad ?? 'Nie udało się wysłać.');
      }
    };

    formularz.addEventListener('submit', naWyslanie);

    sprzatanie.push(() => {
      formularz.removeEventListener('submit', naWyslanie);
      formularz.removeEventListener('input', naZmiane);
      formularz.removeEventListener('change', naZmiane);
    });
  }

  return () => sprzatanie.splice(0).forEach((f) => f());
}
