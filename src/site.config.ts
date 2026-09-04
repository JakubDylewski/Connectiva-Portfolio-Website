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

  /** Miasta, od których zaczynamy (SPEC 8.3, 11.2 areaServed). */
  obszar: ['Gdańsk', 'Gdynia', 'Sopot', 'Toruń'],
} as const;

/**
 * Linki nawigacji. W Etapie 0 pusta — dokładamy pozycje dopiero wtedy, gdy
 * podstrona faktycznie istnieje, żeby nie wystawiać martwych odnośników.
 *
 * Docelowo (SPEC 7.2): Projekty, Cennik, Kontakt + przycisk „Bezpłatny audyt".
 */
export const nawigacja: ReadonlyArray<{ etykieta: string; href: string }> = [];

/** Przycisk główny w belce. Null, dopóki `/audyt/` nie istnieje (Etap 4). */
export const navCta: { etykieta: string; href: string } | null = null;

/**
 * Kolumny linków w stopce (SPEC 8.9). Jak wyżej — uzupełniane etapami,
 * docelowo w Etapie 6.
 */
export const stopkaKolumny: ReadonlyArray<{
  tytul: string;
  linki: ReadonlyArray<{ etykieta: string; href: string }>;
}> = [];
