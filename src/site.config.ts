/**
 * Jedno źródło prawdy dla danych, które zmieniają się poza kodem:
 * kontakt, dane rejestrowe, klucze usług.
 *
 * Pola oznaczone TODO_ uzupełnia Jakub przed publikacją (SPEC Etap 9).
 * Nie zaszywamy tych wartości w komponentach.
 */

export const site = {
  /**
   * Marka na stronie (SPEC 17.13 D). To NIE jest zarejestrowana nazwa firmy
   * — ta stoi niżej w `firma.nazwa` i brzmi inaczej. Logo graficzne też
   * zostaje bez dopisku: wordmark w SVG to nadal samo „Connectiva”.
   */
  nazwa: 'Connectiva Studio',
  /** Domena produkcyjna — podpięta w Cloudflare, serwuje stronę od 10.2026.
      Adres connectiva-portfolio.pages.dev zostaje jako alias techniczny. */
  url: 'https://connectiva.studio',
  jezyk: 'pl',

  /** Domyślny tytuł i opis — wzór z SPEC 11.2. */
  tytul: 'Strony dla salonów beauty i\u00A0klinik medycyny estetycznej — Connectiva Studio',
  opis:
    'Strony i\u00A0systemy pozyskiwania klientek dla salonów beauty, gabinetów ' +
    'kosmetologii i\u00A0klinik medycyny estetycznej. ' +
    'Strona, która prowadzi klientkę od pierwszego wejścia ' +
    'do umówionej wizyty.',

  /**
   * Kontakt. Firmowy adres w domenie marki — zastąpił placeholder TODO_EMAIL
   * z SPEC 17.13 F (10.2026). Instagram: handle i link z 17.13 E.
   */
  email: 'kontakt@connectiva.studio',
  instagram: {
    nazwa: 'connectiva.studio',
    url: 'https://instagram.com/connectiva.studio',
  },

  /* Pole `najblizszyTermin` zniknęło w rewizji v4 (SPEC 17.15 A): sekcja
     Kontakt nie podaje daty, tylko stałe zdanie o wolnych terminach. Nie
     zostawiamy martwego pola — jeśli kalendarz się zapełni, zmienia się
     zdanie w `Contact.astro`, nie konfiguracja. */

  /**
   * Dane rejestrowe do stopki i polityki prywatności (SPEC 17.13 C).
   *
   * `nazwa` to zarejestrowana nazwa z CEIDG i ma zostać dokładnie w tym
   * brzmieniu — nigdy „Connectiva Studio Jakub Dylewski". To inny byt niż
   * marka (`site.nazwa`) i nie wolno ich mylić.
   *
   * Adresu nie podajemy świadomie — decyzja o prywatności, nie przeoczenie.
   */
  firma: {
    nazwa: 'Connectiva Jakub Dylewski',
    nip: '8911643646',
    regon: '543116883',
  },

  /**
   * Margo — asystent, który odbiera zgłoszenia ze wszystkich trzech
   * formularzy: kontaktowego, audytu i kreatora wyceny (SPEC 17.16–17.17;
   * Web3Forms odeszło razem z nieuzupełnionym kluczem). Klucz Turnstile jest
   * kluczem publicznym (site key) — sekret mieszka po stronie Margo, nie
   * w tym repozytorium.
   */
  margo: {
    endpoint: 'https://margo.connectiva.studio/lead',
    turnstileSiteKey: '0x4AAAAAAFaN9VuyvsEXmFHZ',
  },

  /* Pytanie „netto czy brutto" jest zamknięte (SPEC 17.13 A): kwota z kreatora
     jest kwotą do zapłaty, nie doliczamy do niej podatku. Dlatego nie ma tu
     już przełącznika `cenyVat` — nie ma czego przełączać. */

  /** Miasta, od których zaczynamy (SPEC 8.3, 11.2 areaServed). */
  obszar: ['Gdańsk', 'Gdynia', 'Sopot', 'Toruń'],
} as const;

/**
 * Linki nawigacji (SPEC 7.2).
 *
 * Na razie kotwice na stronie głównej — podstrony `/cennik/`, `/kontakt/`
 * i `/audyt/` powstają w Etapach 4–6 i dopiero wtedy przełączamy tu ścieżki.
 * Nie wystawiamy odnośników do stron, których nie ma.
 */
export const nawigacja: ReadonlyArray<{ etykieta: string; href: string }> = [
  // Projekty nie mają własnej podstrony — prowadzimy do sekcji na stronie
  // głównej. Case studies dochodzą w Etapie 7.
  { etykieta: 'Projekty', href: '/#projekty' },
  { etykieta: 'Cennik', href: '/cennik/' },
  { etykieta: 'Kontakt', href: '/kontakt/' },
];

/** Przycisk główny w belce (SPEC 7.2). */
export const navCta: { etykieta: string; href: string } | null = {
  etykieta: 'Bezpłatny audyt',
  href: '/audyt/',
};

/**
 * Kolumny linków w stopce (SPEC 8.9). Jak wyżej — uzupełniane etapami,
 * docelowo w Etapie 6.
 */
export const stopkaKolumny: ReadonlyArray<{
  tytul: string;
  linki: ReadonlyArray<{ etykieta: string; href: string }>;
}> = [
  {
    tytul: 'Projekty',
    linki: [
      { etykieta: 'Klinika Aurelia', href: '/projekty/aurelia/' },
      { etykieta: 'ELARA Instytut Urody', href: '/projekty/elara/' },
      { etykieta: 'HALICKA Kosmetologia Estetyczna', href: '/projekty/halicka/' },
    ],
  },
  {
    tytul: 'Oferta',
    linki: [
      { etykieta: 'Cennik', href: '/cennik/' },
      { etykieta: 'Bezpłatny audyt', href: '/audyt/' },
      { etykieta: 'Proces', href: '/#proces' },
    ],
  },
  {
    tytul: 'Kontakt',
    linki: [
      { etykieta: 'Napisz', href: '/kontakt/' },
      { etykieta: 'Polityka prywatności', href: '/polityka-prywatnosci/' },
    ],
  },
];
