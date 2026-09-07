/**
 * 04 Jak pracujemy (SPEC 17.7) — interakcja 7.
 *
 * Jedyna prawdziwa sekwencja na stronie, więc jako jedyna poza licznikiem
 * sekcji jest numerowana (SPEC 13: numeracja tylko tam, gdzie coś naprawdę
 * ma kolejność).
 *
 * Rewizja v2: bez sztywnych terminów. Znikają „cztery tygodnie", „tydzień 1"
 * i „30 dni poprawek" jako liczba — zakres, cenę i harmonogram ustalamy po
 * rozmowie, osobno dla każdego projektu (17.1, 17.7). Zasady płatności też
 * nie mieszkają w tej sekcji: trafiają na /cennik/ i do FAQ (Etapy 12 i 14).
 *
 * Treść wprost z tabeli w SPEC 17.7.
 */

export interface KrokProcesu {
  numer: string;
  tytul: string;
  tresc: string;
}

export const kroki: KrokProcesu[] = [
  {
    numer: '1',
    tytul: 'Rozmowa',
    tresc:
      'Online albo na żywo. Cel, klientki, konkurencja, systemy, których ' +
      'używasz. Po rozmowie dostajesz konkretną wycenę i\u00A0termin — jedno ' +
      'i\u00A0drugie ustalone pod Twój projekt.',
  },
  {
    numer: '2',
    tytul: 'Koncept',
    tresc:
      'Struktura strony, kierunek wizualny, plan treści. Wiesz, co powstanie, ' +
      'zanim cokolwiek zakodujemy.',
  },
  {
    numer: '3',
    tytul: 'Projekt',
    tresc:
      'Ekrany na telefonie i\u00A0na komputerze. Zgłaszasz uwagi, poprawiamy, ' +
      'akceptujesz.',
  },
  {
    numer: '4',
    tytul: 'Budowa',
    tresc:
      'Kod, treści, Twoje zdjęcia, rezerwacja, lokalne SEO. Testy na ' +
      'prawdziwych telefonach, nie tylko w\u00A0przeglądarce.',
  },
  {
    numer: '5',
    tytul: 'Start',
    tresc:
      'Publikacja, szkolenie z\u00A0edycji treści, ustalony okres poprawek ' +
      'po starcie.',
  },
];
