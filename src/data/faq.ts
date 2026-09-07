/**
 * 07 Pytania (SPEC 8.7).
 *
 * Osiem pytań z pełnymi odpowiedziami. Ten sam zestaw zasila akordeon na
 * stronie głównej i dane strukturalne `FAQPage` (SPEC 11.2), a pozycje
 * oznaczone `oCene` trafiają dodatkowo na `/cennik/`.
 */
import type { PozycjaAkordeonu } from '../components/Accordion.astro';

export interface PytanieFaq extends PozycjaAkordeonu {
  /** Pokazywane także w sekcji „Pytania o cenę" na `/cennik/`. */
  oCene?: boolean;
}

export const faq: PytanieFaq[] = [
  {
    tytul: 'Ile trwa realizacja?',
    tresc:
      'Cztery tygodnie od dnia, w\u00A0którym mamy teksty źródłowe i\u00A0zdjęcia. ' +
      'Przy większym zakresie (12 podstron, 15 stron SEO) pięć.',
  },
  {
    tytul: 'Mam Booksy. Muszę z\u00A0niego rezygnować?',
    tresc:
      'Nie. Wpinamy kalendarz Booksy w\u00A0Twoją stronę, więc rezerwacje ze strony ' +
      'trafiają do Twojego kalendarza. Marketplace Booksy działa dalej na swoich ' +
      'zasadach — Ty decydujesz, z\u00A0czego korzystasz.',
  },
  {
    // DO POTWIERDZENIA (SPEC 16, decyzja otwarta nr 4): czy klientka dostaje
    // panel CMS (Keystatic / Decap), czy zmiany idą wyłącznie przez opiekę.
    // Poniżej wersja ze SPEC 8.7 — zakłada godzinne szkolenie plus opiekę.
    // Jeśli zapadnie decyzja o panelu, to zdanie trzeba przepisać, a wraz
    // z nim zakres „godziny szkolenia" w cenniku.
    tytul: 'Będę mogła sama zmieniać treści?',
    tresc:
      'Cennik, godziny, zespół i\u00A0aktualności zmieniasz sama po godzinnym ' +
      'szkoleniu albo zgłaszasz zmiany nam w\u00A0ramach opieki — wykonujemy je ' +
      'w\u00A0ciągu jednego dnia roboczego.',
  },
  {
    tytul: 'Dostanę fakturę?',
    tresc: 'Tak, na każdą z\u00A0trzech części płatności.',
    oCene: true,
  },
  {
    tytul: 'Do kogo należy strona?',
    tresc:
      'Do Ciebie: kod, treści, domena, zdjęcia z\u00A0sesji. Możesz ją przenieść ' +
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
  // Pytanie „Moje miasto jest zajęte. Co wtedy?” usunięte w rewizji v2
  // (SPEC 17.1, 17.8) — wyłączność geograficzna wypadła z oferty.
  {
    tytul: 'Prowadzicie reklamy i\u00A0social media?',
    tresc:
      'Nie. Budujemy stronę i\u00A0system, do którego reklamy mają prowadzić. ' +
      'Przy kampanii możemy przygotować dedykowane lądowisko.',
  },
];

/** Pytania pokazywane w sekcji „Pytania o cenę" na `/cennik/`. */
export const faqOCene = faq.filter((p) => p.oCene);
