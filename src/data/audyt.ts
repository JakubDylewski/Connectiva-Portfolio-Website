/**
 * Audyt w 60 sekund (SPEC 8.4) — interakcja 6, główna konwersja.
 *
 * Sześć pytań, każde z odpowiedziami tak / nie / nie wiem. Werdykt liczy się
 * z liczby „tak". Pod werdyktem pokazujemy konsekwencje tylko tych punktów,
 * na które padło „nie" albo „nie wiem".
 *
 * UCZCIWOŚĆ (SPEC 15): zdania konsekwencji nie zawierają żadnych liczb —
 * ani procentów, ani „połowa klientek". To autodiagnoza, nie pomiar, i tak
 * jest podpisana pod werdyktem.
 *
 * Treść pytań i werdyktów pochodzi wprost ze SPEC 8.4. Zdanie konsekwencji
 * dla pytania 1 też. Pozostałe napisane pod ten sam głos: spokojny ekspert,
 * druga osoba, krótkie zdania, zero żargonu (SPEC 1).
 */

export type Odpowiedz = 'tak' | 'nie' | 'nie-wiem';

export interface PytanieAudytu {
  /** Krótki klucz do maila z wynikiem — Jakub widzi, czego dotyczy odpowiedź. */
  klucz: string;
  pytanie: string;
  /** Co to znaczy, jeśli padło „nie". */
  konsekwencjaNie: string;
  /** Co zrobimy, jeśli padło „nie wiem". */
  konsekwencjaNieWiem: string;
}

export const pytania: PytanieAudytu[] = [
  {
    klucz: 'rezerwacja na stronie',
    pytanie:
      'Czy klientka może umówić wizytę bezpośrednio na Twojej stronie, bez przechodzenia do aplikacji zewnętrznej?',
    konsekwencjaNie:
      'Każda rezerwacja przez aplikację zewnętrzną to prowizja i\u00A0klientka, która widzi obok Twoją konkurencję.',
    konsekwencjaNieWiem:
      'Sprawdzimy, dokąd prowadzi przycisk rezerwacji i\u00A0co się po drodze dzieje z\u00A0klientką.',
  },
  {
    klucz: 'trzy dotknięcia do rezerwacji',
    pytanie:
      'Czy na telefonie da się dojść do rezerwacji w\u00A0maksymalnie trzech dotknięciach?',
    konsekwencjaNie:
      'Im dłuższa droga do terminu, tym więcej klientek odpada po drodze. Rezerwacja powinna być na wyciągnięcie kciuka.',
    konsekwencjaNieWiem:
      'Przejdziemy tę drogę na prawdziwym telefonie i\u00A0policzymy dotknięcia.',
  },
  {
    klucz: 'cennik na stronie',
    pytanie: 'Czy pełny cennik jest na stronie i\u00A0da się go przeszukać?',
    konsekwencjaNie:
      'Klientka, która nie znajdzie ceny, zwykle nie dzwoni, żeby o\u00A0nią zapytać. Po prostu szuka dalej.',
    konsekwencjaNieWiem:
      'Sprawdzimy, czy cennik jest kompletny i\u00A0czy da się go przeszukać z\u00A0telefonu.',
  },
  {
    klucz: 'widoczność w\u00A0Google',
    pytanie:
      'Czy Twoja strona pojawia się w\u00A0Google po wpisaniu usługi i\u00A0Twojego miasta?',
    konsekwencjaNie:
      'Klientki szukają usługi razem z\u00A0nazwą miasta. Jeśli nie ma Cię w\u00A0tych wynikach, trafiają do kogoś innego.',
    konsekwencjaNieWiem:
      'Sprawdzimy Twoją widoczność na frazy z\u00A0Twojego miasta i\u00A0porównamy ją z\u00A0konkurencją.',
  },
  {
    klucz: 'własne zdjęcia',
    pytanie:
      'Czy zdjęcia na stronie są Twoje — wnętrze, zespół, prace — a\u00A0nie ze stocku?',
    konsekwencjaNie:
      'Zdjęcia ze stocku widać od razu. Klientka nie wie, jak wygląda Twój gabinet, więc nie wie, czy chce tam wejść.',
    konsekwencjaNieWiem:
      'Przejrzymy zdjęcia i\u00A0powiemy, które warto wymienić w\u00A0pierwszej kolejności.',
  },
  {
    klucz: 'czas otwarcia',
    pytanie: 'Czy strona otwiera się na telefonie w\u00A0mniej niż trzy sekundy?',
    konsekwencjaNie:
      'Wolna strona kosztuje najwięcej tam, gdzie boli najbardziej: przy pierwszym wejściu z\u00A0Google albo z\u00A0reklamy.',
    konsekwencjaNieWiem:
      'Zmierzymy czas otwarcia na telefonie i\u00A0pokażemy, co go wydłuża.',
  },
];

export interface Werdykt {
  /** Dolna granica liczby odpowiedzi „tak" (włącznie). */
  od: number;
  tekst: string;
}

/** Progi werdyktu ze SPEC 8.4, od najwyższego. */
export const werdykty: Werdykt[] = [
  {
    od: 6,
    tekst:
      'Twoja strona robi robotę. Jeśli chcesz, sprawdzimy, czy da się z\u00A0niej wycisnąć więcej.',
  },
  {
    od: 4,
    tekst: 'Solidna baza i\u00A0kilka dziur, przez które uciekają rezerwacje.',
  },
  {
    od: 2,
    tekst: 'Strona jest, ale nie sprzedaje. Klientki oglądają i\u00A0wychodzą.',
  },
  {
    od: 0,
    tekst: 'Ta strona kosztuje Cię klientki każdego dnia.',
  },
];

/** Werdykt dla podanej liczby odpowiedzi „tak". */
export function werdyktDla(liczbaTak: number): string {
  return (werdykty.find((w) => liczbaTak >= w.od) ?? werdykty[werdykty.length - 1]).tekst;
}

/** Dopisek pod werdyktem (SPEC 8.4). */
export const DOPISEK =
  'To autodiagnoza, nie pomiar. Pełny audyt robimy ręcznie, na Twojej stronie.';

/** Obietnica pod przyciskiem wysyłki (SPEC 8.4). */
export const OBIETNICA =
  'Dostaniesz 3-minutowe wideo z\u00A0konkretami w\u00A048 godzin. Bez zobowiązań.';

export const ETYKIETY_ODPOWIEDZI: Record<Odpowiedz, string> = {
  tak: 'Tak',
  nie: 'Nie',
  'nie-wiem': 'Nie wiem',
};
