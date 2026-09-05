/**
 * Jedno źródło prawdy dla danych, które zmieniają się poza kodem:
 * kontakt, dane rejestrowe, termin startu, klucze usług.
 *
 * Pola oznaczone TODO_ uzupełnia Jakub przed publikacją (SPEC Etap 9).
 * Nie zaszywamy tych wartości w komponentach.
 */

export const site = {
  nazwa: 'Connectiva',
  url: 'https://connectiva-portfolio.pages.dev',
  jezyk: 'pl',

  /** Domyślny tytuł i opis — wzór z SPEC 11.2. */
  tytul: 'Strony dla salonów beauty i klinik medycyny estetycznej — Connectiva',
  opis:
    'Strony i systemy pozyskiwania klientek dla salonów beauty, gabinetów ' +
    'kosmetologii i klinik medycyny estetycznej. Jedna marka na miasto. ' +
    'Cena znana przed pierwszą rozmową.',

  /** Kontakt. TODO Jakub — decyzja otwarta nr 2 (SPEC 16). */
  email: 'TODO_EMAIL',
  instagram: {
    nazwa: 'TODO_INSTAGRAM',
    url: 'TODO_INSTAGRAM_URL',
  },

  /**
   * Uczciwy termin startu (SPEC 8.8 i lista kontrolna 15).
   * Aktualizowany ręcznie — nigdy licznik, nigdy „efekt".
   */
  najblizszyTermin: 'październik 2026',

  /** Dane rejestrowe do stopki i polityki. TODO Jakub (SPEC 16, decyzja 2). */
  firma: {
    nazwa: 'TODO_NAZWA_FIRMY',
    nip: 'TODO_NIP',
    adres: 'TODO_ADRES',
  },

  /** Web3Forms. TODO Jakub przed publikacją (SPEC 0). */
  web3formsKey: 'TODO_WEB3FORMS_KEY',

  /**
   * Czy ceny w cenniku są netto, czy brutto — zależy od tego, czy JDG jest
   * podatnikiem VAT. Decyzja otwarta nr 2 (SPEC 16), jeszcze niepodjęta.
   * Dopóki jest `null`, cennik nie twierdzi ani jednego, ani drugiego.
   */
  cenyVat: null as 'netto' | 'brutto' | null,

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
  { etykieta: 'Projekty', href: '#projekty' },
  { etykieta: 'Cennik', href: '#cennik' },
  { etykieta: 'Kontakt', href: '#kontakt' },
];

/** Przycisk główny w belce. Etap 4 przełącza go na `/audyt/`. */
export const navCta: { etykieta: string; href: string } | null = {
  etykieta: 'Bezpłatny audyt',
  href: '#audyt',
};

/**
 * Kolumny linków w stopce (SPEC 8.9). Jak wyżej — uzupełniane etapami,
 * docelowo w Etapie 6.
 */
export const stopkaKolumny: ReadonlyArray<{
  tytul: string;
  linki: ReadonlyArray<{ etykieta: string; href: string }>;
}> = [];
