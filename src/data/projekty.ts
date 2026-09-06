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
  /** Alt zrzutu desktopowego na podstronie case study (SPEC 9.1, 11.3). */
  altDesktop: string;

  /* --- Podstrona case study (SPEC 9.1, Etap 7) --------------------------- */

  /** „Wyzwanie" — 2–3 zdania, rozwinięcie `problem` z tabeli 8.1. */
  wyzwanie: string;
  /**
   * „Co zbudowaliśmy" — 6–8 punktów. Wyłącznie rzeczy, które naprawdę są
   * w demie i które da się tam sprawdzić (SPEC 15) — bez obietnic i liczb,
   * których nie ma skąd wziąć.
   */
  zbudowalismy: string[];
  /** „Dla kogo to wzór" — jedno zdanie do segmentu (SPEC 9.1). */
  dlaKogo: string;
  /** Tytuł strony wg wzoru ze SPEC 11.2. */
  seoTytul: string;
  /** Opis meta podstrony. */
  seoOpis: string;
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
    altDesktop:
      'Strona główna projektu pokazowego Klinika Aurelia na desktopie',
    wyzwanie:
      'Pacjentka przychodzi z problemem — zmarszczki, utrata objętości, ' +
      'zmiany skórne — a nie z nazwą zabiegu. Klinika jest podmiotem ' +
      'leczniczym, więc nie może swoich świadczeń reklamować. Strona musi ' +
      'doprowadzić do konsultacji samą informacją.',
    zbudowalismy: [
      'Moduł „Dobierz zabieg”: pacjentka zaznacza problem, a strona prowadzi ją do właściwego zabiegu i konsultacji.',
      '12 podstron zabiegowych w trzech kategoriach: twarz, usta, skóra.',
      'Język informacyjny pisany pod art. 14 ustawy o działalności leczniczej: zakres świadczeń i przebieg zabiegów zamiast obietnic i promocji.',
      'Ścieżka „Pierwsza wizyta” — pacjentka wie, jak wygląda konsultacja, zanim ją zarezerwuje.',
      'Jawny cennik z konsultacją odliczaną od ceny zabiegu.',
      '15 stron lokalnego SEO na frazy „zabieg + miasto”.',
      '36 podstron w jednej spójnej strukturze — do sprawdzenia w sitemapie dema.',
    ],
    dlaKogo:
      'Ten układ jest wzorem dla kliniki medycyny estetycznej i każdego ' +
      'podmiotu leczniczego, który musi budować zaufanie informacją, ' +
      'a nie reklamą.',
    seoTytul:
      'Klinika Aurelia — projekt pokazowy strony kliniki medycyny estetycznej — Connectiva',
    seoOpis:
      'Projekt pokazowy strony kliniki medycyny estetycznej: moduł ' +
      '„Dobierz zabieg”, 12 podstron zabiegowych, teksty pisane pod art. 14. ' +
      'Marka fikcyjna, demo otwiera się w przeglądarce.',
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
    altDesktop:
      'Strona główna projektu pokazowego ELARA Instytut Urody na desktopie',
    wyzwanie:
      'Kilkadziesiąt usług w sześciu kategoriach i klientka, która ogląda ' +
      'na telefonie w wolnej chwili. Jeśli nie znajdzie swojej usługi ' +
      'w trzy sekundy, wychodzi. Cennik, vouchery i rezerwacja muszą ' +
      'pracować razem, a nie obok siebie.',
    zbudowalismy: [
      'Cennik z filtrem na żywo: klientka zawęża listę usług do swojej w trzy sekundy.',
      '6 kategorii usług — od pielęgnacji twarzy po makijaż — każda z własną stroną.',
      'Vouchery podarunkowe z osobną podstroną: prezent do kupienia bez telefonu do salonu.',
      'Promocje miesiąca łączące zabiegi w pakiety.',
      'Rezerwacja z kontekstem: link niesie parametry wybranej usługi, więc formularz wie, z czym klientka przychodzi.',
      '10 stron lokalnego SEO na frazy „usługa + miasto”.',
      '27 podstron w jednej spójnej strukturze — do sprawdzenia w sitemapie dema.',
    ],
    dlaKogo:
      'Ten układ jest wzorem dla salonu beauty z długą kartą usług, ' +
      'w którym klientka ma znaleźć swoją w trzy sekundy.',
    seoTytul:
      'ELARA Instytut Urody — projekt pokazowy strony salonu beauty — Connectiva',
    seoOpis:
      'Projekt pokazowy strony salonu beauty: cennik z filtrem na żywo, ' +
      '6 kategorii usług, vouchery i rezerwacja z kontekstem wybranej usługi. ' +
      'Marka fikcyjna, demo otwiera się w przeglądarce.',
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
    altDesktop:
      'Strona główna projektu pokazowego HALICKA Kosmetologia Estetyczna na desktopie',
    wyzwanie:
      'Kosmetolożka pracuje seriami: program kuracji to kilka wizyt ' +
      'w zaplanowanym rytmie, a nie jedno spotkanie. Strona nastawiona na ' +
      'pojedynczą rezerwację tego nie sprzeda. Trzeba pokazać przebieg ' +
      'w czasie i zebrać zgłoszenie z pełnym profilem skóry.',
    zbudowalismy: [
      '„Karta Twojej Skóry”: 7 pytań, minuta wypełniania, na końcu profil skóry i priorytety kuracji.',
      'Lead z pełnym profilem: zgłoszenie trafia do kosmetolożki razem z odpowiedziami, a nie jako sam numer telefonu.',
      'Programy kuracji z osią czasu wizyt: liczba spotkań i rytm rozpisane z góry.',
      'Diagnoza skóry odliczana od ceny programu — niski próg wejścia.',
      'Nabór do programów z realnym limitem miejsc, aktualizowanym ręcznie.',
      '15 stron lokalnego SEO na frazy „zabieg + miasto”.',
      '29 podstron zbudowanych wokół marki osobistej — do sprawdzenia w sitemapie dema.',
    ],
    dlaKogo:
      'Ten układ jest wzorem dla gabinetu kosmetologii i marki osobistej, ' +
      'która sprzedaje programy kuracji, a nie pojedyncze wizyty.',
    seoTytul:
      'HALICKA Kosmetologia Estetyczna — projekt pokazowy strony gabinetu kosmetologii — Connectiva',
    seoOpis:
      'Projekt pokazowy strony gabinetu kosmetologii: „Karta Twojej Skóry” ' +
      'z raportem, programy kuracji z osią czasu wizyt i lokalne SEO. ' +
      'Marka fikcyjna, demo otwiera się w przeglądarce.',
  },
];

/** Projekt odpowiadający chipowi segmentu z hero. */
export function projektDlaSegmentu(segment: Segment): Projekt | undefined {
  return projekty.find((p) => p.segmentKlucz === segment);
}
