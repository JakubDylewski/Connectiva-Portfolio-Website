/**
 * Warstwa ruchu (SPEC 10).
 *
 * Zasady, które ten plik egzekwuje:
 *  · jedna instancja Lenis, jeden `gsap.ticker`, wszystko w `gsap.context()`,
 *    żeby `destroyMotion()` zdejmował całość jednym `revert()` (SPEC 10.1);
 *  · trzy konteksty `gsap.matchMedia()` — desktop, mobile, ograniczony ruch;
 *  · animujemy wyłącznie `transform`, `opacity` i `clip-path` sekwencji
 *    otwarcia; nic z `height` / `width` / `top` w pętli scrolla (SPEC 10.2);
 *  · poza sekwencją hero żadna sekcja nie wjeżdża sama (SPEC 10.2).
 *
 * GSAP ładuje się dynamicznie. Lenis dodatkowo tylko wtedy, gdy ruch jest
 * dozwolony — przy `prefers-reduced-motion: reduce` nie pobiera się wcale.
 */

import { ZDARZENIE_MENU, type MenuDetail } from './nav';
import { ZDARZENIE_UKLAD } from './forms';
import {
  ZDARZENIE_PRZEWIN,
  ZDARZENIE_SEGMENT,
  type PrzewinDetail,
  type SegmentDetail,
} from './segment';

type Sprzatanie = () => void;

let sprzatanie: Sprzatanie[] = [];
let uruchomione = false;

/**
 * Numer pokolenia inicjalizacji (Etap 8). Nawigacja View Transitions może
 * zdjąć stronę w środku któregoś z awaitów `initMotion()` — porównanie
 * pokolenia po każdym awaicie pozwala porzucić spóźnioną inicjalizację,
 * zanim stworzy drugą instancję Lenis albo triggery dla nieistniejącego DOM.
 */
let generacja = 0;

/** Licznik żywych instancji Lenis — diagnostyka testu krytycznego Etapu 8. */
let aktywneLenis = 0;

/**
 * Uchwyt diagnostyczny wystawiany na `window.__connectiva` (Etap 8, test
 * krytyczny): po trzech nawigacjach liczba `ScrollTrigger.getAll()` musi być
 * równa liczbie po świeżym załadowaniu. Kod strony z tego nie korzysta.
 */
interface Diagnostyka {
  ScrollTrigger: ST;
  inicjalizacje: number;
  aktywneLenis: () => number;
}

/**
 * Aktywna instancja Lenis — potrzebna tam, gdzie przewijamy programowo
 * (chipy segmentu). `null`, gdy ruch jest ograniczony i Lenis nie wstał.
 */
type LenisInstancja = InstanceType<typeof import('lenis').default>;
let lenisInstancja: LenisInstancja | null = null;

/** Dosuwa scroll do elementu z `location.hash` — patrz wywołanie w `initMotion`. */
function poprawKotwiceZAdresu(): void {
  const hash = window.location.hash;
  if (hash.length < 2) return;

  let cel: HTMLElement | null = null;
  try {
    cel = document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return;
  }
  if (!cel) return;

  if (lenisInstancja) {
    lenisInstancja.scrollTo(cel, { offset: ODSUNIECIE_KOTWICY, immediate: true });
  } else {
    cel.scrollIntoView({ block: 'start' });
  }
}

/** Przewija do elementu albo do pozycji w pikselach — przez Lenis, gdy działa. */
function przewinDoCelu(cel: number | HTMLElement): void {
  if (lenisInstancja) {
    lenisInstancja.scrollTo(cel, {
      offset: typeof cel === 'number' ? 0 : ODSUNIECIE_KOTWICY,
    });
    return;
  }
  if (typeof cel === 'number') window.scrollTo({ top: cel });
  else cel.scrollIntoView({ block: 'start' });
}

/** Konteksty z SPEC 10.1. */
const DESKTOP = '(prefers-reduced-motion: no-preference) and (min-width: 1024px)';
const MOBILE = '(prefers-reduced-motion: no-preference) and (max-width: 1023px)';
const REDUCE = '(prefers-reduced-motion: reduce)';

/** Odsunięcie kotwic o wysokość belki. */
const ODSUNIECIE_KOTWICY = -80;

export function ograniczonyRuch(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export async function initMotion(): Promise<void> {
  if (typeof window === 'undefined' || uruchomione) return;
  uruchomione = true;
  const moja = ++generacja;

  const de = document.documentElement;
  const reduce = ograniczonyRuch();

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  // Strona zdążyła się zmienić (View Transitions) — nowa inicjalizacja
  // albo już biegnie, albo zaraz ruszy. Ta nie stworzyła jeszcze niczego.
  if (moja !== generacja) return;
  gsap.registerPlugin(ScrollTrigger);

  if (!reduce) {
    await wlaczLenis(gsap, ScrollTrigger, moja);
    if (moja !== generacja) return;
  }

  const ctx = gsap.context(() => {
    // Kurczenie belki działa w każdym trybie — to zmiana stanu, nie scrub.
    belka(gsap, ScrollTrigger, reduce);

    const mm = gsap.matchMedia();

    mm.add(DESKTOP, () => {
      // Dwa piny i ani jednego więcej (SPEC 10.2).
      projektyPrzypiete(gsap, ScrollTrigger); // pin 1 z 2
      procesDesktop(gsap); // pin 2 z 2
      paralaksCaseStudy(gsap); // podstrony projektów (SPEC 9.1)
      const sprzatnijMagnetyzm = magnetyzmPrzyciskow(gsap); // SPEC 7.4, Etap 8
      // GSAP sam cofa tweeny i triggery tego kontekstu, ale nasłuchy
      // magnetyzmu na document trzeba zdjąć ręcznie — także przy zwężeniu
      // okna poniżej 1024 px, nie tylko przy destroyMotion().
      return () => sprzatnijMagnetyzm?.();
    });

    mm.add(MOBILE, () => {
      pasekDolny(ScrollTrigger);
      // 17.12: w sekcji Projekty trzy piny SEKWENCYJNE — po jednym na okno
      // dema, nigdy aktywne jednocześnie (w dowolnej chwili scrolla co
      // najwyżej jeden). Limit „2 pinów" z 10.2 dotyczy pinów możliwych do
      // aktywacji w tym samym momencie, nie sumy `pin: true` w kodzie.
      // Przy `data-motion="off"` zamiast pinów działa wersja bez pinowania —
      // funkcje wykluczają się nawzajem atrybutem. Proces bez pinu (17.5).
      projektyMobilePiny(gsap, ScrollTrigger); // 3 piny sekwencyjne (17.12)
      projektyMobileBezPinu(gsap, ScrollTrigger); // wyłącznik awaryjny
      procesMobile(gsap); // bez pinu
    });

    mm.add(REDUCE, () => {
      // Dotyczy też sytuacji, w której ustawienie zmieni się przy otwartej
      // stronie: konteksty bez `reduce` same się wtedy cofają, a my zostawiamy
      // wszystko w stanie końcowym.
      de.dataset.ruch = 'off';
      document.querySelector('[data-pasek]')?.classList.add('jest-widoczny');
    });

    // Pas bezpieczeństwa do szelek `ctx.revert()`: gdyby rewert kontekstu
    // nie sięgnął matchMedia, jawny `revert()` zdejmuje nasłuchy mediów
    // i woła funkcje sprzątające kontekstów. Drugie wywołanie jest puste.
    sprzatanie.push(() => mm.revert());
  });
  sprzatanie.push(() => ctx.revert());

  // Sekwencja startuje dopiero na docelowych fontach, żeby nie animować
  // fallbacku (SPEC 8.0).
  await document.fonts.ready;
  if (moja !== generacja) return;
  if (!reduce) {
    try {
      sekwencjaHero(gsap);
    } catch (blad) {
      // Hero nigdy nie ma prawa zostać niewidoczne przez błąd animacji.
      odslonHero(gsap);
      console.error('[motion] sekwencja otwarcia nie wystartowała', blad);
    }
  }

  // Geometrię mierzymy raz, po fontach (SPEC 10.2).
  ScrollTrigger.refresh();

  // Wejście z kotwicą w adresie (np. /#kreator z podstrony projektu):
  // przeglądarka albo router przewija do celu, zanim powstaną pin-spacery
  // sekcji przypiętych, więc cel odjeżdża potem w dół o ich wysokość.
  // Po przeliczeniu geometrii dowozimy scroll na miejsce — natychmiast,
  // bez animacji, bo to korekta pozycji, nie efekt.
  poprawKotwiceZAdresu();

  // Wyjątek od „mierzymy raz": gdy sekcja odsłoni coś, czego wcześniej nie
  // było w układzie (werdykt audytu z formularzem), trzeba przeliczyć —
  // inaczej pasek dolny nie wie, że formularz jest już na ekranie (SPEC 7.3).
  const naZmianeUkladu = () => ScrollTrigger.refresh();
  document.addEventListener(ZDARZENIE_UKLAD, naZmianeUkladu);
  sprzatanie.push(() => document.removeEventListener(ZDARZENIE_UKLAD, naZmianeUkladu));

  // Uchwyt diagnostyczny (test krytyczny Etapu 8) — licznik inicjalizacji
  // rośnie tylko wtedy, gdy inicjalizacja doszła do końca.
  const w = window as unknown as { __connectiva?: Diagnostyka };
  w.__connectiva = {
    ScrollTrigger,
    inicjalizacje: (w.__connectiva?.inicjalizacje ?? 0) + 1,
    aktywneLenis: () => aktywneLenis,
  };
}

export function destroyMotion(): void {
  // Unieważnia inicjalizacje wiszące na awaitach — patrz `generacja`.
  generacja += 1;
  for (const zdejmij of sprzatanie.splice(0).reverse()) {
    try {
      zdejmij();
    } catch {
      // Sprzątanie nigdy nie może wywrócić nawigacji.
    }
  }
  uruchomione = false;
}

/* -------------------------------------------------------------------------- */
/* Lenis                                                                      */
/* -------------------------------------------------------------------------- */

async function wlaczLenis(
  gsap: typeof import('gsap').gsap,
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
  moja: number,
): Promise<void> {
  const { default: Lenis } = await import('lenis');
  // Strona wymieniona w trakcie importu — nie tworzymy niczego (Etap 8).
  if (moja !== generacja) return;

  // `syncTouch` zostaje domyślnie wyłączone: na telefonie przewijanie ma być
  // natywne, Lenis tylko raportuje pozycję (SPEC 10.1).
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

  lenisInstancja = lenis;
  aktywneLenis += 1;
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Kotwice prowadzimy przez Lenis, żeby skok do sekcji był tym samym ruchem,
  // co reszta przewijania.
  const naKlik = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = link?.getAttribute('href');
    if (!link || !hash || hash === '#') return;

    const cel = document.querySelector(hash);
    if (!cel) return;

    e.preventDefault();
    lenis.scrollTo(cel as HTMLElement, { offset: ODSUNIECIE_KOTWICY });
    history.pushState(null, '', hash);
  };
  document.addEventListener('click', naKlik);

  // Otwarte menu blokuje przewijanie tła.
  const naMenu = (e: Event) => {
    const { otwarte } = (e as CustomEvent<MenuDetail>).detail;
    if (otwarte) lenis.stop();
    else lenis.start();
  };
  document.addEventListener(ZDARZENIE_MENU, naMenu);

  // Przewijanie proszone przez inne skrypty (np. chipy segmentu).
  const naPrzewin = (e: Event) => {
    const zdarzenie = e as CustomEvent<PrzewinDetail>;
    const cel = document.querySelector(zdarzenie.detail.cel);
    if (!cel) return;
    zdarzenie.preventDefault();
    lenis.scrollTo(cel as HTMLElement, { offset: ODSUNIECIE_KOTWICY });
  };
  document.addEventListener(ZDARZENIE_PRZEWIN, naPrzewin);

  sprzatanie.push(() => {
    document.removeEventListener('click', naKlik);
    document.removeEventListener(ZDARZENIE_MENU, naMenu);
    document.removeEventListener(ZDARZENIE_PRZEWIN, naPrzewin);
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
    lenisInstancja = null;
    aktywneLenis -= 1;
  });
}

/* -------------------------------------------------------------------------- */
/* Belka: kurczenie i linia postępu (SPEC 7.2, 10.4)                          */
/* -------------------------------------------------------------------------- */

function belka(
  gsap: typeof import('gsap').gsap,
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
  reduce: boolean,
): void {
  const el = document.querySelector<HTMLElement>('[data-belka]');
  if (el) {
    ScrollTrigger.create({
      start: 80,
      end: () => ScrollTrigger.maxScroll(window),
      onToggle: (self) => el.classList.toggle('is-scrolled', self.isActive),
    });
  }

  // Linia postępu to scrub — przy ograniczonym ruchu jej nie tworzymy,
  // a CSS ją wtedy chowa (pusta kreska nic nie mówi).
  const linia = document.querySelector<HTMLElement>('[data-postep]');
  if (linia && !reduce) {
    gsap.to(linia, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        start: 0,
        end: () => ScrollTrigger.maxScroll(window),
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Pasek dolny na mobile (SPEC 7.3, 10.5)                                     */
/* -------------------------------------------------------------------------- */

function pasekDolny(
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
): void {
  const pasek = document.querySelector<HTMLElement>('[data-pasek]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!pasek) return;

  // Bez hero (podstrony) pasek jest widoczny od razu — nie ma czego czekać.
  if (!hero) {
    pasek.classList.add('jest-widoczny');
  } else {
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top+=64',
      onEnter: () => pasek.classList.add('jest-widoczny'),
      onLeaveBack: () => pasek.classList.remove('jest-widoczny'),
    });
  }

  // Chowaniem paska przy formularzach zajmuje się `initPasekPrzyFormularzach`
  // w `forms.ts` — przez IntersectionObserver, żeby działało również przy
  // ograniczonym ruchu, gdzie ten kontekst w ogóle nie startuje (SPEC 7.3).
}

/* -------------------------------------------------------------------------- */
/* 01 Projekty (SPEC 8.1, 10.6)                                               */
/* -------------------------------------------------------------------------- */

type Gsap = typeof import('gsap').gsap;
type ST = typeof import('gsap/ScrollTrigger').ScrollTrigger;

interface CzesciProjektow {
  sekcja: HTMLElement;
  scena: HTMLElement;
  bloki: HTMLElement[];
  teksty: HTMLElement[];
  zrzuty: HTMLImageElement[];
}

/**
 * Zbiera elementy sekcji. `null`, gdy sekcji nie ma. O tym, który wariant
 * ruchu obowiązuje, decydują wywołujący na podstawie `data-motion` —
 * od 17.5 atrybut przełącza warianty, a nie tylko wyłącza ruch.
 */
function czesciProjektow(): CzesciProjektow | null {
  const sekcja = document.querySelector<HTMLElement>('[data-projekty]');
  if (!sekcja) return null;

  const scena = sekcja.querySelector<HTMLElement>('[data-scena]');
  const bloki = [...sekcja.querySelectorAll<HTMLElement>('[data-blok]')];
  const teksty = [...sekcja.querySelectorAll<HTMLElement>('[data-tekst]')];
  const zrzuty = [...sekcja.querySelectorAll<HTMLImageElement>('[data-zrzut]')];

  if (!scena || bloki.length === 0 || zrzuty.length !== bloki.length) return null;
  return { sekcja, scena, bloki, teksty, zrzuty };
}

/** O ile zrzut może się przesunąć w pionie w obrębie ekranu telefonu. */
function przesuwZrzutu(img: HTMLImageElement, limit = Infinity): number {
  const ekran = img.parentElement;
  if (!ekran) return 0;
  return Math.min(limit, Math.max(0, img.offsetHeight - ekran.clientHeight));
}

/**
 * Przebarwienie tła (SPEC 10.6). `null` gasi wszystkie warstwy — czerń wraca.
 * Tylko `opacity`, więc zmiana idzie przez kompozytor.
 */
function zrobPrzebarwiacz(gsap: Gsap) {
  const warstwy = [...document.querySelectorAll<HTMLElement>('[data-tint]')];
  let aktywna: number | null = null;

  return (i: number | null) => {
    if (i === aktywna) return;
    aktywna = i;
    warstwy.forEach((w, j) => {
      gsap.to(w, {
        opacity: i === j ? 1 : 0,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };
}

/**
 * `will-change` tylko na warstwie, która jest właśnie scrubowana (SPEC 10.2).
 */
function przelacznikWillChange(elementy: HTMLElement[]) {
  return (wlacz: boolean) => {
    for (const el of elementy) el.style.willChange = wlacz ? 'transform' : '';
  };
}

/**
 * Geometria mierzona raz, po zdekodowaniu zrzutów (SPEC 10.2).
 *
 * Nie blokujemy tym tworzenia triggerów: zrzuty mają `loading="lazy"`, więc
 * czekanie na `decode()` przed startem potrafiłoby nie skończyć się nigdy.
 * Wysokość układu i tak jest znana wcześniej, bo `img` ma jawne `width`
 * i `height` — dekodowanie zmienia tylko to, kiedy piksele są gotowe.
 */
function odswiezPoZrzutach(ScrollTrigger: ST, zrzuty: HTMLImageElement[]): void {
  const gotowe = zrzuty.map(
    (img) =>
      new Promise<void>((koniec) => {
        const dekoduj = () => void img.decode().catch(() => {}).then(() => koniec());
        if (img.complete) dekoduj();
        else {
          img.addEventListener('load', dekoduj, { once: true });
          img.addEventListener('error', () => koniec(), { once: true });
        }
      }),
  );
  void Promise.all(gotowe).then(() => ScrollTrigger.refresh());
}

/** Przewinięcie do projektu po dotknięciu chipa segmentu (SPEC 8.0). */
function podepnijChipy(
  bloki: HTMLElement[],
  doPozycji: (i: number) => number | HTMLElement,
): void {
  const naSegment = (e: Event) => {
    const { segment, zDotkniecia, prowadziDoProjektow } = (
      e as CustomEvent<SegmentDetail>
    ).detail;
    // Do projektów prowadzą tylko chipy z hero (`prowadziDoProjektow`) —
    // inne grupy chipów zmieniałyby segment w miejscu, bez przewijania.
    if (!zDotkniecia || !prowadziDoProjektow) return;
    const i = bloki.findIndex((b) => b.dataset.segmentKlucz === segment);
    if (i < 0) return;
    przewinDoCelu(doPozycji(i));
  };
  document.addEventListener(ZDARZENIE_SEGMENT, naSegment);
  sprzatanie.push(() => document.removeEventListener(ZDARZENIE_SEGMENT, naSegment));
}

/**
 * Sekcja przypięta, scrub steruje wszystkim (SPEC 8.1) — TYLKO desktop.
 *
 * Trzy dema pokazują się po kolei w przypiętym kadrze — zrzut przewija się
 * do końca, potem crossfade do następnego, w obie strony. Od 17.12 telefon
 * ma własny wariant (projektyMobilePiny): bloki info w normalnym przepływie
 * i trzy sekwencyjne piny okien. `data-motion="off"` przełącza desktop na
 * statyczny układ pionowy.
 */
function projektyPrzypiete(gsap: Gsap, ScrollTrigger: ST): void {
  const czesci = czesciProjektow();
  if (!czesci || czesci.sekcja.dataset.motion === 'off') return;
  const { scena, bloki, teksty, zrzuty } = czesci;

  const przebarw = zrobPrzebarwiacz(gsap);
  const willChange = przelacznikWillChange(zrzuty);
  let ostatniIndeks = -1;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scena,
      start: 'top top',
      // Jedna jednostka osi czasu = jeden panel (SPEC 8.1: `end: +=300%`).
      end: '+=300%',
      pin: scena,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onEnter: () => willChange(true),
      onEnterBack: () => willChange(true),
      onLeave: () => {
        willChange(false);
        przebarw(null);
      },
      onLeaveBack: () => {
        willChange(false);
        przebarw(null);
      },
      onUpdate: (self) => {
        const i = Math.min(bloki.length - 1, Math.floor(self.progress * bloki.length));
        if (i !== ostatniIndeks) {
          ostatniIndeks = i;
          przebarw(i);
        }
      },
    },
  });

  bloki.forEach((_, i) => {
    // Przewijanie zrzutu wewnątrz ekranu przez cały czas trwania panelu.
    tl.fromTo(
      zrzuty[i],
      { y: 0 },
      { y: () => -przesuwZrzutu(zrzuty[i]), duration: 1 },
      i,
    );

    if (i === 0) return;

    const kiedy = i - 0.18;

    // Zrzuty przenikają się — dwa obrazy na sobie czytają się jak roztopienie.
    tl.to(zrzuty[i - 1], { opacity: 0, duration: 0.26 }, kiedy);
    tl.to(zrzuty[i], { opacity: 1, duration: 0.26 }, kiedy);

    // Teksty po kolei: najpierw znika poprzedni, dopiero potem wchodzi nowy.
    // Przy przenikaniu obie nazwy i oba akapity są przez chwilę czytelne
    // jednocześnie i robi się z tego bałagan.
    tl.to(teksty[i - 1], { opacity: 0, duration: 0.11 }, kiedy);
    tl.to(teksty[i], { opacity: 1, duration: 0.11 }, kiedy + 0.13);
  });

  const st = tl.scrollTrigger;
  podepnijChipy(bloki, (i) => {
    if (!st) return bloki[i];
    // Środek okna danego panelu na osi przewijania.
    return st.start + ((i + 0.4) / bloki.length) * (st.end - st.start);
  });

  odswiezPoZrzutach(ScrollTrigger, zrzuty);
  sprzatanie.push(() => willChange(false));
}

/**
 * Telefon (SPEC 17.12): blok info w normalnym przepływie, potem przypięte
 * okno dema — na przemian, dla trzech dem po kolei.
 *
 * Każde okno (`[data-okno]`) ma własny pin, aktywny tylko na czas
 * przewijania zrzutu: `translateY` od góry do końca, `scrub: 0.8`. Okna są
 * rozdzielone blokami info, więc w dowolnej chwili scrolla przypięte jest
 * co najwyżej jedno — limit z 10.2 dotyczy pinów jednoczesnych (17.12).
 * Po dojechaniu do końca zrzutu okno się odpina i scroll przechodzi do
 * bloku info następnego dema; w górę sekwencja się cofa.
 *
 * Przebarwienie (10.6) przełącza się już przy wejściu w blok info danego
 * dema, nie dopiero przy oknie — trigger obejmuje cały blok (info + okno),
 * więc kolor trzyma się dema aż do wejścia w następny blok.
 */
function projektyMobilePiny(gsap: Gsap, ScrollTrigger: ST): void {
  const czesci = czesciProjektow();
  if (!czesci || czesci.sekcja.dataset.motion === 'off') return;
  const { sekcja, bloki, zrzuty } = czesci;

  const okna = [...sekcja.querySelectorAll<HTMLElement>('[data-okno]')];
  if (okna.length !== bloki.length) return;

  const przebarw = zrobPrzebarwiacz(gsap);

  bloki.forEach((blok, i) => {
    const img = zrzuty[i];
    const willChange = przelacznikWillChange([img]);

    // Długość pinu = droga zrzutu wewnątrz ekranu (limit 1600 px z 10.2
    // obowiązuje bez wyjątku) — piksel scrolla za piksel obrazu.
    gsap.fromTo(
      img,
      { y: 0 },
      {
        y: () => -przesuwZrzutu(img, 1600),
        ease: 'none',
        scrollTrigger: {
          trigger: okna[i],
          start: 'center center',
          end: () => '+=' + przesuwZrzutu(img, 1600),
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          // `will-change` tylko na aktualnie scrubowanym zrzucie (10.2).
          onEnter: () => willChange(true),
          onEnterBack: () => willChange(true),
          onLeave: () => willChange(false),
          onLeaveBack: () => willChange(false),
        },
      },
    );

    // Przebarwienie na cały blok — od bloku info do końca okna (17.12).
    ScrollTrigger.create({
      trigger: blok,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => przebarw(i),
      onEnterBack: () => przebarw(i),
    });

    sprzatanie.push(() => willChange(false));
  });

  // Po wyjściu z sekcji wraca czerń (10.6).
  ScrollTrigger.create({
    trigger: sekcja,
    start: 'top bottom',
    end: 'bottom top',
    onLeave: () => przebarw(null),
    onLeaveBack: () => przebarw(null),
  });

  // Chip segmentu prowadzi do bloku info dema, nie do okna.
  podepnijChipy(bloki, (i) => bloki[i]);
  odswiezPoZrzutach(ScrollTrigger, zrzuty);
}

/**
 * Wyłącznik awaryjny na telefonie (17.5): przy `data-motion="off"` wraca
 * stara wersja mobile — trzy bloki jeden pod drugim BEZ pinu, zrzut
 * przewijany scrubem w obrębie własnego bloku. Zabezpieczenie na wypadek
 * szarpania pinu na słabszych telefonach; decyzję podejmuje Jakub na
 * prawdziwym urządzeniu (10.7).
 */
function projektyMobileBezPinu(gsap: Gsap, ScrollTrigger: ST): void {
  const czesci = czesciProjektow();
  if (!czesci || czesci.sekcja.dataset.motion !== 'off') return;
  const { sekcja, bloki, zrzuty } = czesci;

  const przebarw = zrobPrzebarwiacz(gsap);

  bloki.forEach((blok, i) => {
    const img = zrzuty[i];
    const willChange = przelacznikWillChange([img]);

    gsap.fromTo(
      img,
      { y: 0 },
      {
        // Ruch ograniczony do 1600 px (SPEC 8.1) — na telefonie dłuższy scrub
        // zaczyna szarpać, a i tak nikt tego nie ogląda w całości.
        y: () => -przesuwZrzutu(img, 1600),
        ease: 'none',
        scrollTrigger: {
          trigger: blok,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
          invalidateOnRefresh: true,
          onEnter: () => willChange(true),
          onEnterBack: () => willChange(true),
          onLeave: () => willChange(false),
          onLeaveBack: () => willChange(false),
        },
      },
    );

    // Przebarwienie na blok (SPEC 10.6).
    ScrollTrigger.create({
      trigger: blok,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => przebarw(i),
      onEnterBack: () => przebarw(i),
    });

    sprzatanie.push(() => willChange(false));
  });

  // Po wyjściu z sekcji wraca czerń.
  ScrollTrigger.create({
    trigger: sekcja,
    start: 'top bottom',
    end: 'bottom top',
    onLeave: () => przebarw(null),
    onLeaveBack: () => przebarw(null),
  });

  podepnijChipy(bloki, (i) => bloki[i]);
  odswiezPoZrzutach(ScrollTrigger, zrzuty);
}

/* -------------------------------------------------------------------------- */
/* Case study (SPEC 9.1, Etap 7): lekki paralaks zrzutu mobile                */
/* -------------------------------------------------------------------------- */

/**
 * Czysta dekoracja na podstronie projektu — telefon płynie odrobinę wolniej
 * niż reszta strony. Tylko desktop, tylko transform (SPEC 10.2). Zakres
 * od +4 do −4 yPercent mieści się w limicie ≤ 8 ze SPEC 9.1; tekst strony
 * się nie rusza.
 */
function paralaksCaseStudy(gsap: Gsap): void {
  const cel = document.querySelector<HTMLElement>('[data-paralaks]');
  if (!cel) return;

  const willChange = przelacznikWillChange([cel]);

  gsap.fromTo(
    cel,
    { yPercent: 4 },
    {
      yPercent: -4,
      ease: 'none',
      scrollTrigger: {
        trigger: cel,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
        invalidateOnRefresh: true,
        onEnter: () => willChange(true),
        onEnterBack: () => willChange(true),
        onLeave: () => willChange(false),
        onLeaveBack: () => willChange(false),
      },
    },
  );

  sprzatanie.push(() => willChange(false));
}

/* -------------------------------------------------------------------------- */
/* Magnetyzm przycisków głównych (SPEC 7.4, Etap 8)                           */
/* -------------------------------------------------------------------------- */

/** Promień działania magnesu, liczony od krawędzi przycisku (SPEC 7.4). */
const PROMIEN_MAGNESU = 40;

/** Maksymalne przesunięcie przycisku w stronę kursora (SPEC 7.4). */
const MAX_PRZESUW_MAGNESU = 6;

/**
 * Przycisk główny ciągnie się do 6 px w stronę kursora w promieniu 40 px,
 * `gsap.quickTo` 0.4 s `power3.out`, powrót po wyjściu z promienia.
 *
 * Woła to wyłącznie kontekst desktopowy matchMedia (nigdy mobile, nigdy przy
 * ograniczonym ruchu); `pointer: fine` sprawdzamy dodatkowo, bo szeroki ekran
 * nie gwarantuje myszy. Zwraca funkcję sprzątającą dla kontekstu.
 *
 * GSAP trzyma transform inline, więc CSS-owe `:active { scale(0.98) }`
 * przestaje na te przyciski działać — dociśnięcie odtwarzamy tweenem skali,
 * żeby zachowanie z SPEC 7.4 zostało w komplecie.
 */
function magnetyzmPrzyciskow(gsap: Gsap): Sprzatanie | undefined {
  if (!window.matchMedia('(pointer: fine)').matches) return undefined;

  const przyciski = [...document.querySelectorAll<HTMLElement>('.btn--glowny')];
  if (przyciski.length === 0) return undefined;

  const lokalne: Sprzatanie[] = [];

  const magnesy = przyciski.map((btn) => {
    const magnes = {
      btn,
      xTo: gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' }),
      yTo: gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' }),
      aktywny: false,
    };

    const docisnij = () => gsap.to(btn, { scale: 0.98, duration: 0.15, ease: 'power2.out' });
    const zwolnij = () => gsap.to(btn, { scale: 1, duration: 0.15, ease: 'power2.out' });
    btn.addEventListener('pointerdown', docisnij);
    btn.addEventListener('pointerup', zwolnij);
    btn.addEventListener('pointercancel', zwolnij);
    btn.addEventListener('pointerleave', zwolnij);
    lokalne.push(() => {
      btn.removeEventListener('pointerdown', docisnij);
      btn.removeEventListener('pointerup', zwolnij);
      btn.removeEventListener('pointercancel', zwolnij);
      btn.removeEventListener('pointerleave', zwolnij);
    });

    return magnes;
  });

  const pusc = (magnes: (typeof magnesy)[number]) => {
    if (!magnes.aktywny) return;
    magnes.aktywny = false;
    magnes.xTo(0);
    magnes.yTo(0);
  };

  const naRuch = (e: PointerEvent) => {
    for (const magnes of magnesy) {
      const r = magnes.btn.getBoundingClientRect();
      // Przycisk schowany (np. pasek mobilny na desktopie) nie magnesuje.
      if (r.width === 0) continue;

      // Prostokąt bez bieżącego przesunięcia — inaczej przyciągnięty przycisk
      // uciekałby własnemu polu i drgał na granicy promienia.
      const x = Number(gsap.getProperty(magnes.btn, 'x')) || 0;
      const y = Number(gsap.getProperty(magnes.btn, 'y')) || 0;
      const lewa = r.left - x;
      const gora = r.top - y;

      // Odległość kursora od krawędzi (0 wewnątrz przycisku).
      const najX = Math.min(Math.max(e.clientX, lewa), lewa + r.width);
      const najY = Math.min(Math.max(e.clientY, gora), gora + r.height);
      const odKrawedzi = Math.hypot(e.clientX - najX, e.clientY - najY);

      if (odKrawedzi > PROMIEN_MAGNESU) {
        pusc(magnes);
        continue;
      }

      magnes.aktywny = true;
      // Pełna siła na przycisku, wygasa liniowo do granicy promienia.
      const sila = 1 - odKrawedzi / PROMIEN_MAGNESU;
      const srodekX = lewa + r.width / 2;
      const srodekY = gora + r.height / 2;
      const dystans = Math.hypot(e.clientX - srodekX, e.clientY - srodekY) || 1;
      magnes.xTo(((e.clientX - srodekX) / dystans) * MAX_PRZESUW_MAGNESU * sila);
      magnes.yTo(((e.clientY - srodekY) / dystans) * MAX_PRZESUW_MAGNESU * sila);
    }
  };

  // Kursor opuszcza okno — wszystkie przyciski wracają na miejsce.
  const naWyjscie = () => magnesy.forEach(pusc);

  document.addEventListener('pointermove', naRuch, { passive: true });
  document.documentElement.addEventListener('pointerleave', naWyjscie);

  return () => {
    document.removeEventListener('pointermove', naRuch);
    document.documentElement.removeEventListener('pointerleave', naWyjscie);
    for (const zdejmij of lokalne.splice(0)) zdejmij();
    for (const magnes of magnesy) {
      gsap.killTweensOf(magnes.btn);
      gsap.set(magnes.btn, { clearProps: 'transform' });
    }
  };
}

/* -------------------------------------------------------------------------- */
/* 05 Proces (SPEC 8.5)                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Desktop: PIN 2 Z 2. Pięć kroków jedzie w poziomie, a nad nimi rysuje się
 * linia-schodki.
 *
 * Rysowanie idzie przez `stroke-dashoffset`, czyli jedyne odstępstwo od
 * reguły „tylko transform i opacity" (SPEC 10.2). SPEC 8.5 prosi o to wprost
 * i sam je uzasadnia: jedna ścieżka, niski koszt. Nic więcej w pętli scrolla
 * tak nie animujemy.
 */
function procesDesktop(gsap: Gsap): void {
  const sekcja = document.querySelector<HTMLElement>('[data-proces]');
  if (!sekcja || sekcja.dataset.motion === 'off') return;

  const scena = sekcja.querySelector<HTMLElement>('[data-scena-proces]');
  const tor = sekcja.querySelector<HTMLElement>('[data-tor]');
  const svg = sekcja.querySelector<SVGSVGElement>('[data-schodki]');
  const sciezka = sekcja.querySelector<SVGPathElement>('[data-sciezka]');
  const karty = [...sekcja.querySelectorAll<HTMLElement>('[data-krok-p]')];
  if (!scena || !tor) return;

  /** O ile tor musi pojechać w lewo, żeby pokazać ostatni krok. */
  const przesuw = () => Math.max(0, tor.scrollWidth - scena.clientWidth);

  /**
   * Buduje linię-schodki z realnych pozycji kart: bieg przez kartę, przeskok
   * o poziom wyżej na jej prawej krawędzi (SPEC 8.5, motyw z logo).
   * Współrzędne w pikselach, więc `viewBox` odpowiada 1:1 rozmiarowi elementu.
   */
  function zbudujSchodki(): number {
    if (!svg || !sciezka || karty.length === 0) return 0;

    const szer = tor!.scrollWidth;
    const wys = Number(svg.dataset.wysokosc ?? '120');
    const dol = wys - 10;
    const skok = (dol - 10) / Math.max(1, karty.length - 1);
    const lewaToru = tor!.getBoundingClientRect().left;

    let d = '';
    karty.forEach((karta, i) => {
      const r = karta.getBoundingClientRect();
      const od = Math.round(r.left - lewaToru);
      const doX = Math.round(r.right - lewaToru);
      const y = Math.round(dol - i * skok);
      d += i === 0 ? `M${od} ${y}` : ` V${y}`;
      d += ` H${doX}`;
    });

    svg.setAttribute('viewBox', `0 0 ${szer} ${wys}`);
    svg.setAttribute('width', String(szer));
    sciezka.setAttribute('d', d);
    return sciezka.getTotalLength();
  }

  // Długość ścieżki trzymamy w zmiennej, żeby tween mógł ją czytać funkcją —
  // po zmianie szerokości okna schodki są innej długości.
  let dlugosc = 0;
  const przeliczSchodki = () => {
    dlugosc = zbudujSchodki();
    if (sciezka) gsap.set(sciezka, { strokeDasharray: dlugosc });
  };
  przeliczSchodki();

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: scena,
      start: 'top top',
      end: () => `+=${Math.max(window.innerHeight, przesuw())}`,
      pin: scena,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onRefreshInit: przeliczSchodki,
      onEnter: () => {
        tor.style.willChange = 'transform';
      },
      onEnterBack: () => {
        tor.style.willChange = 'transform';
      },
      onLeave: () => {
        tor.style.willChange = '';
      },
      onLeaveBack: () => {
        tor.style.willChange = '';
      },
    },
  });

  tl.fromTo(tor, { x: 0 }, { x: () => -przesuw(), duration: 1 }, 0);

  if (sciezka) {
    tl.fromTo(
      sciezka,
      { strokeDashoffset: () => dlugosc },
      { strokeDashoffset: 0, duration: 1 },
      0,
    );
  }

  sprzatanie.push(() => {
    tor.style.willChange = '';
  });
}

/**
 * Mobile: schodki pionowe (SPEC 17.5) — bez pinowania.
 *
 * Ta sama sygnatura co na desktopie, obrócona: tor każdego kroku rysuje się
 * `scaleY` w dół na swoim pasie, a między krokami łącznik poziomy (`scaleX`)
 * przeskakuje o pas w prawo. Jedna oś czasu na krok, wyłącznie transformy
 * (SPEC 10.2); geometrii nie mierzymy wcale — pasy ustawia CSS z `--poziom`.
 */
function procesMobile(gsap: Gsap): void {
  const sekcja = document.querySelector<HTMLElement>('[data-proces]');
  if (!sekcja || sekcja.dataset.motion === 'off') return;

  const kroki = [...sekcja.querySelectorAll<HTMLElement>('[data-krok-p]')];
  kroki.forEach((krok, i) => {
    const tor = krok.querySelector<HTMLElement>('[data-linia-pionowa]');
    const lacze = krok.querySelector<HTMLElement>('[data-linia-pozioma]');
    if (!tor) return;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: krok,
        start: 'top bottom-=120',
        end: 'bottom center',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    // Najpierw przeskok pasa, zaraz po nim zjazd w dół — proporcje dobrane
    // tak, żeby łącznik był mgnieniem, a tor niósł większość drogi.
    if (lacze && i > 0) {
      tl.fromTo(lacze, { scaleX: 0 }, { scaleX: 1, duration: 0.12 }, 0);
      tl.fromTo(tor, { scaleY: 0 }, { scaleY: 1, duration: 0.88 }, 0.12);
    } else {
      tl.fromTo(tor, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0);
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Sekwencja otwarcia hero (SPEC 8.0)                                         */
/* -------------------------------------------------------------------------- */

/** Zdejmuje wszystko, co sekwencja mogła schować. Wyjście awaryjne. */
function odslonHero(gsap: typeof import('gsap').gsap): void {
  const de = document.documentElement;
  de.dataset.ruch = 'off';
  const cele = document.querySelectorAll<HTMLElement>(
    '[data-wejscie], [data-wejscie="h1"] > span',
  );
  gsap.set(cele, { clearProps: 'all' });
  document
    .querySelector('[data-wejscie="lacznik"] svg')
    ?.classList.remove('lacznik--czeka', 'lacznik--rysuj');
}

/**
 * Jedyny ruch, który dzieje się sam. Całość ≤ 1,6 s.
 *
 * logo (0,4 s) → dwie linie H1 odsłaniane maską (0,9 s, odstęp 0,12 s)
 * → Łącznik rysuje się dolną, po 0,12 s górną kreską (0,7 s)
 * → lead, CTA, chipy (0,4 s, odstęp 0,06 s)
 */
function sekwencjaHero(gsap: typeof import('gsap').gsap): void {
  const de = document.documentElement;
  const hero = document.querySelector<HTMLElement>('[data-hero]');

  // Bezpiecznik z `Base.astro` zdążył zwolnić treść (moduł wstawał za długo
  // albo fonty nie przyszły) — wtedy nie chowamy niczego z powrotem.
  if (!hero || de.dataset.ruch !== 'przed') {
    de.dataset.ruch = 'on';
    return;
  }

  const logo = document.querySelector<HTMLElement>('[data-wejscie="logo"]');
  const linie = hero.querySelectorAll<HTMLElement>('[data-wejscie="h1"] > span');
  const lacznik = hero.querySelector<SVGSVGElement>('[data-wejscie="lacznik"] svg');
  const reszta = hero.querySelectorAll<HTMLElement>('[data-wejscie="reszta"]');

  // Stan początkowy wpisujemy inline, zanim zdejmiemy `data-ruch="przed"` —
  // inaczej między jednym a drugim mignęłaby gotowa treść.
  if (logo) gsap.set(logo, { opacity: 0 });
  gsap.set(linie, { clipPath: 'inset(0% 0% 100% 0%)', y: 24 });
  gsap.set(reszta, { opacity: 0, y: 12 });
  // Kreski Łącznika trzyma CSS (patrz Lacznik.astro) — GSAP tylko przełącza
  // klasę w odpowiednim momencie osi czasu.
  lacznik?.classList.add('lacznik--czeka');

  de.dataset.ruch = 'on';

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  if (logo) tl.to(logo, { opacity: 1, duration: 0.4 }, 0);

  tl.to(
    linie,
    {
      // Ujemne wcięcia na dole i po bokach zostawiają miejsce na ogonki
      // („zapełnia") i na ujemny tracking nagłówka.
      clipPath: 'inset(0% -4% -25% -4%)',
      y: 0,
      duration: 0.9,
      stagger: 0.12,
    },
    0.15,
  );

  // Rysowanie kresek: dolna od razu, górna z opóźnieniem 120 ms — jedno
  // i drugie w CSS, więc tutaj wystarczy przełączenie klasy. Kończy się
  // 0,7 + 0,12 + 0,7 = 1,52 s od startu sekwencji.
  if (lacznik) tl.call(() => lacznik.classList.add('lacznik--rysuj'), undefined, 0.7);

  tl.to(reszta, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, 1.0);

  // Maska przestaje być potrzebna — zdejmujemy ją, żeby nie ucinała niczego
  // przy późniejszym przewijaniu ani przy zmianie rozmiaru okna.
  tl.set(linie, { clipPath: 'none' });

  sprzatanie.push(() => tl.kill());
}
