// Black Sea pebble beach, Sukhum. World 2200 × 1000.
import { skyDefs, isDark, stars, moon, sun, cloud, mountains, palm, shadowEllipse } from './common.js';
import { NPC_OUTFITS } from '../../data/npcs.js';

export const W = 2200;

export function paint({ phase }) {
  const dark = isDark(phase);
  const sunset = phase === 'sunset' || phase === 'dawn';
  let pebbles = '';
  for (let i = 0; i < 140; i++) {
    const x = (i * 157) % W;
    const y = 760 + ((i * 89) % 230);
    pebbles += `<ellipse cx="${x}" cy="${y}" rx="${6 + (i % 5) * 2}" ry="${4 + (i % 3) * 1.5}" fill="${['#d9c9b4', '#c9b8a2', '#e8dccb', '#bfae98'][i % 4]}"/>`;
  }
  return `
  <defs>${skyDefs('bSky', phase)}
    <linearGradient id="bSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark ? '#24356f' : sunset ? '#5a8fd0' : '#3fb8ea'}"/><stop offset="1" stop-color="${dark ? '#16224a' : '#1f86c6'}"/></linearGradient>
    <linearGradient id="bSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1e2c9"/><stop offset="1" stop-color="#e2cfb0"/></linearGradient>
  </defs>
  <rect width="${W}" height="1000" fill="url(#bSky)"/>
  ${dark ? stars(W, 380, 80) + moon(1700, 150, 34) : sun(1500, sunset ? 470 : 170, 52, sunset ? '#ffcf7a' : '#fff3b0') + cloud(260, 170, 1.1) + cloud(800, 120, 0.8) + cloud(1900, 220, 1)}
  ${mountains(W, 560, dark ? ['#2a3d5c', '#3a4c74'] : ['#7fb38a', '#a9c6e0'])}
  <rect y="540" width="${W}" height="240" fill="url(#bSea)"/>
  ${sunset && !dark ? `<path d="M1440,545 L1560,545 L1620,780 L1380,780 Z" fill="#ffcf7a" opacity=".35"/>` : ''}
  ${dark ? '<path d="M1670,545 L1730,545 L1780,780 L1620,780 Z" fill="#fff6d6" opacity=".18"/>' : ''}
  ${Array.from({ length: 16 }, (_, i) => `<path class="amb-wave" style="animation-delay:-${((i * 1.7) % 4.5).toFixed(1)}s" d="M${(i * 173) % W},${570 + ((i * 47) % 180)} q30,-8 60,0" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/>`).join('')}
  <!-- pier -->
  <rect x="200" y="600" width="520" height="22" fill="#a8703f"/>${[230, 330, 430, 530, 630, 700].map((x) => `<rect x="${x}" y="620" width="14" height="80" fill="#8a5a33"/>`).join('')}
  <!-- sailboat -->
  <g class="amb-bob"><g transform="translate(1100,600)"><path d="M-50,0 L50,0 L36,22 L-36,22 Z" fill="#fff"/><path d="M0,0 L0,-90 L46,-6 Z" fill="#ff8fab"/><path d="M-4,-6 L-4,-80 L-40,-6 Z" fill="#fff"/></g></g>
  <!-- shore -->
  <path d="M0,760 C300,740 600,770 900,750 C1200,730 1500,770 1800,748 C2000,736 2100,750 ${W},745 L${W},1000 L0,1000 Z" fill="url(#bSand)"/>
  <path d="M0,760 C300,740 600,770 900,750 C1200,730 1500,770 1800,748 C2000,736 2100,750 ${W},745" stroke="#fff" stroke-width="10" fill="none" opacity=".75"/>
  ${pebbles}
  ${palm(120, 820, 1.25)}${palm(2080, 830, 1.3)}${palm(1960, 800, 0.95)}
  <!-- sunbeds & umbrella -->
  ${shadowEllipse(1500, 860, 200, 16, 0.15)}
  <g transform="translate(1500,860)">
    <rect x="-4" y="-330" width="8" height="330" fill="#fff"/>
    <path d="M-200,-300 Q0,-420 200,-300 Z" fill="#ff8fab"/>${[-150, -50, 50, 150].map((x, i) => `<path d="M${x - 50},-302 Q${x},-${i % 3 ? 360 : 350} ${x + 50},-302" fill="${i % 2 ? '#fff' : '#ff8fab'}" opacity=".9"/>`).join('')}
    ${[-110, 110].map((x) => `<g transform="translate(${x},0)"><path d="M-80,-40 L60,-40 L90,-90" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="-80" y="-48" width="150" height="14" rx="6" fill="#4fb3ff"/><path d="M60,-48 L86,-92" stroke="#4fb3ff" stroke-width="14" stroke-linecap="round"/><path d="M-70,-34 L-70,0 M50,-34 L50,0" stroke="#fff" stroke-width="6"/></g>`).join('')}
  </g>
  <!-- coffee kiosk -->
  ${shadowEllipse(700, 870, 150, 12, 0.18)}
  <g transform="translate(700,870)">
    <rect x="-130" y="-230" width="260" height="230" rx="12" fill="#fff6ea"/>
    <rect x="-140" y="-270" width="280" height="50" rx="10" fill="#3fcfae"/>${[-105, -35, 35, 105].map((x) => `<path d="M${x - 35},-222 Q${x},-196 ${x + 35},-222 Z" fill="#fff"/>`).join('')}
    <text y="-236" text-anchor="middle" font-family="Marck Script" font-size="34" fill="#fff">Кофе на песке</text>
    <rect x="-110" y="-120" width="220" height="16" rx="6" fill="#c98b5a"/>
    <rect x="-80" y="-104" width="160" height="70" rx="10" fill="#f2c14e"/>${[-50, -20, 10, 40].map((x) => `<g transform="translate(${x + 5},-108)"><path d="M-8,-20 L8,-20 L6,0 L-6,0 Z" fill="#c4632a"/><path d="M-3,-20 L-3,-30" stroke="#8a5a33" stroke-width="2"/></g>`).join('')}
    <text y="-58" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="16" fill="#8a5a33">☕ ~ песок ~</text>
  </g>
  <!-- shells -->
  ${[[400, 920], [980, 960], [1260, 900], [1800, 950]].map(([x, y]) => `<g transform="translate(${x},${y})"><path d="M-14,6 Q0,-22 14,6 Z" fill="#ffd1dc"/><path d="M-8,4 L-3,-10 M0,4 L0,-14 M8,4 L3,-10" stroke="#f3a6bb" stroke-width="2"/></g>`).join('')}`;
}

const AMRA = NPC_OUTFITS.amra;

export const SCENE = {
  id: 'beach',
  city: 'abkhazia',
  name: 'Пляж',
  subtitle: 'Чёрное море · Сухум',
  width: W,
  floor: 925,
  spawn: 1150,
  indoor: false,
  music: 'abkhazia',
  hotspots: [
    { id: 'sea', x: 1100, y: 470, stand: 1100, label: 'Море', icon: '🌊', actions: ['swim', 'promenade'] },
    { id: 'kiosk', x: 700, y: 520, stand: 700, label: 'Кофе на песке', icon: '☕', actions: ['sandCoffee', 'icecream'] },
    { id: 'sunbed', x: 1500, y: 440, stand: 1500, label: 'Шезлонг', icon: '🏖️', actions: ['sunbathe', 'callLover', 'selfie', 'nap'] },
    { id: 'amra', x: 340, y: 450, stand: 510, label: 'Амра', icon: '👯‍♀️', npc: true, actions: ['amraChat', 'dance'] },
  ],
  npcs: [{ id: 'amra', x: 340, outfit: AMRA, hotspot: 'amra', h: 0.95 }],
};
