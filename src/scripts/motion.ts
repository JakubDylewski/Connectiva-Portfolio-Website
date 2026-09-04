/**
 * Warstwa ruchu (SPEC 10.1).
 *
 * ETAP 0: rusztowanie. `initMotion()` nie animuje jeszcze niczego — pilnuje
 * tylko, żeby cała maszyneria dała się włączyć i wyłączyć jednym wywołaniem,
 * i żeby przy `prefers-reduced-motion: reduce` nie ładować ani bajta GSAP-a.
 *
 * Zasady, które ten plik ma egzekwować w kolejnych etapach:
 *  · jedna instancja Lenis, jeden `gsap.ticker`, wszystko w `gsap.context()`,
 *    żeby `destroyMotion()` zdejmował całość jednym `revert()`;
 *  · trzy konteksty `gsap.matchMedia()` (desktop / mobile / reduced motion);
 *  · maksymalnie dwa piny, wyłącznie na desktopie;
 *  · animujemy tylko `transform` i `opacity`.
 *
 * GSAP i Lenis są ładowane dynamicznie, dopiero gdy ruch jest naprawdę
 * potrzebny. Dzięki temu Etap 0 nie wysyła ~50 KB skryptu za nic, a
 * użytkowniczki z ograniczonym ruchem nie dostają go nigdy.
 */

type Sprzatanie = () => void;

let sprzatanie: Sprzatanie[] = [];
let uruchomione = false;

/** Czy użytkowniczka prosi o ograniczony ruch (SPEC 10.1). */
export function ograniczonyRuch(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Włącza warstwę ruchu. Idempotentne — powtórne wywołanie nic nie robi.
 * W Etapie 8 podpinamy to pod `astro:page-load`.
 */
export async function initMotion(): Promise<void> {
  if (typeof window === 'undefined' || uruchomione) return;
  uruchomione = true;

  // Bez Lenis i bez scrubów; wszystko zostaje w stanie końcowym (SPEC 10.1).
  if (ograniczonyRuch()) {
    document.documentElement.dataset.ruch = 'off';
    return;
  }

  document.documentElement.dataset.ruch = 'on';

  // ETAP 1: tutaj wchodzi Lenis, gsap.matchMedia i sekwencja otwarcia hero.
  //
  //   const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
  //     import('gsap'),
  //     import('gsap/ScrollTrigger'),
  //     import('lenis'),
  //   ]);
  //   gsap.registerPlugin(ScrollTrigger);
  //   ...
  //   sprzatanie.push(() => ctx.revert(), () => lenis.destroy());
}

/**
 * Wyłącza warstwę ruchu i zwalnia wszystko, co `initMotion()` podpięło.
 * W Etapie 8 podpinamy to pod `astro:before-swap`.
 *
 * Test z SPEC 10.1: po trzech nawigacjach `ScrollTrigger.getAll().length`
 * musi się równać liczbie ze świeżo załadowanej strony.
 */
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
