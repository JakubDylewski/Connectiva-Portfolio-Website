/**
 * 05 Proces (SPEC 8.5) — interakcja 7.
 *
 * Jedyna prawdziwa sekwencja na stronie, więc jako jedyna poza licznikiem
 * sekcji jest numerowana (SPEC 13: numeracja tylko tam, gdzie coś naprawdę
 * ma kolejność).
 *
 * Treść wprost z tabeli w SPEC 8.5.
 */

export interface KrokProcesu {
  numer: string;
  tytul: string;
  kiedy: string;
  tresc: string;
}

export const kroki: KrokProcesu[] = [
  {
    numer: '1',
    tytul: 'Rozmowa',
    kiedy: '30 minut',
    tresc:
      'Online albo na żywo w\u00A0Trójmieście. Cel, klientki, konkurencja, systemy, których używasz. Po rozmowie dostajesz cenę końcową, nie „od”.',
  },
  {
    numer: '2',
    tytul: 'Koncept',
    kiedy: 'tydzień 1',
    tresc: 'Struktura strony, kierunek wizualny, plan treści. Jedna runda uwag.',
  },
  {
    numer: '3',
    tytul: 'Projekt',
    kiedy: 'tydzień 2',
    tresc: 'Ekrany główne na telefonie i\u00A0na desktopie. Dwie rundy uwag.',
  },
  {
    numer: '4',
    tytul: 'Budowa',
    kiedy: 'tygodnie 3–4',
    tresc:
      'Kod, treści, zdjęcia, rezerwacja, SEO, testy na prawdziwych telefonach.',
  },
  {
    numer: '5',
    tytul: 'Start i\u00A0opieka',
    kiedy: 'publikacja',
    tresc:
      'Publikacja, godzina szkolenia z\u00A0edycji treści, 30 dni poprawek w\u00A0cenie.',
  },
];
