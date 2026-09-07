/**
 * 06 Pytania (SPEC 8.7, zmiany rewizji v2 w 17.8).
 *
 * Osiem pytań z pełnymi odpowiedziami. Ten sam zestaw zasila akordeon na
 * stronie głównej i dane strukturalne `FAQPage` (SPEC 11.2).
 *
 * Rewizja v2: bez sztywnego terminu realizacji (termin po rozmowie, do
 * umowy), płatność etapami z fakturą za każdy etap, uczciwa odpowiedź
 * o zdjęciach — sesja nie wchodzi w zakres (17.6, 17.8).
 */
import type { PozycjaAkordeonu } from '../components/Accordion.astro';

export const faq: PozycjaAkordeonu[] = [
  {
    tytul: 'Ile trwa realizacja?',
    tresc:
      'To zależy od zakresu — wizytówka powstaje szybciej niż rozbudowany ' +
      'serwis z\u00A0systemem rezerwacji i\u00A0stronami pod kilka miejscowości. ' +
      'Konkretny termin dostajesz po rozmowie, razem z\u00A0wyceną, ' +
      'i\u00A0wpisujemy go do umowy.',
  },
  {
    tytul: 'Mam Booksy. Muszę z\u00A0niego rezygnować?',
    tresc:
      'Nie. Wpinamy kalendarz Booksy w\u00A0Twoją stronę, więc rezerwacje ze strony ' +
      'trafiają do Twojego kalendarza. Marketplace Booksy działa dalej na swoich ' +
      'zasadach — Ty decydujesz, z\u00A0czego korzystasz.',
  },
  {
    // DO POTWIERDZENIA (SPEC 17.11, pkt 5): czy klientka dostaje panel CMS
    // (Keystatic / Decap), czy zmiany idą wyłącznie przez opiekę. Poniżej
    // wersja ze SPEC 8.7 — zakłada godzinne szkolenie plus opiekę. Jeśli
    // zapadnie decyzja o panelu, to zdanie trzeba przepisać.
    tytul: 'Będę mogła sama zmieniać treści?',
    tresc:
      'Cennik, godziny, zespół i\u00A0aktualności zmieniasz sama po godzinnym ' +
      'szkoleniu albo zgłaszasz zmiany nam w\u00A0ramach opieki — wykonujemy je ' +
      'w\u00A0ciągu jednego dnia roboczego.',
  },
  {
    // Uczciwa odpowiedź o zdjęciach — treść dosłownie ze SPEC 17.8.
    tytul: 'Robicie zdjęcia?',
    tresc:
      'Nie. Pracujemy na Twoich zdjęciach — wnętrza, zespołu, efektów. ' +
      'Jeśli ich nie masz albo Ci się nie podobają, podpowiemy, jak zrobić ' +
      'dobre zdjęcia telefonem, albo polecimy fotografa. Sesja nie wchodzi ' +
      'w\u00A0zakres projektu i\u00A0płacisz za nią osobno, bezpośrednio fotografowi.',
  },
  {
    tytul: 'Dostanę fakturę?',
    tresc:
      'Tak. Płacisz etapami i\u00A0za każdy zakończony etap dostajesz fakturę.',
  },
  {
    tytul: 'Do kogo należy strona?',
    tresc:
      'Do Ciebie: kod, treści, domena, zdjęcia. Możesz ją przenieść ' +
      'w\u00A0każdej chwili, bez naszej zgody.',
  },
  {
    tytul: 'Jestem lekarzem. Strona nie złamie zakazu reklamy?',
    tresc:
      'Strony dla podmiotów leczniczych piszemy językiem informacyjnym: zakres ' +
      'świadczeń, kwalifikacje, przebieg zabiegu, przeciwwskazania. Bez ocen, ' +
      'promocji i\u00A0przed/po. Przy wątpliwościach rekomendujemy konsultację ' +
      'prawną — praktyka izb bywa aktualizowana.',
  },
  {
    tytul: 'Prowadzicie reklamy i\u00A0social media?',
    tresc:
      'Nie. Budujemy stronę i\u00A0system, do którego reklamy mają prowadzić. ' +
      'Przy kampanii możemy przygotować dedykowane lądowisko.',
  },
];
