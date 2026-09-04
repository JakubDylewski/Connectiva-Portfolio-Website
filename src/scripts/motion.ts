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
import { ZDARZENIE_PRZEWIN, type PrzewinDetail } from './segment';

type Sprzatanie = () => void;

let sprzatanie: Sprzatanie[] = [];
let uruchomione = false;

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

  const de = document.documentElement;
  const reduce = ograniczonyRuch();

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  if (!reduce) await wlaczLenis(gsap, ScrollTrigger);

  const ctx = gsap.context(() => {
    // Kurczenie belki działa w każdym trybie — to zmiana stanu, nie scrub.
    belka(gsap, ScrollTrigger, reduce);

    const mm = gsap.matchMedia();

    mm.add(DESKTOP, () => {
      // Etap 2: pin sekcji Projekty (pin 1/2).
      // Etap 5: pin sekcji Proces (pin 2/2).
      // Etap 8: magnetyzm przycisków.
    });

    mm.add(MOBILE, () => {
      pasekDolny(ScrollTrigger);
    });

    mm.add(REDUCE, () => {
      // Dotyczy też sytuacji, w której ustawienie zmieni się przy otwartej
      // stronie: konteksty bez `reduce` same się wtedy cofają, a my zostawiamy
      // wszystko w stanie końcowym.
      de.dataset.ruch = 'off';
      document.querySelector('[data-pasek]')?.classList.add('jest-widoczny');
    });
  });
  sprzatanie.push(() => ctx.revert());

  // Sekwencja startuje dopiero na docelowych fontach, żeby nie animować
  // fallbacku (SPEC 8.0).
  await document.fonts.ready;
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
}

export function destroyMotion(): void {
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
): Promise<void> {
  const { default: Lenis } = await import('lenis');

  // `syncTouch` zostaje domyślnie wyłączone: na telefonie przewijanie ma być
  // natywne, Lenis tylko raportuje pozycję (SPEC 10.1).
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

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

  // Hook dla Etapów 4 i 6: sekcja z formularzem dostaje `data-chowa-pasek`
  // i pasek schodzi z drogi, gdy jest widoczna (SPEC 7.3).
  for (const sekcja of document.querySelectorAll<HTMLElement>('[data-chowa-pasek]')) {
    ScrollTrigger.create({
      trigger: sekcja,
      start: 'top bottom-=120',
      end: 'bottom top+=120',
      onToggle: (self) => pasek.classList.toggle('jest-schowany', self.isActive),
    });
  }
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
