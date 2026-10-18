/**
 * Wspólna obsługa formularzy (SPEC 7.5).
 *
 * Jedno miejsce dla wszystkich formularzy na stronie: audyt (Etap 4)
 * i kontakt (Etap 6). Walidacja po stronie przeglądarki z komunikatem pod
 * polem, honeypot i stany inline bez przeładowania.
 *
 * Wysyłka (SPEC 17.16–17.17): wszystkie trzy formularze idą JSON-em do Margo
 * (`data-margo` na formularzu) z tokenem Cloudflare Turnstile. Audyt
 * i kreator doklejają swoje dodatkowe pola do nagłówka wiadomości
 * (`data-margo-zrodlo` + `data-margo-info`), np. „[AUDYT] Strona: … | …".
 *
 * Kolor nigdy nie jest jedynym nośnikiem błędu (SPEC 11.3): pole dostaje
 * `aria-invalid`, komunikat tekstowy i powiązanie przez `aria-describedby`.
 *
 * Czysty JS — bez GSAP i bez Lenis. Formularze muszą działać także wtedy,
 * gdy warstwa ruchu się nie załaduje (SPEC 8.4, DoD Etapu 4).
 */

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
/* Margo + Cloudflare Turnstile (wszystkie formularze, SPEC 17.16–17.18)      */
/* -------------------------------------------------------------------------- */

/**
 * Rewizja kontraktu wysyłki — stoi w `data-margo-rewizja` formularzy i tutaj.
 *
 * Po wdrożeniu nowej wersji strony otwarta karta potrafi trzymać dwa
 * pokolenia tego modułu naraz: ClientRouter podmienia HTML, ale nie wyrzuca
 * starego JS (incydent z 18.10.2026 — SPEC 17.18: stary moduł wysłał
 * zgłoszenie audytu bez pól `imie` i `wiadomosc`). Wysyłkę obsługuje
 * wyłącznie moduł, którego rewizja zgadza się z atrybutem formularza.
 * Podbij przy każdej zmianie kontraktu pól.
 */
export const MARGO_REWIZJA = '2';

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

  // Dodatkowe pola formularza (adres strony do audytu, odpowiedzi i widełki
  // z kreatora) wchodzą do nagłówka wiadomości — Margo widzi od razu, skąd
  // przyszło zgłoszenie i z czym. Formularz kontaktowy nie ma `zrodla`
  // i wysyła samą treść.
  const zrodlo = formularz.dataset.margoZrodlo ?? '';
  let wiadomosc = pole('wiadomosc');
  if (zrodlo !== '') {
    const szczegoly = [...formularz.querySelectorAll<HTMLInputElement>('[data-margo-info]')]
      .map((p) => ({ etykieta: p.dataset.margoInfo ?? '', wartosc: p.value.trim() }))
      .filter((s) => s.etykieta !== '' && s.wartosc !== '')
      .map((s) => `${s.etykieta}: ${s.wartosc}`)
      .join(' | ');
    const naglowek = szczegoly === '' ? `[${zrodlo}]` : `[${zrodlo}] ${szczegoly}`;
    wiadomosc = wiadomosc === '' ? naglowek : `${naglowek}\n${wiadomosc}`;
    wiadomosc = wiadomosc.slice(0, MARGO_LIMITY.wiadomosc);
  }

  try {
    const odpowiedz = await fetch(formularz.dataset.margo ?? '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Kontrakt wymaga imienia, a audyt go nie zbiera (w kreatorze jest
        // opcjonalne) — pusta wartość dostaje czytelny zastępnik.
        imie: pole('imie') || '(nie podano)',
        salon: pole('salon'),
        kontakt: pole('kontakt'),
        wiadomosc,
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
    // Widżet Turnstile renderuje się, gdy formularz pierwszy raz wejdzie
    // w pole widzenia — formularze audytu i kreatora startują ukryte
    // (werdykt/wynik), a widżet renderowany w ukrytym kontenerze mierzy
    // zerową szerokość i potrafi wstać przycięty. Challenge w trybie
    // zarządzanym kończy się zwykle szybciej, niż ktokolwiek wypełni pola.
    const kontenerTurnstile = formularz.querySelector<HTMLElement>('[data-turnstile]');
    if (formularz.dataset.margo && kontenerTurnstile && formularz.dataset.sitekey) {
      const stanWidgetu: StanWidgetu = {};
      widgety.set(formularz, stanWidgetu);

      // Skrypt API ściągamy od razu — na reveal zostaje sam render.
      void zaladujTurnstile().catch(() => {});

      const obserwator = new IntersectionObserver((wpisy) => {
        if (!wpisy.some((w) => w.isIntersecting)) return;
        obserwator.disconnect();
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
      });
      obserwator.observe(formularz);

      sprzatanie.push(() => {
        obserwator.disconnect();
        stanWidgetu.usuniety = true;
        if (stanWidgetu.id !== undefined) window.turnstile?.remove(stanWidgetu.id);
      });
    }

    // Po pierwszej nieudanej próbie poprawiamy komunikat na bieżąco —
    // ale nie krzyczymy, zanim ktokolwiek spróbował wysłać. Znacznik próby
    // siedzi w dataset, bo wysyłkę prowadzi wspólny nasłuch na dokumencie.
    const naZmiane = (e: Event) => {
      if (formularz.dataset.probowano !== '1') return;
      const pole = e.target as HTMLInputElement;
      if (pole.dataset.waliduj) polePoBledzie(pole, sprawdzPole(pole));
    };
    formularz.addEventListener('input', naZmiane);
    formularz.addEventListener('change', naZmiane);

    sprzatanie.push(() => {
      formularz.removeEventListener('input', naZmiane);
      formularz.removeEventListener('change', naZmiane);
    });
  }

  async function obsluzWysylke(formularz: HTMLFormElement): Promise<void> {
    // Jedna wysyłka na raz — przycisk jest zablokowany, ale Enter
    // w polu tekstowym omija przycisk.
    if (formularz.dataset.stanWysylki === 'wysyla') return;

    formularz.dataset.probowano = '1';

    // Honeypot: wypełnia go tylko bot. Udajemy sukces i nic nie wysyłamy.
    const pulapka = formularz.querySelector<HTMLInputElement>('[data-honeypot]');
    if (pulapka && pulapka.value.trim() !== '') {
      ustawStan(formularz, 'ok', formularz.dataset.tekstOk ?? 'Wysłane.');
      return;
    }

    let pierwszyZly: HTMLInputElement | null = null;
    for (const pole of formularz.querySelectorAll<HTMLInputElement>('[data-waliduj]')) {
      const blad = sprawdzPole(pole);
      polePoBledzie(pole, blad);
      if (blad && !pierwszyZly) pierwszyZly = pole;
    }

    if (pierwszyZly) {
      ustawStan(formularz, 'blad', '');
      pierwszyZly.focus();
      return;
    }

    // Adres strony wysyłamy w pełnej postaci, z protokołem — pełny URL
    // trafia do nagłówka wiadomości (np. „[AUDYT] Strona: https://…").
    const poleUrl = formularz.querySelector<HTMLInputElement>('[data-waliduj="url"]');
    if (poleUrl) {
      const pelny = znormalizujUrl(poleUrl.value);
      if (pelny) poleUrl.value = pelny;
    }

    await wyslijDoMargo(formularz, widgety.get(formularz));
  }

  // Jeden nasłuch na dokumencie, w fazie przechwytywania (SPEC 17.18):
  // po wdrożeniu nowej wersji strony otwarta karta może wciąż trzymać stary
  // moduł z nasłuchem na samym formularzu. Przechwycenie na dokumencie
  // wyprzedza go niezależnie od kolejności rejestracji,
  // a `stopImmediatePropagation()` nie dopuszcza go do głosu.
  const naSubmit = (e: Event) => {
    const cel =
      e.target instanceof Element ? e.target.closest('form[data-formularz]') : null;
    if (!(cel instanceof HTMLFormElement)) return;

    // Inna rewizja kontraktu: zostawiamy zdarzenie w spokoju. Obsłuży je
    // moduł z pasującą rewizją, a gdy go nie ma — naturalna wysyłka
    // przeładuje stronę i załaduje świeży kod.
    if (cel.dataset.margoRewizja !== MARGO_REWIZJA) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    void obsluzWysylke(cel);
  };
  document.addEventListener('submit', naSubmit, true);
  sprzatanie.push(() => document.removeEventListener('submit', naSubmit, true));

  return () => sprzatanie.splice(0).forEach((f) => f());
}
