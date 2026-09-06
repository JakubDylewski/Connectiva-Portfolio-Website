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
      'Pacjentka nie wie, który zabieg rozwiąże jej problem — i\u00A0nie wolno jej niczego „reklamować”.',
    rozwiazanie:
      'Moduł „Dobierz zabieg”: od problemu do konsultacji, językiem informacyjnym zgodnym z\u00A0art. 14.',
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
      'Pacjentka przychodzi z\u00A0problemem — zmarszczki, utrata objętości, ' +
      'zmiany skórne — a\u00A0nie z\u00A0nazwą zabiegu. Klinika jest podmiotem ' +
      'leczniczym, więc nie może swoich świadczeń reklamować. Strona musi ' +
      'doprowadzić do konsultacji samą informacją.',
    zbudowalismy: [
      'Moduł „Dobierz zabieg”: pacjentka zaznacza problem, a\u00A0strona prowadzi ją do właściwego zabiegu i\u00A0konsultacji.',
      '12 podstron zabiegowych w\u00A0trzech kategoriach: twarz, usta, skóra.',
      'Język informacyjny pisany pod art. 14 ustawy o\u00A0działalności leczniczej: zakres świadczeń i\u00A0przebieg zabiegów zamiast obietnic i\u00A0promocji.',
      'Ścieżka „Pierwsza wizyta” — pacjentka wie, jak wygląda konsultacja, zanim ją zarezerwuje.',
      'Jawny cennik z\u00A0konsultacją odliczaną od ceny zabiegu.',
      '15 stron lokalnego SEO na frazy „zabieg + miasto”.',
      '36 podstron w\u00A0jednej spójnej strukturze — do sprawdzenia w\u00A0sitemapie dema.',
    ],
    dlaKogo:
      'Ten układ jest wzorem dla kliniki medycyny estetycznej i\u00A0każdego ' +
      'podmiotu leczniczego, który musi budować zaufanie informacją, ' +
      'a\u00A0nie reklamą.',
    seoTytul:
      'Klinika Aurelia — projekt pokazowy strony kliniki medycyny estetycznej — Connectiva',
    seoOpis:
      'Projekt pokazowy strony kliniki medycyny estetycznej: moduł ' +
      '„Dobierz zabieg”, 12 podstron zabiegowych, teksty pisane pod art. 14. ' +
      'Marka fikcyjna, demo otwiera się w\u00A0przeglądarce.',
  },
  {
    slug: 'elara',
    nazwa: 'ELARA Instytut Urody',
    segment: 'Salon beauty',
    segmentKlucz: 'salon',
    problem:
      'Pięćdziesiąt usług i\u00A0klientka, która chce znaleźć swoją w\u00A0trzy sekundy.',
    rozwiazanie:
      'Cennik z\u00A0filtrem na żywo, vouchery i\u00A0pakiety, rezerwacja z\u00A0kontekstem wybranej usługi.',
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
      'Kilkadziesiąt usług w\u00A0sześciu kategoriach i\u00A0klientka, która ogląda ' +
      'na telefonie w\u00A0wolnej chwili. Jeśli nie znajdzie swojej usługi ' +
      'w\u00A0trzy sekundy, wychodzi. Cennik, vouchery i\u00A0rezerwacja muszą ' +
      'pracować razem, a\u00A0nie obok siebie.',
    zbudowalismy: [
      'Cennik z\u00A0filtrem na żywo: klientka zawęża listę usług do swojej w\u00A0trzy sekundy.',
      '6 kategorii usług — od pielęgnacji twarzy po makijaż — każda z\u00A0własną stroną.',
      'Vouchery podarunkowe z\u00A0osobną podstroną: prezent do kupienia bez telefonu do salonu.',
      'Promocje miesiąca łączące zabiegi w\u00A0pakiety.',
      'Rezerwacja z\u00A0kontekstem: link niesie parametry wybranej usługi, więc formularz wie, z\u00A0czym klientka przychodzi.',
      '10 stron lokalnego SEO na frazy „usługa + miasto”.',
      '27 podstron w\u00A0jednej spójnej strukturze — do sprawdzenia w\u00A0sitemapie dema.',
    ],
    dlaKogo:
      'Ten układ jest wzorem dla salonu beauty z\u00A0długą kartą usług, ' +
      'w\u00A0którym klientka ma znaleźć swoją w\u00A0trzy sekundy.',
    seoTytul:
      'ELARA Instytut Urody — projekt pokazowy strony salonu beauty — Connectiva',
    seoOpis:
      'Projekt pokazowy strony salonu beauty: cennik z\u00A0filtrem na żywo, ' +
      '6 kategorii usług, vouchery i\u00A0rezerwacja z\u00A0kontekstem wybranej usługi. ' +
      'Marka fikcyjna, demo otwiera się w\u00A0przeglądarce.',
  },
  {
    slug: 'halicka',
    nazwa: 'HALICKA Kosmetologia Estetyczna',
    segment: 'Gabinet kosmetologii, marka osobista',
    segmentKlucz: 'kosmetologia',
    problem:
      'Kosmetolożka sprzedaje programy w\u00A0seriach, a\u00A0nie pojedyncze zabiegi.',
    rozwiazanie:
      '„Karta Twojej Skóry”: 7 pytań, raport i\u00A0lead z\u00A0pełnym profilem; programy z\u00A0osią czasu wizyt.',
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
      'w\u00A0zaplanowanym rytmie, a\u00A0nie jedno spotkanie. Strona nastawiona na ' +
      'pojedynczą rezerwację tego nie sprzeda. Trzeba pokazać przebieg ' +
      'w\u00A0czasie i\u00A0zebrać zgłoszenie z\u00A0pełnym profilem skóry.',
    zbudowalismy: [
      '„Karta Twojej Skóry”: 7 pytań, minuta wypełniania, na końcu profil skóry i\u00A0priorytety kuracji.',
      'Lead z\u00A0pełnym profilem: zgłoszenie trafia do kosmetolożki razem z\u00A0odpowiedziami, a\u00A0nie jako sam numer telefonu.',
      'Programy kuracji z\u00A0osią czasu wizyt: liczba spotkań i\u00A0rytm rozpisane z\u00A0góry.',
      'Diagnoza skóry odliczana od ceny programu — niski próg wejścia.',
      'Nabór do programów z\u00A0realnym limitem miejsc, aktualizowanym ręcznie.',
      '15 stron lokalnego SEO na frazy „zabieg + miasto”.',
      '29 podstron zbudowanych wokół marki osobistej — do sprawdzenia w\u00A0sitemapie dema.',
    ],
    dlaKogo:
      'Ten układ jest wzorem dla gabinetu kosmetologii i\u00A0marki osobistej, ' +
      'która sprzedaje programy kuracji, a\u00A0nie pojedyncze wizyty.',
    seoTytul:
      'HALICKA Kosmetologia Estetyczna — projekt pokazowy strony gabinetu kosmetologii — Connectiva',
    seoOpis:
      'Projekt pokazowy strony gabinetu kosmetologii: „Karta Twojej Skóry” ' +
      'z\u00A0raportem, programy kuracji z\u00A0osią czasu wizyt i\u00A0lokalne SEO. ' +
      'Marka fikcyjna, demo otwiera się w\u00A0przeglądarce.',
  },
];

/** Projekt odpowiadający chipowi segmentu z hero. */
export function projektDlaSegmentu(segment: Segment): Projekt | undefined {
  return projekty.find((p) => p.segmentKlucz === segment);
}
