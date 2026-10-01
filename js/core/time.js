// In-game calendar. Day 0 = Monday, 1 September.
const START = Date.UTC(2025, 8, 1); // 1 Sep 2025 was a Monday
const DAY_MS = 86400000;

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEKDAYS_FULL = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

export function dateOf(day) {
  return new Date(START + day * DAY_MS);
}
export const weekday = (day) => ((day % 7) + 7) % 7; // 0 = Monday
export const isWeekend = (day) => weekday(day) >= 5;
export const month = (day) => dateOf(day).getUTCMonth();

export function season(day) {
  const m = month(day);
  if (m === 11 || m <= 1) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'autumn';
}

export function formatDate(day, long = false) {
  const d = dateOf(day);
  const wd = weekday(day);
  return long
    ? `${WEEKDAYS_FULL[wd]}, ${d.getUTCDate()} ${MONTHS_GEN[d.getUTCMonth()]}`
    : `${WEEKDAYS[wd]}, ${d.getUTCDate()} ${MONTHS_GEN[d.getUTCMonth()]}`;
}

export function formatClock(minutes) {
  const m = Math.floor(minutes) % 1440;
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** 0..1 darkness factor and a phase name for tinting scenes. */
export function dayPhase(minutes) {
  const h = (minutes % 1440) / 60;
  if (h < 5) return { name: 'night', dark: 1 };
  if (h < 7) return { name: 'dawn', dark: 1 - (h - 5) / 2 };
  if (h < 18) return { name: 'day', dark: 0 };
  if (h < 20) return { name: 'sunset', dark: (h - 18) / 2 * 0.6 };
  if (h < 22) return { name: 'evening', dark: 0.6 + (h - 20) / 2 * 0.4 };
  return { name: 'night', dark: 1 };
}

export function durationLabel(min) {
  if (min < 60) return `${Math.round(min)} мин`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export function money(n) {
  return `${Math.round(n).toLocaleString('ru-RU')} ₽`;
}

/** Deterministic daily weather: 'snow' | 'rain' | 'clear'. */
export function weatherOf(day, city) {
  const se = season(day);
  const x = Math.sin((day + 3) * 12.9898 + (city === 'moscow' ? 0 : 7.13)) * 43758.5453;
  const r = Math.floor((x - Math.floor(x)) * 100);
  if (city === 'moscow') {
    if (se === 'winter') return r < 70 ? 'snow' : 'clear';
    if (se === 'autumn') return r < 40 ? 'rain' : 'clear';
    if (se === 'spring') return r < 25 ? 'rain' : 'clear';
    return r < 15 ? 'rain' : 'clear';
  }
  return se === 'summer' ? 'clear' : r < 18 ? 'rain' : 'clear';
}
