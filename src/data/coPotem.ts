/**
 * 06 Co potem (SPEC 17.14).
 *
 * Trzy punkty o życiu strony po publikacji: własność, opieka jako opcja,
 * jednorazowe zmiany bez opieki. Treść dosłownie ze SPEC 17.14.
 *
 * Cena opieki mieszka tylko tutaj i na `/cennik/` (blok `#opieka` zasilany
 * z tego samego pliku) — dlatego zdanie o opiece wypadło z pozycji 6
 * akordeonu „Co dostajesz” (17.14, powiązane zmiany).
 *
 * Twarde spacje po spójnikach jednoliterowych i przy liczbach — SPEC 5.
 *
 * DO DECYZJI JAKUBA (17.14): stawka za jednorazowe zmiany bez opieki.
 * Na stronie celowo bez kwoty — „wyceniamy jednorazowo”. Jeśli stawka
 * godzinowa zostanie ustalona, dopisać ją w punkcie „Zmiany bez opieki”.
 */

export interface PunktCoPotem {
  /** Klucz do wyboru punktów poza sekcją — blok `#opieka` na `/cennik/`. */
  id: 'wlasnosc' | 'opieka' | 'zmiany';
  tytul: string;
  tresc: string;
}

export const coPotem: PunktCoPotem[] = [
  {
    id: 'wlasnosc',
    tytul: 'Strona jest Twoja.',
    tresc:
      'Kod, domena, treści i\u00A0zdjęcia należą do Ciebie od dnia publikacji. ' +
      'Hosting na Cloudflare nie kosztuje nic, ani teraz, ani później. ' +
      'Bez opieki strona działa dalej dokładnie tak samo.',
  },
  {
    id: 'opieka',
    tytul: 'Opieka, jeśli chcesz.',
    tresc:
      '249\u00A0zł miesięcznie: aktualizacje, kopie zapasowe, monitoring ' +
      'i\u00A0do 2\u00A0godzin zmian w\u00A0treści, wprowadzanych w\u00A0ciągu ' +
      '48\u00A0godzin roboczych. Bez zobowiązania — wypowiadasz, kiedy chcesz.',
  },
  {
    id: 'zmiany',
    tytul: 'Zmiany bez opieki.',
    tresc:
      'Nie masz opieki, a\u00A0chcesz coś zmienić? Piszesz, wyceniamy ' +
      'jednorazowo, robimy. Żadnych ukrytych opłat i\u00A0żadnego abonamentu, ' +
      'którego nie zamawiałaś.',
  },
];
