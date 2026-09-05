/**
 * Sprawdzarka wyłączności miasta (SPEC 8.3, interakcja 5).
 *
 * WYŁĄCZNOŚĆ JEST PER SEGMENT — decyzja potwierdzona 5 września 2026
 * (SPEC 16, punkt 1). W jednym mieście pracujemy z jednym salonem beauty,
 * jednym gabinetem kosmetologii i jedną kliniką lekarską: trzy niezależne
 * sloty, każdy z własnym statusem w `miasta.json`. Zajęty salon w Gdyni nie
 * zamyka tam ani kosmetologii, ani kliniki.
 *
 * UCZCIWOŚĆ (SPEC 15): sprawdzarka pokazuje stan faktyczny z `miasta.json`.
 * Miasto spoza pliku jest naprawdę wolne, więc odpowiadamy „wolne”.
 * Nigdy nie wpisujemy „zajete” dla efektu — plik aktualizujemy ręcznie
 * dopiero po podpisaniu umowy.
 */
import miasta from '../data/miasta.json';
import { ZDARZENIE_SEGMENT, type Segment, type SegmentDetail } from './segment';

export type Status = 'wolne' | 'zajete';

interface WpisMiasta extends Partial<Record<Segment, Status>> {
  /** Poprawna pisownia z ogonkami — do pokazania w wyniku. */
  nazwa?: string;
}

type Tabela = Record<string, WpisMiasta>;

const TABELA = miasta as Tabela;

/** Nazwy segmentów w zdaniu — z małej litery (SPEC 5). */
const NAZWA_SEGMENTU: Record<Segment, string> = {
  salon: 'salon beauty',
  kosmetologia: 'gabinet kosmetologii',
  klinika: 'klinika lekarska',
};

/**
 * Normalizacja wejścia (SPEC 8.3): `Gdańsk` = `gdansk` = `GDAŃSK`.
 *
 * Uwaga na „ł": w przeciwieństwie do ą, ć, ę, ń, ó, ś, ź, ż nie rozkłada się
 * w NFD na literę i znak diakrytyczny — to osobny znak (U+0142). Trzeba go
 * podmienić osobno, inaczej „Łódź" nigdy nie trafi w klucz „lodz".
 */
export function normalizujMiasto(wejscie: string): string {
  return wejscie
    .trim()
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Nazwa miasta w takiej pisowni, jakiej użyjemy w zdaniu.
 *
 * Dla miast z `miasta.json` bierzemy zapis z pliku — dzięki temu wpisane
 * „gdansk" wraca jako „Gdańsk", a nie bez ogonka. Dla reszty porządkujemy
 * to, co wpisała użytkowniczka: same wielkie litery („GDAŃSK") wyglądałyby
 * w środku zdania jak krzyk.
 */
function nazwaMiasta(wejscie: string): string {
  const zPliku = TABELA[normalizujMiasto(wejscie)]?.nazwa;
  if (zPliku) return zPliku;

  return wejscie
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pl-PL')
    // Wielka litera po początku, spacji i myślniku — „Golub-Dobrzyń".
    .replace(/(^|[\s-])(\p{L})/gu, (_, przed: string, litera: string) =>
      przed + litera.toLocaleUpperCase('pl-PL'),
    );
}

/** Status danego segmentu w danym mieście. Poza tabelą — wolne. */
export function statusMiasta(miasto: string, segment: Segment): Status {
  return TABELA[normalizujMiasto(miasto)]?.[segment] ?? 'wolne';
}

export interface Wynik {
  /** Pogrubiona pierwsza część zdania. */
  naglowek: string;
  /** Reszta zdania. */
  reszta: string;
  status: Status | null;
}

/** Buduje treść wyniku. `null` w polach oznacza stan „jeszcze nie sprawdzamy". */
export function zbudujWynik(miasto: string, segment: Segment | null): Wynik | string {
  if (miasto.trim() === '') return 'Wpisz miasto, żeby sprawdzić.';
  if (!segment) return 'Wybierz typ gabinetu, żeby sprawdzić.';

  const status = statusMiasta(miasto, segment);
  const naglowek = `${nazwaMiasta(miasto)}, ${NAZWA_SEGMENTU[segment]}: ${
    status === 'wolne' ? 'wolne' : 'zajęte'
  }.`;

  const reszta =
    status === 'wolne'
      ? ' Po pierwszej rozmowie rezerwujemy miasto na 14 dni, żebyś mogła spokojnie zdecydować.'
      : ' Możemy zaproponować sąsiednie miasto albo wpisać Cię na listę na wypadek zakończenia współpracy.';

  return { naglowek, reszta, status };
}

export function initCityCheck(): () => void {
  const formularz = document.querySelector<HTMLFormElement>('[data-sprawdzarka]');
  if (!formularz) return () => {};

  const pole = formularz.querySelector<HTMLInputElement>('[data-miasto]');
  const wyjscie = formularz.querySelector<HTMLElement>('[data-wynik]');
  if (!pole || !wyjscie) return () => {};

  const segment = () =>
    (document.documentElement.dataset.segment as Segment | undefined) ?? null;

  function pokaz(): void {
    const wynik = zbudujWynik(pole!.value, segment());

    wyjscie!.replaceChildren();
    if (typeof wynik === 'string') {
      wyjscie!.append(wynik);
    } else {
      const mocno = document.createElement('strong');
      mocno.textContent = wynik.naglowek;
      wyjscie!.append(mocno, wynik.reszta);
    }

    // Wejście wyniku: opacity + y 8, 200 ms (SPEC 10.3). Robi to CSS —
    // klasę zdejmujemy i nakładamy, żeby przejście ruszyło od nowa.
    wyjscie!.classList.remove('jest-widoczny');
    void wyjscie!.offsetHeight;
    wyjscie!.classList.add('jest-widoczny');
  }

  const naWyslanie = (e: Event) => {
    e.preventDefault();
    pokaz();
  };

  // Zmiana segmentu po pokazaniu wyniku odświeża go od razu — inaczej na
  // ekranie zostaje odpowiedź na inne pytanie.
  const naSegment = (e: Event) => {
    const { zDotkniecia } = (e as CustomEvent<SegmentDetail>).detail;
    if (!zDotkniecia) return;
    if (wyjscie.textContent?.trim()) pokaz();
  };

  formularz.addEventListener('submit', naWyslanie);
  document.addEventListener(ZDARZENIE_SEGMENT, naSegment);

  return () => {
    formularz.removeEventListener('submit', naWyslanie);
    document.removeEventListener(ZDARZENIE_SEGMENT, naSegment);
  };
}
