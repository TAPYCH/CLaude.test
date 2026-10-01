// Map pins (scenes & excursions) and postcard illustrations.
import { mountains, palm, moscowSkyline, cloud, sun, stars, moon } from '../art/scenes/common.js';

export const MAP = {
  moscow: {
    pins: [
      { scene: 'dorm', x: 18, y: 30, icon: '🏠', name: 'Общежитие' },
      { scene: 'college', x: 50, y: 22, icon: '🎓', name: 'Медколледж' },
      { scene: 'cafe', x: 84, y: 50, icon: '☕', name: 'Кофейня «Пенка»' },
      { scene: 'park', x: 28, y: 92, icon: '🌳', name: 'Парк' },
      { scene: 'mall', x: 74, y: 92, icon: '🛍️', name: 'ТЦ «Галерея»' },
      { excursion: 'redsquare', x: 50, y: 60, icon: '🏰', name: 'Красная площадь' },
      { excursion: 'moscowcity', x: 16, y: 64, icon: '🏙️', name: 'Москва-Сити' },
      { excursion: 'vdnh', x: 84, y: 20, icon: '⛲', name: 'ВДНХ' },
    ],
  },
  abkhazia: {
    pins: [
      { scene: 'home', x: 62, y: 64, icon: '🏡', name: 'Дом в Сухуме' },
      { scene: 'beach', x: 40, y: 92, icon: '🏖️', name: 'Пляж' },
      { scene: 'garden', x: 84, y: 40, icon: '🍊', name: 'Мандариновый сад' },
      { excursion: 'ritsa', x: 30, y: 26, icon: '🏞️', name: 'Озеро Рица' },
      { excursion: 'afon', x: 36, y: 62, icon: '⛪', name: 'Новый Афон' },
      { excursion: 'gagra', x: 12, y: 46, icon: '🏛️', name: 'Гагра' },
    ],
  },
};

export const EXCURSIONS = {
  redsquare: { id: 'redsquare', city: 'moscow', name: 'Красная площадь', icon: '🏰', price: 0, hours: 3, needs: { fun: 28, energy: -12, social: 6 }, text: 'Собор Василия Блаженного вживую ещё красивее, чем на открытках!' },
  moscowcity: { id: 'moscowcity', city: 'moscow', name: 'Смотровая Москва-Сити', icon: '🏙️', price: 1500, hours: 3, needs: { fun: 36, energy: -10 }, text: '89-й этаж, вся Москва в огоньках. Фото — огонь!' },
  vdnh: { id: 'vdnh', city: 'moscow', name: 'ВДНХ', icon: '⛲', price: 300, hours: 4, needs: { fun: 30, energy: -14, hunger: 10 }, text: 'Фонтан «Дружба народов», каток и самые вкусные пончики.' },
  ritsa: { id: 'ritsa', city: 'abkhazia', name: 'Озеро Рица', icon: '🏞️', price: 1500, hours: 6, needs: { fun: 42, energy: -18, social: 10 }, text: 'Бирюзовая вода, горы и запах хвои. Дух захватывает!' },
  afon: { id: 'afon', city: 'abkhazia', name: 'Новый Афон', icon: '⛪', price: 900, hours: 5, needs: { fun: 36, energy: -16 }, text: 'Монастырь в кипарисах, водопад и знаменитая пещера.' },
  gagra: { id: 'gagra', city: 'abkhazia', name: 'Гагра · Колоннада', icon: '🏛️', price: 700, hours: 4, needs: { fun: 30, energy: -12, social: 8 }, text: 'Белая колоннада, пальмы и лебеди в пруду.' },
};

// 400 × 260 postcard illustrations
export function postcardArt(id) {
  const P = {
    ritsa: () => `
      <defs><linearGradient id="pcR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient>
      <linearGradient id="pcRl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fd0c8"/><stop offset="1" stop-color="#0f8ea8"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#pcR)"/>${cloud(90, 50, 0.6)}${cloud(300, 40, 0.5)}
      <g transform="scale(.2,.52) translate(0,-80)">${mountains(2000, 500, ['#6f9a7a', '#a9c4d9'])}</g>
      ${[20, 50, 330, 360, 385].map((x, i) => `<path d="M${x},${170 - (i % 2) * 10} l-16,40 l32,0 Z M${x},${150 - (i % 2) * 10} l-12,32 l24,0 Z" fill="#2f6b4a"/>`).join('')}
      <path d="M0,190 Q200,160 400,190 L400,260 L0,260 Z" fill="url(#pcRl)"/>
      <path d="M60,210 q20,-4 40,0 M220,230 q30,-5 60,0 M140,200 q16,-3 32,0" stroke="#fff" stroke-width="2.4" opacity=".6" fill="none"/>`,
    afon: () => `
      <rect width="400" height="260" fill="#ffe6c9"/>${sun(320, 60, 26, '#fff1b8')}
      <path d="M0,170 C80,120 160,130 220,110 C280,90 340,120 400,100 L400,260 L0,260 Z" fill="#7fbf7a"/>
      ${[40, 70, 330, 360].map((x) => `<path d="M${x},200 C${x - 10},150 ${x - 4},110 ${x},80 C${x + 4},110 ${x + 10},150 ${x},200 Z" fill="#2f7a4a"/>`).join('')}
      <rect x="140" y="110" width="120" height="70" fill="#fff6ea"/><rect x="180" y="80" width="40" height="40" fill="#fff6ea"/>
      ${[[200, 60, 18], [155, 100, 12], [245, 100, 12]].map(([x, y, r]) => `<path d="M${x - r},${y + r} Q${x - r},${y - r * 0.6} ${x},${y - r * 1.4} Q${x + r},${y - r * 0.6} ${x + r},${y + r} Z" fill="#4caf72"/><rect x="${x - 1}" y="${y - r * 2.2}" width="2" height="${r}" fill="#e8b84a"/>`).join('')}
      ${[150, 175, 200, 225, 250].map((x) => `<rect x="${x - 5}" y="130" width="10" height="18" rx="5" fill="#bfa58a"/>`).join('')}
      <path d="M0,230 Q200,200 400,230 L400,260 L0,260 Z" fill="#4fb3ff"/>`,
    gagra: () => `
      <rect width="400" height="260" fill="#bfe8ff"/>${sun(70, 60, 24)}
      <path d="M0,200 L400,200 L400,260 L0,260 Z" fill="#4fb3ff"/>
      <rect x="40" y="110" width="320" height="16" fill="#fffaf2"/><rect x="40" y="186" width="320" height="16" fill="#fffaf2"/>
      ${[50, 90, 130, 170, 210, 250, 290, 330].map((x) => `<rect x="${x}" y="126" width="16" height="60" fill="#fff"/><rect x="${x - 3}" y="122" width="22" height="6" fill="#efe4d6"/>`).join('')}
      <path d="M200,80 l-40,30 l80,0 Z" fill="#fffaf2"/>
      <g transform="scale(.5)">${palm(40, 400, 1)}${palm(760, 400, 1.1)}</g>`,
    redsquare: () => `
      <rect width="400" height="260" fill="#cfe9ff"/>${cloud(320, 50, 0.5)}
      <rect x="0" y="200" width="400" height="60" fill="#b9a8a0"/>
      ${[[200, 70, 26, '#e94b5a', '#2e9b6a'], [150, 110, 20, '#4fb3ff', '#ffd23d'], [250, 110, 20, '#3fbf7a', '#ff6f9c'], [115, 140, 15, '#ff9a2e', '#4fb3ff'], [285, 140, 15, '#9a7bff', '#ffd23d']].map(([x, y, r, a, b]) => `
        <rect x="${x - r * 0.7}" y="${y + r}" width="${r * 1.4}" height="${200 - y - r}" fill="#d9584a"/>
        <path d="M${x - r},${y + r} Q${x - r * 1.2},${y - r * 0.4} ${x},${y - r * 1.6} Q${x + r * 1.2},${y - r * 0.4} ${x + r},${y + r} Z" fill="${a}"/>
        <path d="M${x - r * 0.6},${y} Q${x},${y - r * 0.6} ${x + r * 0.6},${y} M${x - r * 0.8},${y + r * 0.6} Q${x},${y} ${x + r * 0.8},${y + r * 0.6}" stroke="${b}" stroke-width="4" fill="none"/>
        <rect x="${x - 1.5}" y="${y - r * 2.4}" width="3" height="${r * 0.9}" fill="#e8b84a"/>`).join('')}`,
    moscowcity: () => `
      <defs><linearGradient id="pcN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a2155"/><stop offset="1" stop-color="#6a4a8a"/></linearGradient></defs>
      <rect width="400" height="260" fill="url(#pcN)"/>${stars(400, 120, 30, 3)}${moon(330, 50, 16)}
      <g transform="translate(-60,0)">${moscowSkyline(0, 250, 0.62, '#22284f', '#ffd97a')}</g>
      <path d="M0,240 Q200,226 400,240 L400,260 L0,260 Z" fill="#3a3f7a"/>`,
    vdnh: () => `
      <rect width="400" height="260" fill="#ffe3ee"/>${sun(330, 50, 22)}
      <ellipse cx="200" cy="210" rx="180" ry="36" fill="#7fd3ff"/><ellipse cx="200" cy="205" rx="160" ry="28" fill="#a9e3ff"/>
      ${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; const x = 200 + Math.cos(a) * 120; const y = 196 + Math.sin(a) * 18; return `<rect x="${x - 4}" y="${y - 30}" width="8" height="30" rx="4" fill="#ffc23d"/><circle cx="${x}" cy="${y - 34}" r="6" fill="#ffd86b"/>`; }).join('')}
      <rect x="185" y="120" width="30" height="80" fill="#ffc23d"/><path d="M170,120 Q200,80 230,120 Z" fill="#ffd86b"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M200,100 Q${150 + i * 20},${30 + (i % 2) * 10} ${120 + i * 32},150" stroke="#cfefff" stroke-width="3" fill="none" opacity=".8"/>`).join('')}`,
  };
  return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">${(P[id] || P.ritsa)()}</svg>`;
}
