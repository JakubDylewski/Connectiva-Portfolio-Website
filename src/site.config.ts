/**
 * Jedno źródło prawdy dla danych, które zmieniają się poza kodem:
 * kontakt, dane rejestrowe, termin startu, klucze usług.
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
  url: 'https://connectiva-portfolio.pages.dev',
  jezyk: 'pl',

  /** Domyślny tytuł i opis — wzór z SPEC 11.2. */
  tytul: 'Strony dla salonów beauty i\u00A0klinik medycyny estetycznej — Connectiva Studio',
  opis:
    'Strony i\u00A0systemy pozyskiwania klientek dla salonów beauty, gabinetów ' +
    'kosmetologii i\u00A0klinik medycyny estetycznej. ' +
    'Strona, która prowadzi klientkę od pierwszego wejścia ' +
    'do umówionej wizyty.',

  /**
   * Kontakt. E-mail zostaje TODO — nowy adres nie jest gotowy, a tymczasowego
   * Jakub nie publikuje (SPEC 17.13 F). Instagram: handle i link z 17.13 E.
   */
  email: 'TODO_EMAIL',
  instagram: {
    nazwa: 'connectiva.studio',
    url: 'https://instagram.com/connectiva.studio',
  },

  /**
   * Uczciwy termin startu (SPEC 8.8 i lista kontrolna 15).
   * Aktualizowany ręcznie — nigdy licznik, nigdy „efekt".
   */
  najblizszyTermin: 'październik 2026',

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

  /** Web3Forms. TODO Jakub przed publikacją (SPEC 0). */
  web3formsKey: 'TODO_WEB3FORMS_KEY',

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
