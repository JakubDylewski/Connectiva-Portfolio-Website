/**
 * Kreator wyceny (SPEC 17.15 B, zasada nadrzędna z 17.4) — sekcja 05
 * i strona /cennik/.
 *
 * Rewizja v4: cztery pytania zamiast sześciu plus kroku uwag. Dawne pytania
 * o system i o rezerwację połączyły się w jedno („Co strona ma robić?"),
 * pytanie „skąd klientki" zniknęło w całości, a uwagi przeniosły się na ekran
 * wyniku. Rozróżnienie „wpiąć mój system / dobierzcie" nie wpływa już na
 * wycenę — jest tematem rozmowy.
 *
 * Teksty pytań, opcji i wyjaśnień wprost ze SPEC 17.15 — nie parafrazujemy.
 * Zasada nadrzędna zostaje: jeden krok = jedno pytanie, przy każdej opcji
 * wiadomo, co to znaczy i po co. Kwoty żyją w `cennik.json`; tu jest tylko
 * treść i logika liczenia.
 */
import cennik from './cennik.json';

export type KluczPytania = 'segment' | 'rozmiar' | 'cel' | 'miejscowosci';

export interface OpcjaKreatora {
  klucz: string;
  etykieta: string;
  /**
   * Doprecyzowanie etykiety — pytanie 3 opisuje każdą opcję osobno
   * (SPEC 17.15 B). Osobna linia zamiast myślnika po etykiecie: konstrukcji
   * „SŁOWO — fragment" nie używamy (SPEC 5).
   */
  opis?: string;
  /** Wyjaśnienie przy opcji, gdy pytanie nie ma jednego wspólnego. */
  wyjasnienie?: string;
  /**
   * Wiersz listy „Co się składa na tę wycenę" na ekranie wyniku.
   * `null` = wybór nie dodaje osobnej pozycji (mieści się w bazie).
   */
  sklad: string | null;
}

export interface PytanieKreatora {
  klucz: KluczPytania;
  pytanie: string;
  /** Jedno–dwa zdania dla całego pytania. Pytanie 3 wyjaśnia każdą opcję. */
  wyjasnienie?: string;
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
    klucz: 'cel',
    pytanie: 'Co strona ma robić?',
    opcje: [
      {
        klucz: 'pokazywac',
        etykieta: 'Pokazywać',
        opis: 'kim jesteś, co robisz, jak Cię znaleźć.',
        wyjasnienie:
          'Wystarczy, gdy klientki i tak piszą na Instagramie, a strona ma ' +
          'potwierdzać, że jesteś profesjonalistką.',
        sklad: null,
      },
      {
        klucz: 'rezerwacja',
        etykieta: 'Prowadzić do rezerwacji',
        opis:
          'system dopasowany do Twojej oferty plus rezerwacja online wpięta ' +
          'w stronę, bez prowizji.',
        wyjasnienie:
          'Dobór zabiegu albo cennik z wyszukiwarką prowadzi klientkę ' +
          'od «oglądam» do «zapisuję się» — prosto do Twojego kalendarza.',
        sklad:
          'system dopasowany do Twojej oferty i rezerwacja online wpięta ' +
          'w stronę, bez prowizji',
      },
      {
        klucz: 'pozyskiwac',
        etykieta: 'Aktywnie pozyskiwać',
        opis: 'dwa systemy, rezerwacja i zbieranie kontaktów do klientek.',
        wyjasnienie:
          'Strona pracuje jak handlowiec: analiza skóry z raportem zostawia ' +
          'Ci kontakt z pełnym profilem, zanim klientka w ogóle napisze.',
        sklad: 'dwa systemy, rezerwacja i zbieranie kontaktów do klientek',
      },
    ],
  },
  {
    klucz: 'miejscowosci',
    pytanie: 'Ile miejscowości ma Cię znajdować w Google?',
    wyjasnienie:
      'Pod każdą miejscowość robimy osobną stronę, żeby klientka z Torunia ' +
      'i klientka z Bydgoszczy trafiły do Ciebie, wpisując swoją okolicę.',
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
];

/** Pole uwag — od rewizji v4 stoi na ekranie wyniku (SPEC 17.15 B). */
export const UWAGI = {
  etykieta: 'Twoje uwagi (opcjonalnie)',
  podpowiedz:
    'Masz pytanie albo konkretny pomysł? Napisz też, z jakiego systemu ' +
    'rezerwacji korzystasz i skąd dziś przychodzą klientki — lepiej ' +
    'przygotuję wycenę.',
};

/** Teksty ekranu wyniku (SPEC 17.4, 17.6, 17.13 A). */
export const WYNIK = {
  tytulSkladu: 'Co się składa na tę wycenę',
  zdjecia:
    'Pracujemy na Twoich zdjęciach. Jeśli ich nie masz albo nie jesteś ' +
    'z nich zadowolona, podpowiemy, jak zrobić dobre zdjęcia telefonem, ' +
    'albo polecimy fotografa — ale sesja nie wchodzi w zakres projektu.',
  /**
   * Kwota jest ostateczna — bez doliczania podatku (SPEC 17.13 A). Zdanie
   * o uwagach zostaje, bo wymaga go lista kontrolna uczciwości (17.9).
   */
  zastrzezenie:
    'To wstępna wycena w widełkach. Kwota, którą widzisz, jest kwotą, ' +
    'którą płacisz — nie doliczamy do niej żadnego podatku. To, co napiszesz ' +
    'w uwagach, może — choć nie musi — wpłynąć na finalną kwotę. Dokładną ' +
    'cenę ustalamy po rozmowie, zanim cokolwiek zaczniemy.',
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

/** Zaokrąglenie do pełnych 500 zł (SPEC 17.15). */
function zaokraglij(kwota: number): number {
  const krok = cennik.zaokraglenie;
  return Math.round(kwota / krok) * krok;
}

/**
 * Widełki dla kompletu (albo części) odpowiedzi. Bez wybranego rozmiaru nie
 * ma bazy — zwracamy `null`, a interfejs nie pokazuje wtedy żadnej kwoty.
 *
 * Górną granicę po zaokrągleniu przycinamy do `gornaGranica` (SPEC 17.15):
 * suma skrajnych dodatków wychodzi ponad 18 000, a tyle ma być maksimum.
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
  return {
    dol: zaokraglij(dol),
    gora: Math.min(zaokraglij(gora), cennik.gornaGranica),
  };
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
 * Zabezpieczenie budowania: skrajne widełki z 17.15 są zakotwiczone w realnych
 * cenach rynku 2026 i nie wolno ich zmienić przypadkiem — minimum 3 000–4 000
 * (wizytówka, „pokazywać", jedna miejscowość, salon), maksimum 13 500–18 000
 * (rozbudowana, „aktywnie pozyskiwać", szeroko, klinika). Gdy ktoś ruszy kwoty
 * w cennik.json, build ma paść tutaj, a nie cicho wypuścić stronę z innym
 * przedziałem.
 * ------------------------------------------------------------------------ */
const minimum = policzWidelki({
  segment: 'salon',
  rozmiar: 'wizytowka',
  cel: 'pokazywac',
  miejscowosci: 'jedna',
});
const maksimum = policzWidelki({
  segment: 'klinika',
  rozmiar: 'rozbudowana',
  cel: 'pozyskiwac',
  miejscowosci: 'region',
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
    `kreator.ts: skrajne widełki rozjechały się ze SPEC 17.15 — ` +
      `minimum ${minimum?.dol}–${minimum?.gora}, maksimum ${maksimum?.dol}–${maksimum?.gora}, ` +
      `a mają być 3000–4000 i 13500–18000. Sprawdź cennik.json.`,
  );
}
