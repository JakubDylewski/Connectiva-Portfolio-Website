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
      'Każda rezerwacja przez aplikację zewnętrzną to prowizja i klientka, która widzi obok Twoją konkurencję.',
    konsekwencjaNieWiem:
      'Sprawdzimy, dokąd prowadzi przycisk rezerwacji i co się po drodze dzieje z klientką.',
  },
  {
    klucz: 'trzy dotknięcia do rezerwacji',
    pytanie:
      'Czy na telefonie da się dojść do rezerwacji w maksymalnie trzech dotknięciach?',
    konsekwencjaNie:
      'Im dłuższa droga do terminu, tym więcej klientek odpada po drodze. Rezerwacja powinna być na wyciągnięcie kciuka.',
    konsekwencjaNieWiem:
      'Przejdziemy tę drogę na prawdziwym telefonie i policzymy dotknięcia.',
  },
  {
    klucz: 'cennik na stronie',
    pytanie: 'Czy pełny cennik jest na stronie i da się go przeszukać?',
    konsekwencjaNie:
      'Klientka, która nie znajdzie ceny, zwykle nie dzwoni, żeby o nią zapytać. Po prostu szuka dalej.',
    konsekwencjaNieWiem:
      'Sprawdzimy, czy cennik jest kompletny i czy da się go przeszukać z telefonu.',
  },
  {
    klucz: 'widoczność w Google',
    pytanie:
      'Czy Twoja strona pojawia się w Google po wpisaniu usługi i Twojego miasta?',
    konsekwencjaNie:
      'Klientki szukają usługi razem z nazwą miasta. Jeśli nie ma Cię w tych wynikach, trafiają do kogoś innego.',
    konsekwencjaNieWiem:
      'Sprawdzimy Twoją widoczność na frazy z Twojego miasta i porównamy ją z konkurencją.',
  },
  {
    klucz: 'własne zdjęcia',
    pytanie:
      'Czy zdjęcia na stronie są Twoje — wnętrze, zespół, prace — a nie ze stocku?',
    konsekwencjaNie:
      'Zdjęcia ze stocku widać od razu. Klientka nie wie, jak wygląda Twój gabinet, więc nie wie, czy chce tam wejść.',
    konsekwencjaNieWiem:
      'Przejrzymy zdjęcia i powiemy, które warto wymienić w pierwszej kolejności.',
  },
  {
    klucz: 'czas otwarcia',
    pytanie: 'Czy strona otwiera się na telefonie w mniej niż trzy sekundy?',
    konsekwencjaNie:
      'Wolna strona kosztuje najwięcej tam, gdzie boli najbardziej: przy pierwszym wejściu z Google albo z reklamy.',
    konsekwencjaNieWiem:
      'Zmierzymy czas otwarcia na telefonie i pokażemy, co go wydłuża.',
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
      'Twoja strona robi robotę. Jeśli chcesz, sprawdzimy, czy da się z niej wycisnąć więcej.',
  },
  {
    od: 4,
    tekst: 'Solidna baza i kilka dziur, przez które uciekają rezerwacje.',
  },
  {
    od: 2,
    tekst: 'Strona jest, ale nie sprzedaje. Klientki oglądają i wychodzą.',
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
  'Dostaniesz 3-minutowe wideo z konkretami w 48 godzin. Bez zobowiązań.';

export const ETYKIETY_ODPOWIEDZI: Record<Odpowiedz, string> = {
  tak: 'Tak',
  nie: 'Nie',
  'nie-wiem': 'Nie wiem',
};
