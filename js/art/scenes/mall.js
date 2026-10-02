// Shopping mall «Галерея». World 2000 × 1000.
import { isDark, pottedPlant } from './common.js';

export const W = 2000;

function store(x, w, name, color, inner, sign = '#fff') {
  return `<g>
    <rect x="${x}" y="200" width="${w}" height="590" fill="#fff"/>
    <rect x="${x}" y="200" width="${w}" height="90" fill="${color}"/>
    <text x="${x + w / 2}" y="260" text-anchor="middle" font-family="Marck Script" font-size="46" fill="${sign}">${name}</text>
    <rect x="${x + 20}" y="310" width="${w - 40}" height="470" rx="10" fill="#eef8ff" stroke="#d6e6f2" stroke-width="4"/>
    ${inner}
    <rect x="${x + 20}" y="310" width="${w - 40}" height="470" rx="10" fill="url(#mGlass)" opacity=".45"/>
    <path d="M${x + 40},330 L${x + 110},330 L${x + 40},440 Z" fill="#fff" opacity=".45"/>
  </g>`;
}

const mannequin = (x, y, dress) => `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="34" ry="6" fill="#ccc"/><rect x="-3" y="-60" width="6" height="60" fill="#bbb"/>
  <circle cx="0" cy="-232" r="20" fill="#f3e6dc"/><path d="M-30,-205 Q0,-215 30,-205 L22,-130 Q40,-70 46,-60 L-46,-60 Q-40,-70 -22,-130 Z" fill="${dress}"/></g>`;

export function paint({ phase }) {
  return `
  <defs>
    <linearGradient id="mGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>
    <linearGradient id="mFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4eef4"/><stop offset="1" stop-color="#e2d8e6"/></linearGradient>
  </defs>
  <rect width="${W}" height="800" fill="#f8f1f6"/>
  <rect width="${W}" height="190" fill="#fbf7fa"/>
  ${Array.from({ length: 10 }, (_, i) => `<circle cx="${100 + i * 200}" cy="70" r="26" fill="#fff6d6"/><circle cx="${100 + i * 200}" cy="70" r="44" fill="#fff6d6" opacity=".35"/>`).join('')}
  <rect y="180" width="${W}" height="20" fill="#e9dbe6"/>
  <rect y="780" width="${W}" height="220" fill="url(#mFloor)"/>
  ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 160 - 240},780 L${i * 160 - 240 + (i * 160 - 1000) * 0.45},1000" stroke="#d6c8d8" stroke-width="2"/>`).join('')}
  <path d="M0,830 L${W},830 M0,900 L${W},900" stroke="#d6c8d8" stroke-width="2"/>
  <ellipse cx="1000" cy="900" rx="700" ry="40" fill="#fff" opacity=".35"/>

  ${store(40, 440, 'Мандарин', '#ff9a2e', `${mannequin(160, 760, '#ff8fab')}${mannequin(260, 760, '#1d1a22')}${mannequin(360, 760, '#a9d4f5')}
    <rect x="90" y="360" width="340" height="12" rx="6" fill="#d9b25a"/>${[110, 150, 190, 230, 270, 310, 350, 390].map((x, i) => `<path d="M${x},372 l-18,60 l36,0 Z" fill="${['#ff8fab', '#fff', '#ffd36b', '#9fdcff', '#c9a9ff', '#b6e39a', '#ffb38a', '#ff6f9c'][i]}"/>`).join('')}`)}
  ${store(520, 380, 'Локон', '#c9a9ff', `<g transform="translate(710,560)"><ellipse rx="90" ry="110" fill="#fff" stroke="#e2d1ff" stroke-width="8"/><ellipse rx="70" ry="90" fill="#eaf6ff"/><path d="M-50,-60 L-10,-80" stroke="#fff" stroke-width="10" stroke-linecap="round"/></g>
    <rect x="600" y="680" width="220" height="20" rx="8" fill="#e2d1ff"/>${['#ff6f9c', '#ffd36b', '#9fdcff', '#3fcfae'].map((c, i) => `<rect x="${620 + i * 50}" y="650" width="16" height="30" rx="5" fill="${c}"/>`).join('')}
    <path d="M770,420 c-14,0 -20,16 -10,26 c10,10 30,0 24,-16" stroke="#c9a9ff" stroke-width="6" fill="none"/>`, '#fff')}
  ${store(940, 440, 'Хвостики', '#3fcfae', `
    <g transform="translate(1060,700)"><rect x="-70" y="-90" width="140" height="90" rx="10" fill="#fff6e6"/><path d="M-70,-90 Q0,-140 70,-90" fill="#ffcf9e"/>
      <circle cx="-20" cy="-40" r="22" fill="#ffad5e"/><path d="M-38,-56 L-34,-76 L-22,-60 Z M-2,-56 L-6,-76 L-18,-60 Z" fill="#ffad5e"/><circle cx="-27" cy="-42" r="3" fill="#333"/><circle cx="-13" cy="-42" r="3" fill="#333"/>
      <circle cx="30" cy="-34" r="16" fill="#f4b878"/><circle cx="25" cy="-36" r="2.4" fill="#333"/><circle cx="35" cy="-36" r="2.4" fill="#333"/></g>
    <g transform="translate(1260,560)"><path d="M-60,-40 Q0,-110 60,-40 L60,90 L-60,90 Z" fill="none" stroke="#c7c7d6" stroke-width="5"/>${[-40, -20, 0, 20, 40].map((x) => `<path d="M${x},-60 L${x},90" stroke="#c7c7d6" stroke-width="3"/>`).join('')}
      <ellipse cx="0" cy="30" rx="22" ry="28" fill="#58c97a"/><circle cx="0" cy="-6" r="18" fill="#ff9a6a"/><circle cx="-6" cy="-8" r="3" fill="#333"/><path d="M4,0 l10,4 l-10,4 Z" fill="#ffe08a"/></g>
    ${[1040, 1120, 1200, 1280].map((x, i) => `<rect x="${x - 30}" y="400" width="60" height="80" rx="10" fill="${['#ffd59a', '#ffb3cb', '#9fdcff', '#c9f2d9'][i]}"/><text x="${x}" y="450" text-anchor="middle" font-size="28">🦴</text>`).join('')}`)}
  ${store(1420, 540, 'Продукты', '#ff6f9c', `
    ${[380, 500, 620].map((y, r) => `<rect x="1460" y="${y + 60}" width="460" height="12" rx="4" fill="#e6c9a8"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${1470 + i * 50}" y="${y}" width="40" height="60" rx="8" fill="${['#ff9a2e', '#7fd3c4', '#ffd36b', '#ff8fab', '#9fdcff', '#b6e39a', '#c9a9ff', '#ffb38a', '#fff'][(i + r * 3) % 9]}"/>`).join('')}`).join('')}
    <g transform="translate(1690,760)"><path d="M-60,-60 L60,-60 L50,0 L-50,0 Z" fill="#c7c7d6"/><circle cx="-36" cy="10" r="10" fill="#555"/><circle cx="36" cy="10" r="10" fill="#555"/>
    <circle cx="-20" cy="-70" r="16" fill="#ff9a2e"/><circle cx="8" cy="-74" r="14" fill="#7fd36a"/><rect x="20" y="-100" width="20" height="40" rx="6" fill="#fff"/></g>`)}
  ${pottedPlant(500, 790, 1.5, '#f7a48b')}${pottedPlant(920, 790, 1.3, '#9fdcff')}${pottedPlant(1395, 790, 1.4, '#ffcf6b')}
  ${isDark(phase) ? '<rect width="2000" height="1000" fill="#1b1640" opacity=".05"/>' : ''}`;
}

export const SCENE = {
  id: 'mall',
  city: 'moscow',
  name: 'ТЦ «Галерея»',
  subtitle: 'Шопинг, салон и зоомагазин',
  width: W,
  floor: 905,
  spawn: 1000,
  music: 'moscow',
  hotspots: [
    { id: 'boutique', x: 260, y: 310, stand: 260, label: 'Бутик «Мандарин»', icon: '👗', actions: ['boutique', 'fashionShow', 'selfie'] },
    { id: 'salon', x: 710, y: 330, stand: 710, label: 'Салон «Локон»', icon: '💇‍♀️', actions: ['salon', 'makeup'] },
    { id: 'pets', x: 1160, y: 330, stand: 1160, label: 'Зоомагазин', icon: '🐾', actions: ['petshop'] },
    { id: 'grocery', x: 1690, y: 330, stand: 1690, label: 'Продукты', icon: '🛒', actions: ['grocery', 'foodcourt'] },
  ],
};
