/**
 * 02 Co dostajesz (SPEC 8.2).
 *
 * Sześć pozycji akordeonu. Kolejność nie jest rankingiem ani etapami — stąd
 * marker Łącznika zamiast numeru (SPEC 8.2).
 *
 * Tagi opisują korzyść dla właścicielki, a nie użyte biblioteki (SPEC 13).
 */
import type { PozycjaAkordeonu } from '../components/Accordion.astro';

export const zakres: PozycjaAkordeonu[] = [
  {
    tytul: 'Projekt szyty pod Twoją markę',
    tagi: ['własna paleta i typografia', 'Twoje zdjęcia lub sesja', 'zero szablonów'],
    tresc:
      'Nie dostajesz motywu z podmienionym logo. Strona ma własny charakter, ' +
      'dopasowany do wnętrza, cen i klientek, które chcesz przyciągać.',
  },
  {
    tytul: 'System pozyskiwania klientek',
    tagi: ['dobór zabiegu', 'cennik z filtrem', 'diagnoza skóry'],
    tresc:
      'Element, który zamienia oglądanie w decyzję: pacjentka wybiera problem ' +
      'i trafia na właściwy zabieg, klientka salonu znajduje usługę w trzy ' +
      'sekundy, kosmetolożka zbiera leady z pełnym profilem skóry.',
  },
  {
    tytul: 'Rezerwacja online bez prowizji',
    tagi: ['Booksy', 'Fresha', 'Estetify', 'Calendly'],
    tresc:
      'Wpinamy w stronę kalendarz systemu, którego używasz albo który wybierzemy ' +
      'razem. Rezerwacje z Twojej strony trafiają prosto do Twojego kalendarza, ' +
      'bez prowizji marketplace’u. Nie budujemy własnego kalendarza — to kosztuje ' +
      'więcej, niż daje.',
  },
  {
    tytul: 'Lokalne SEO od pierwszego dnia',
    tagi: ['strony miasto + usługa', 'wizytówka Google', 'dane strukturalne'],
    tresc:
      'Osobne strony na frazy, których szukają klientki („manicure hybrydowy ' +
      'Gdynia”, „mezoterapia Toruń”), wizytówka Google spięta ze stroną i dane, ' +
      'które Google rozumie bez zgadywania.',
  },
  {
    tytul: 'Bezpieczeństwo prawne',
    tagi: ['art. 14 dla klinik', 'RODO', 'zgody na wizerunek'],
    tresc:
      'Klinika lekarska nie może reklamować świadczeń — dostaje stronę ' +
      'informacyjną, która buduje autorytet bez ryzyka. Gabinet kosmetologiczny ' +
      'może więcej, ale bez obietnic leczenia. Zdjęcia przed/po tylko z pisemną ' +
      'zgodą klientki.',
  },
  {
    tytul: 'Szybkość, dostępność i własność',
    tagi: ['Lighthouse 95+', 'hosting Cloudflare', 'pełne prawa'],
    tresc:
      'Strona otwiera się w ułamku sekundy na telefonie, spełnia wymagania ' +
      'dostępności i jest Twoja: kod, domena, treści. Żadnych ukrytych ' +
      'abonamentów — opieka jest opcją, nie warunkiem.',
  },
];
