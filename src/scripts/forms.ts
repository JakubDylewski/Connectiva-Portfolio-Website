/**
 * Wspólna obsługa formularzy (SPEC 7.5).
 *
 * Jedno miejsce dla wszystkich formularzy na stronie: audyt (Etap 4)
 * i kontakt (Etap 6). Walidacja po stronie przeglądarki z komunikatem pod
 * polem, honeypot i stany inline bez przeładowania.
 *
 * Wysyłka ma dwie ścieżki (SPEC 17.16): formularz kontaktowy idzie JSON-em
 * do Margo (asystent, `data-margo` na formularzu) z tokenem Cloudflare
 * Turnstile, a audyt i kreator — jak dotąd do Web3Forms (`data-klucz`).
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

/** Czy to wygląda na numer telefonu — z kierunkowym lub bez. */
export function poprawnyTelefon(wejscie: string): boolean {
  const cyfry = wejscie.replace(/[\s\-().]/g, '');
  return /^\+?\d{7,15}$/.test(cyfry);
}

const KOMUNIKATY = {
  wymagane: 'To pole jest wymagane.',
  url: 'To nie wygląda na adres strony. Wpisz na przykład twojsalon.pl',
  kontakt:
    'Wpisz e-mail albo nazwę na Instagramie, żebyśmy wiedzieli, gdzie wysłać wideo.',
  kontaktTel:
    'Wpisz telefon, e-mail albo nazwę na Instagramie — tak się do Ciebie odezwę.',
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

  // Formularz kontaktowy przyjmuje też telefon (SPEC 17.16) — audyt i kreator
  // zostają przy regule `kontakt`, bo tam odpowiedź wraca mailem albo na IG.
  if (regula === 'kontakt-tel') {
    if (wartosc.trim() === '') return KOMUNIKATY.wymagane;
    return poprawnyKontakt(wartosc) || poprawnyTelefon(wartosc)
      ? null
      : KOMUNIKATY.kontaktTel;
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
  /** Adres zapasowy — dokleja do komunikatu klikalny `mailto:`. */
  mailZapas = '',
): void {
  const wyjscie = formularz.querySelector<HTMLElement>('[data-stan]');
  const przycisk = formularz.querySelector<HTMLButtonElement>('[type="submit"]');

  formularz.dataset.stanWysylki = stan;
  if (przycisk) przycisk.disabled = stan === 'wysyla';
  if (!wyjscie) return;

  wyjscie.textContent = komunikat;
  if (mailZapas === '') return;

  // Odnośnik budujemy elementami, nie przez innerHTML — adres przychodzi
  // z atrybutu data i nie ma prawa stać się wstrzykniętym znacznikiem.
  const odnosnik = document.createElement('a');
  odnosnik.className = 'link';
  odnosnik.href = `mailto:${mailZapas}`;
  odnosnik.textContent = mailZapas;
  wyjscie.append(' Napisz na ', odnosnik, '.');
}

/* -------------------------------------------------------------------------- */
/* Margo + Cloudflare Turnstile (formularz kontaktowy, SPEC 17.16)            */
/* -------------------------------------------------------------------------- */

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, opcje: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

const TURNSTILE_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let ladowanieTurnstile: Promise<void> | null = null;

/**
 * Dokłada skrypt Turnstile raz na wizytę. ClientRouter nie wymienia kontekstu
 * JS między stronami, więc `window.turnstile` przeżywa nawigacje — sprawdzamy
 * go przed kolejną próbą ładowania.
 */
function zaladujTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  ladowanieTurnstile ??= new Promise((resolve, reject) => {
    const skrypt = document.createElement('script');
    skrypt.src = TURNSTILE_SRC;
    skrypt.async = true;
    skrypt.onload = () => resolve();
    skrypt.onerror = () => {
      // Nieudane ładowanie nie może zablokować widżetu na zawsze —
      // następna inicjalizacja (np. po powrocie sieci) próbuje od nowa.
      ladowanieTurnstile = null;
      skrypt.remove();
      reject(new Error('turnstile'));
    };
    document.head.append(skrypt);
  });
  return ladowanieTurnstile;
}

/** Stan widżetu na formularzu. `id` pojawia się dopiero po załadowaniu API. */
interface StanWidgetu {
  id?: string;
  usuniety?: boolean;
}

const MARGO_TEKSTY = {
  ok: 'Dzięki! Odezwę się najpóźniej w ciągu 24 h.',
  pola:
    'Coś się nie zgadza w polach formularza. Sprawdź imię, kontakt i treść wiadomości, potem spróbuj jeszcze raz.',
  limit: 'Za dużo prób w krótkim czasie — spróbuj za chwilę.',
  weryfikacja:
    'Nie udało się potwierdzić, że zgłoszenie wysyła człowiek. Przepraszam za kłopot — spróbuj jeszcze raz.',
  wylaczony: 'Formularz jest chwilowo wyłączony. Przepraszam za kłopot.',
  siec: 'Nie udało się wysłać. Przepraszam za kłopot — spróbuj za chwilę.',
  tokenCzeka:
    'Zabezpieczenie formularza jeszcze się ładuje — odczekaj sekundę i spróbuj ponownie.',
};

/** Limity długości pól z kontraktu Margo — przycinamy też po stronie klienta. */
const MARGO_LIMITY = { imie: 80, salon: 120, kontakt: 160, wiadomosc: 2000 } as const;

async function wyslijDoMargo(
  formularz: HTMLFormElement,
  stanWidgetu: StanWidgetu | undefined,
): Promise<void> {
  const mailZapas = formularz.dataset.mailZapas ?? '';

  // Widżet nie wstał (zablokowany skrypt, brak sieci) — nie mamy jak zdobyć
  // tokenu, więc od razu podajemy zapasową drogę kontaktu.
  if (!window.turnstile || stanWidgetu?.id === undefined) {
    ustawStan(formularz, 'blad', MARGO_TEKSTY.siec, mailZapas);
    return;
  }

  const token = window.turnstile.getResponse(stanWidgetu.id) ?? '';
  if (token === '') {
    ustawStan(formularz, 'blad', MARGO_TEKSTY.tokenCzeka);
    return;
  }

  ustawStan(formularz, 'wysyla', 'Wysyłam…');

  const pole = (nazwa: keyof typeof MARGO_LIMITY) => {
    const element = formularz.elements.namedItem(nazwa) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    return (element?.value ?? '').trim().slice(0, MARGO_LIMITY[nazwa]);
  };

  try {
    const odpowiedz = await fetch(formularz.dataset.margo ?? '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imie: pole('imie'),
        salon: pole('salon'),
        kontakt: pole('kontakt'),
        wiadomosc: pole('wiadomosc'),
        // Pułapka serwerowa — człowiek zostawia ją pustą, a bota wysyłającego
        // POST bez przeglądarki odsiewa Margo.
        www: '',
        'cf-turnstile-response': token,
      }),
    });

    if (odpowiedz.ok) {
      ustawStan(formularz, 'ok', formularz.dataset.tekstOk ?? MARGO_TEKSTY.ok);
      formularz.querySelector<HTMLElement>('[data-pola]')?.setAttribute('hidden', '');
      ogloszZmianeUkladu();
      return;
    }

    // Token Turnstile jest jednorazowy — po każdej odmowie serwera musi
    // powstać nowy, inaczej ponowna próba zawsze skończy się 403.
    window.turnstile.reset(stanWidgetu.id);

    if (odpowiedz.status === 422) {
      ustawStan(formularz, 'blad', MARGO_TEKSTY.pola);
    } else if (odpowiedz.status === 429) {
      ustawStan(formularz, 'blad', MARGO_TEKSTY.limit);
    } else if (odpowiedz.status === 403) {
      ustawStan(formularz, 'blad', MARGO_TEKSTY.weryfikacja, mailZapas);
    } else if (odpowiedz.status === 503) {
      ustawStan(formularz, 'blad', MARGO_TEKSTY.wylaczony, mailZapas);
    } else {
      ustawStan(formularz, 'blad', MARGO_TEKSTY.siec, mailZapas);
    }
  } catch {
    window.turnstile?.reset(stanWidgetu.id);
    ustawStan(formularz, 'blad', MARGO_TEKSTY.siec, mailZapas);
  }
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

  /** Widżety Turnstile żyjące na tej stronie — po jednym na formularz Margo. */
  const widgety = new WeakMap<HTMLFormElement, StanWidgetu>();

  for (const formularz of formularze) {
    const pola = [...formularz.querySelectorAll<HTMLInputElement>('[data-waliduj]')];

    // Formularz Margo dostaje widżet Turnstile od razu — challenge w trybie
    // zarządzanym potrzebuje chwili, zanim wystawi token do wysyłki.
    const kontenerTurnstile = formularz.querySelector<HTMLElement>('[data-turnstile]');
    if (formularz.dataset.margo && kontenerTurnstile && formularz.dataset.sitekey) {
      const stanWidgetu: StanWidgetu = {};
      widgety.set(formularz, stanWidgetu);

      void zaladujTurnstile()
        .then(() => {
          // Nawigacja mogła zdjąć stronę, zanim skrypt doszedł.
          if (stanWidgetu.usuniety || !window.turnstile) return;
          stanWidgetu.id = window.turnstile.render(kontenerTurnstile, {
            sitekey: formularz.dataset.sitekey,
            theme: 'dark',
            language: 'pl',
            size: 'flexible',
          });
        })
        .catch(() => {
          // Brak widżetu zgłosi się przy próbie wysyłki — z adresem zapasowym.
        });

      sprzatanie.push(() => {
        stanWidgetu.usuniety = true;
        if (stanWidgetu.id !== undefined) window.turnstile?.remove(stanWidgetu.id);
      });
    }

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

      // Jedna wysyłka na raz — przycisk jest zablokowany, ale Enter
      // w polu tekstowym omija przycisk.
      if (formularz.dataset.stanWysylki === 'wysyla') return;

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

      // Formularz kontaktowy idzie własną ścieżką do Margo (SPEC 17.16).
      if (formularz.dataset.margo) {
        await wyslijDoMargo(formularz, widgety.get(formularz));
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
