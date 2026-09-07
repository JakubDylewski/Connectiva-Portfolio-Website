/**
 * Kreator wyceny (SPEC 17.4) — sekcja 05 i strona /cennik/.
 *
 * Teksty pytań, opcji i wyjaśnień wprost ze SPEC 17.4 — nie parafrazujemy.
 * Zasada nadrzędna: jeden krok = jedno pytanie, 2–4 opcje, jedno zdanie
 * wyjaśnienia „co to znaczy i po co". Kwoty żyją w `cennik.json` (model
 * addytywny z tabel 17.4); tu jest tylko treść i logika liczenia.
 *
 * UCZCIWOŚĆ (SPEC 17.9): pytanie „skąd klientki" ma wagę zero i mówi to
 * wprost. Widełki są wstępne, z jawnym zastrzeżeniem o wpływie uwag.
 */
import cennik from './cennik.json';

export type KluczPytania =
  | 'segment'
  | 'rozmiar'
  | 'system'
  | 'rezerwacja'
  | 'miejscowosci'
  | 'zrodlo';

export interface OpcjaKreatora {
  klucz: string;
  etykieta: string;
  /**
   * Wiersz listy „Co się składa na tę wycenę" na ekranie wyniku.
   * `null` = wybór nie dodaje osobnej pozycji (mieści się w bazie).
   */
  sklad: string | null;
}

export interface PytanieKreatora {
  klucz: KluczPytania;
  pytanie: string;
  /** Jedno–dwa zdania: co to znaczy i po co (SPEC 17.4). */
  wyjasnienie: string;
  /** Dodatkowa uczciwa informacja pod wyjaśnieniem (pytanie 6). */
  dopisek?: string;
  opcje: OpcjaKreatora[];
}

export const pytania: PytanieKreatora[] = [
  {
    klucz: 'segment',
    pytanie: 'Do czego jest strona?',
    wyjasnienie:
      'Od tego zależy, jak zbudujemy stronę i jakim językiem. Klinika ' +
      'lekarska ma inne zasady niż salon — reklama świadczeń zdrowotnych ' +
      'jest zakazana.',
    opcje: [
      { klucz: 'salon', etykieta: 'salon beauty', sklad: null },
      { klucz: 'gabinet', etykieta: 'gabinet kosmetologii', sklad: null },
      {
        klucz: 'klinika',
        etykieta: 'klinika medycyny estetycznej',
        sklad: 'teksty zgodne z prawem dla klinik',
      },
      { klucz: 'inne', etykieta: 'coś innego', sklad: null },
    ],
  },
  {
    klucz: 'rozmiar',
    pytanie: 'Jak duża ma być?',
    wyjasnienie:
      'Wizytówka pokazuje, kim jesteś i gdzie Cię znaleźć. Rozbudowana ' +
      'opisuje każdy zabieg osobno — i dzięki temu łapie klientki, ' +
      'które szukają konkretnej usługi w Google.',
    opcje: [
      {
        klucz: 'wizytowka',
        etykieta: 'wizytówka (jedna strona)',
        sklad: 'strona wizytówka — wszystko na jednej stronie',
      },
      {
        klucz: 'srednia',
        etykieta: 'średnia (do 6 podstron z usługami)',
        sklad: 'strona z 6 podstronami usług',
      },
      {
        klucz: 'rozbudowana',
        etykieta: 'rozbudowana (12+ podstron, osobna strona na każdą usługę)',
        sklad: 'rozbudowana strona: 12+ podstron, osobna strona na każdą usługę',
      },
    ],
  },
  {
    klucz: 'system',
    pytanie: 'System, który zamienia oglądanie w rezerwację',
    wyjasnienie:
      'To element, który prowadzi klientkę od «oglądam» do «zapisuję się»: ' +
      'dobór zabiegu do jej problemu, cennik z wyszukiwarką albo analiza ' +
      'skóry z raportem. To serce strony, która sprzedaje — zobacz, jak ' +
      'działa w projektach wyżej.',
    opcje: [
      { klucz: 'brak', etykieta: 'bez systemu', sklad: null },
      {
        klucz: 'jeden',
        etykieta: 'jeden',
        sklad: 'jeden system prowadzący od oglądania do rezerwacji',
      },
      {
        klucz: 'dwa',
        etykieta: 'dwa lub więcej',
        sklad: 'dwa lub więcej systemów prowadzących do rezerwacji',
      },
    ],
  },
  {
    klucz: 'rezerwacja',
    pytanie: 'Rezerwacja online',
    wyjasnienie:
      'Klientka rezerwuje wprost na Twojej stronie, bez prowizji od ' +
      'marketplace’u. Wpinamy system, który już masz, albo pomagamy ' +
      'wybrać nowy.',
    opcje: [
      { klucz: 'brak', etykieta: 'nie potrzebuję', sklad: null },
      {
        klucz: 'wpiac',
        etykieta: 'wpiąć system, którego już używam (Booksy, Fresha, Estetify)',
        sklad: 'rezerwacja wpięta z systemu, którego już używasz',
      },
      {
        klucz: 'dobrac',
        etykieta: 'dobierzcie i wdróżcie',
        sklad: 'rezerwacja dobrana i wdrożona przez nas',
      },
    ],
  },
  {
    klucz: 'miejscowosci',
    pytanie: 'Ile miejscowości ma Cię znajdować w Google?',
    wyjasnienie:
      'Pod każdą miejscowość robimy osobną stronę, żeby klientka z Torunia ' +
      'i klientka z Bydgoszczy trafiły do Ciebie, wpisując swoją ' +
      'okolicę. Więcej miejscowości to więcej stron i szerszy zasięg.',
    opcje: [
      { klucz: 'jedna', etykieta: 'jedna (moje miasto)', sklad: null },
      {
        klucz: 'okoliczne',
        etykieta: 'kilka okolicznych',
        sklad: 'strony pod okoliczne miejscowości',
      },
      {
        klucz: 'region',
        etykieta: 'szeroko, cały region',
        sklad: 'strony pod miejscowości w całym regionie',
      },
    ],
  },
  {
    klucz: 'zrodlo',
    pytanie: 'Skąd mają przychodzić klientki?',
    wyjasnienie:
      'Mówi nam, na czym skupić stronę: szybkie wejście z Instagrama, ' +
      'widoczność w wyszukiwarce czy lądowanie prosto z reklamy.',
    // UCZCIWOŚĆ (17.4, 17.9): zero wpływu na cenę — mówimy to wprost.
    dopisek: 'To pytanie nie wpływa na cenę — pomaga nam dopasować ofertę.',
    opcje: [
      { klucz: 'instagram', etykieta: 'głównie z Instagrama', sklad: null },
      { klucz: 'google', etykieta: 'głównie z Google', sklad: null },
      { klucz: 'reklamy', etykieta: 'z reklam', sklad: null },
    ],
  },
];

/** Krok 7 — uwagi (SPEC 17.4). */
export const KROK_UWAGI = {
  naglowek: 'Chcesz coś dodać?',
  etykieta: 'Twoje uwagi (opcjonalnie)',
  podpowiedz:
    'Masz konkretny pomysł, przykład strony, która Ci się podoba, albo pytanie? Napisz tutaj.',
};

/** Teksty ekranu wyniku (SPEC 17.4, 17.6). */
export const WYNIK = {
  tytulSkladu: 'Co się składa na tę wycenę',
  zdjecia:
    'Pracujemy na Twoich zdjęciach. Jeśli ich nie masz albo nie jesteś ' +
    'z nich zadowolona, podpowiemy, jak zrobić dobre zdjęcia telefonem, ' +
    'albo polecimy fotografa — ale sesja nie wchodzi w zakres projektu.',
  zastrzezenie:
    'To wstępna wycena w widełkach. To, co napiszesz w uwagach, ' +
    'może — choć nie musi — wpłynąć na finalną kwotę. Dokładną cenę ustalamy ' +
    'po rozmowie, zanim cokolwiek zaczniemy.',
  przycisk: 'Wyślij i porozmawiajmy',
  obietnica: 'Odpowiadam w ciągu 24 godzin w dni robocze.',
};

export interface Widelki {
  dol: number;
  gora: number;
}

type Wagi = Record<string, Record<string, [number, number]>>;
const WAGI = cennik.wagi as unknown as Wagi;

/** Waga jednej opcji z `cennik.json`. Brak wpisu = [0, 0]. */
export function wagaOpcji(pytanie: KluczPytania, opcja: string): [number, number] {
  return WAGI[pytanie]?.[opcja] ?? [0, 0];
}

/** Zaokrąglenie do pełnych 500 zł (SPEC 17.4). */
function zaokraglij(kwota: number): number {
  const krok = cennik.zaokraglenie;
  return Math.round(kwota / krok) * krok;
}

/**
 * Widełki dla kompletu (albo części) odpowiedzi. Bez wybranego rozmiaru nie
 * ma bazy — zwracamy `null`, a interfejs nie pokazuje wtedy żadnej kwoty.
 */
export function policzWidelki(
  odpowiedzi: Partial<Record<KluczPytania, string>>,
): Widelki | null {
  if (!odpowiedzi.rozmiar) return null;

  let dol = 0;
  let gora = 0;
  for (const p of pytania) {
    const wybor = odpowiedzi[p.klucz];
    if (!wybor) continue;
    const [d, g] = wagaOpcji(p.klucz, wybor);
    dol += d;
    gora += g;
  }
  return { dol: zaokraglij(dol), gora: zaokraglij(gora) };
}

/** Pozycje listy „Co się składa na tę wycenę" dla danych odpowiedzi. */
export function zbudujSklad(
  odpowiedzi: Partial<Record<KluczPytania, string>>,
): string[] {
  const pozycje: string[] = [];
  for (const p of pytania) {
    const wybor = odpowiedzi[p.klucz];
    if (!wybor) continue;
    const opcja = p.opcje.find((o) => o.klucz === wybor);
    if (opcja?.sklad) pozycje.push(opcja.sklad);
  }
  return pozycje;
}

/* --------------------------------------------------------------------------
 * Zabezpieczenie budowania: skrajne widełki z 17.4 są zakotwiczone w realnych
 * cenach rynku 2026 i nie wolno ich zmienić przypadkiem — minimum 3 000–4 000,
 * maksimum 13 500–18 000. Gdy ktoś ruszy kwoty w cennik.json, build ma paść
 * tutaj, a nie cicho wypuścić stronę z innym przedziałem.
 * ------------------------------------------------------------------------ */
const minimum = policzWidelki({
  segment: 'salon',
  rozmiar: 'wizytowka',
  system: 'brak',
  rezerwacja: 'brak',
  miejscowosci: 'jedna',
  zrodlo: 'google',
});
const maksimum = policzWidelki({
  segment: 'klinika',
  rozmiar: 'rozbudowana',
  system: 'dwa',
  rezerwacja: 'dobrac',
  miejscowosci: 'region',
  zrodlo: 'google',
});
if (
  !minimum ||
  !maksimum ||
  minimum.dol !== 3000 ||
  minimum.gora !== 4000 ||
  maksimum.dol !== 13500 ||
  maksimum.gora !== 18000
) {
  throw new Error(
    `kreator.ts: skrajne widełki rozjechały się ze SPEC 17.4 — ` +
      `minimum ${minimum?.dol}–${minimum?.gora}, maksimum ${maksimum?.dol}–${maksimum?.gora}, ` +
      `a mają być 3000–4000 i 13500–18000. Sprawdź cennik.json.`,
  );
}
