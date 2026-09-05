/**
 * Trzy projekty pokazowe (SPEC 8.1).
 *
 * Jedno źródło prawdy dla sekcji 01 na stronie głównej i dla podstron
 * `/projekty/[slug]/` z Etapu 7. Treść pochodzi wprost z tabeli w SPEC 8.1.
 *
 * UCZCIWOŚĆ (SPEC 15): to są marki fikcyjne i każde ich wystąpienie musi mieć
 * etykietę „Projekt pokazowy (marka fikcyjna)". Liczby poniżej to wyłącznie
 * fakty strukturalne — liczba podstron, kategorii i stron lokalnego SEO —
 * które da się sprawdzić w sitemapie dema. Żadnych klientek, rezerwacji
 * ani opinii.
 */
import aureliaMobile from '../assets/shots/aurelia-mobile.webp';
import aureliaDesktop from '../assets/shots/aurelia-desktop.webp';
import elaraMobile from '../assets/shots/elara-mobile.webp';
import elaraDesktop from '../assets/shots/elara-desktop.webp';
import halickaMobile from '../assets/shots/halicka-mobile.webp';
import halickaDesktop from '../assets/shots/halicka-desktop.webp';

import type { Segment } from '../scripts/segment';

export interface Projekt {
  slug: 'aurelia' | 'elara' | 'halicka';
  nazwa: string;
  /** Segment rynku, słownie. */
  segment: string;
  /** Klucz chipa „Dla kogo" z hero (SPEC 8.0) — spina chipy z projektami. */
  segmentKlucz: Segment;
  problem: string;
  rozwiazanie: string;
  /** Fakty strukturalne, sprawdzalne w demie. */
  liczby: string[];
  /**
   * Wyniki Lighthouse. Podajemy je dopiero z datą pomiaru (SPEC 8.1 i 15) —
   * dopóki `lighthouseDate` jest `null`, sekcja ich nie pokazuje.
   */
  lighthouse: string[];
  /** Data pomiaru w formacie `RRRR-MM-DD`. TODO Jakub: zmierzyć i wpisać. */
  lighthouseDate: string | null;
  caseStudy: string;
  demo: string;
  /** Nazwa hosta dema — pokazywana przy linku, żeby było widać dokąd prowadzi. */
  demoEtykieta: string;
  /** Token przebarwienia sekcji (SPEC 4, 10.6). */
  tint: string;
  zrzutMobile: ImageMetadata;
  zrzutDesktop: ImageMetadata;
  /** Alt zrzutu (SPEC 11.3). */
  altMobile: string;
}

/** Etykieta obowiązkowa przy każdym wystąpieniu dema (SPEC 8.1, 15). */
export const ETYKIETA_POKAZOWA = 'Projekt pokazowy (marka fikcyjna)';

export const projekty: Projekt[] = [
  {
    slug: 'aurelia',
    nazwa: 'Klinika Aurelia',
    segment: 'Klinika medycyny estetycznej (lekarska)',
    segmentKlucz: 'klinika',
    problem:
      'Pacjentka nie wie, który zabieg rozwiąże jej problem — i nie wolno jej niczego „reklamować”.',
    rozwiazanie:
      'Moduł „Dobierz zabieg”: od problemu do konsultacji, językiem informacyjnym zgodnym z art. 14.',
    liczby: ['36 podstron', '12 zabiegów', '15 stron lokalnego SEO'],
    lighthouse: ['Lighthouse 95–100'],
    lighthouseDate: null,
    caseStudy: '/projekty/aurelia/',
    demo: 'https://aurelia-beauty-demo.pages.dev/',
    demoEtykieta: 'aurelia-beauty-demo.pages.dev',
    tint: 'var(--color-tint-aurelia)',
    zrzutMobile: aureliaMobile,
    zrzutDesktop: aureliaDesktop,
    altMobile:
      'Strona główna projektu pokazowego Klinika Aurelia na telefonie',
  },
  {
    slug: 'elara',
    nazwa: 'ELARA Instytut Urody',
    segment: 'Salon beauty',
    segmentKlucz: 'salon',
    problem:
      'Pięćdziesiąt usług i klientka, która chce znaleźć swoją w trzy sekundy.',
    rozwiazanie:
      'Cennik z filtrem na żywo, vouchery i pakiety, rezerwacja z kontekstem wybranej usługi.',
    liczby: ['27 podstron', '6 kategorii', '10 stron lokalnego SEO'],
    lighthouse: ['Lighthouse 98–100'],
    lighthouseDate: null,
    caseStudy: '/projekty/elara/',
    demo: 'https://elara-beauty-demo.pages.dev/',
    demoEtykieta: 'elara-beauty-demo.pages.dev',
    tint: 'var(--color-tint-elara)',
    zrzutMobile: elaraMobile,
    zrzutDesktop: elaraDesktop,
    altMobile:
      'Strona główna projektu pokazowego ELARA Instytut Urody na telefonie',
  },
  {
    slug: 'halicka',
    nazwa: 'HALICKA Kosmetologia Estetyczna',
    segment: 'Gabinet kosmetologii, marka osobista',
    segmentKlucz: 'kosmetologia',
    problem:
      'Kosmetolożka sprzedaje programy w seriach, a nie pojedyncze zabiegi.',
    rozwiazanie:
      '„Karta Twojej Skóry”: 7 pytań, raport i lead z pełnym profilem; programy z osią czasu wizyt.',
    liczby: ['29 podstron', '15 stron lokalnego SEO'],
    lighthouse: ['Lighthouse 95–100', 'dostępność 100'],
    lighthouseDate: null,
    caseStudy: '/projekty/halicka/',
    demo: 'https://halicka-kosmetologia-demo.pages.dev/',
    demoEtykieta: 'halicka-kosmetologia-demo.pages.dev',
    tint: 'var(--color-tint-halicka)',
    zrzutMobile: halickaMobile,
    zrzutDesktop: halickaDesktop,
    altMobile:
      'Strona główna projektu pokazowego HALICKA Kosmetologia Estetyczna na telefonie',
  },
];

/** Projekt odpowiadający chipowi segmentu z hero. */
export function projektDlaSegmentu(segment: Segment): Projekt | undefined {
  return projekty.find((p) => p.segmentKlucz === segment);
}
