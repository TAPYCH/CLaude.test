// Coffee shop «Пенка». World 1800 × 1000.
import { skyDefs, isDark, cloud, moon, pottedPlant, shadowEllipse, stringLights } from './common.js';

export const W = 1800;

const cup = (x, y, s = 1, c = '#fff') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-14,-20 L14,-20 L11,0 L-11,0 Z" fill="${c}"/><path d="M14,-15 q8,0 7,7 q-1,5 -8,4" fill="none" stroke="${c}" stroke-width="3"/><ellipse cx="0" cy="-20" rx="14" ry="3.5" fill="#b07a52"/><path d="M-4,-20 c-2,-3 2,-5 4,-2 c2,-3 6,-1 4,2 l-4,3 Z" fill="#fff" opacity=".8"/></g>`;

export function paint({ phase }) {
  const dark = isDark(phase);
  return `
  <defs>${skyDefs('kSky', phase)}
    <pattern id="kBrick" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="#f6c9b0"/><rect x="2" y="2" width="76" height="16" rx="3" fill="#f8d6c2"/><rect x="-38" y="22" width="76" height="16" rx="3" fill="#f8d6c2"/><rect x="42" y="22" width="76" height="16" rx="3" fill="#f8d6c2"/></pattern>
    <linearGradient id="kWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98b5a"/><stop offset="1" stop-color="#a86d42"/></linearGradient>
    <radialGradient id="kGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2b8" stop-opacity=".8"/><stop offset="1" stop-color="#fff2b8" stop-opacity="0"/></radialGradient>
    <clipPath id="kWin"><rect x="1240" y="200" width="460" height="420" rx="16"/></clipPath>
  </defs>
  <rect width="${W}" height="790" fill="#ffe9da"/>
  <rect x="0" width="620" height="790" fill="url(#kBrick)"/>
  <rect y="780" width="${W}" height="220" fill="#8d6a55"/>
  ${Array.from({ length: 10 }, (_, i) => `<path d="M0,${790 + i * i * 2.4} L${W},${790 + i * i * 2.4}" stroke="#7a5a47" stroke-width="2"/>`).join('')}
  ${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 120 - 300},780 L${i * 120 - 300 + (i * 120 - 900) * 0.4},1000" stroke="#7a5a47" stroke-width="2" opacity=".5"/>`).join('')}
  <rect y="770" width="${W}" height="14" fill="#c98b5a"/>
  <!-- logo -->
  <g transform="translate(300,130)">
    <circle r="78" fill="#fff" stroke="#ff9cbc" stroke-width="8"/>
    ${cup(0, 22, 2.2, '#ff8fab')}
    <text y="58" text-anchor="middle" font-family="Marck Script" font-size="34" fill="#a8614a">Пенка</text>
  </g>
  ${stringLights(640, 1200, 60, 30)}
  <!-- menu board -->
  <rect x="660" y="140" width="300" height="320" rx="14" fill="#3b3440" stroke="#c98b5a" stroke-width="10"/>
  <text x="810" y="196" text-anchor="middle" font-family="Marck Script" font-size="42" fill="#fff">Меню</text>
  ${[['Капучино', '220'], ['Латте', '240'], ['Раф', '280'], ['Матча', '300'], ['Круассан', '180']].map(([n, p], i) => `<text x="690" y="${246 + i * 42}" font-family="Nunito" font-weight="800" font-size="22" fill="#ffe9da">${n}</text><text x="930" y="${246 + i * 42}" text-anchor="end" font-family="Nunito" font-weight="900" font-size="22" fill="#ffc96b">${p}</text>`).join('')}
  <path d="M700,440 q20,-14 40,0 q20,14 40,0" stroke="#ff9cbc" stroke-width="3" fill="none"/>

  <!-- counter -->
  ${shadowEllipse(320, 798, 300, 10, 0.18)}
  <rect x="40" y="560" width="560" height="236" rx="14" fill="url(#kWood)"/>
  <rect x="30" y="546" width="580" height="26" rx="10" fill="#f3e2d3"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${60 + i * 76}" y="590" width="56" height="190" rx="10" fill="#b77a4c" opacity=".6"/>`).join('')}
  <!-- espresso machine -->
  <g transform="translate(150,546)"><rect x="-80" y="-150" width="160" height="150" rx="16" fill="#e8e8f0"/><rect x="-80" y="-150" width="160" height="34" rx="14" fill="#ff8fab"/>
    <rect x="-60" y="-104" width="120" height="16" rx="6" fill="#c7c7d6"/>${[-36, 0, 36].map((x) => `<rect x="${x - 8}" y="-88" width="16" height="22" rx="3" fill="#8a8a9a"/>`).join('')}
    ${cup(-36, -10, 0.9)}${cup(36, -10, 0.9)}<circle cx="56" cy="-132" r="7" fill="#fff"/><circle cx="-56" cy="-132" r="7" fill="#3fcfae"/></g>
  <!-- pastry display -->
  <g transform="translate(420,546)"><rect x="-130" y="-130" width="260" height="130" rx="16" fill="#e9f6ff" opacity=".85" stroke="#fff" stroke-width="5"/>
    <rect x="-120" y="-66" width="240" height="6" fill="#fff"/>
    ${[-90, -30, 30, 90].map((x, i) => `<g transform="translate(${x},-74)"><path d="M-22,0 C-22,-18 22,-18 22,0 Z" fill="${['#f4b26a', '#ff9cbc', '#c98b5a', '#ffd36b'][i]}"/><path d="M-14,-8 q14,-10 28,0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></g>`).join('')}
    ${[-90, -30, 30, 90].map((x, i) => `<g transform="translate(${x},-10)"><rect x="-22" y="-26" width="44" height="26" rx="6" fill="${['#ffd6e4', '#fff1c9', '#e2d1ff', '#d6f5e8'][i]}"/><circle cy="-30" r="6" fill="#ff6f9c"/></g>`).join('')}
  </g>
  <!-- hanging lamps -->
  ${[160, 440].map((x) => `<path d="M${x},0 L${x},300" stroke="#6b5a4a" stroke-width="3"/><path d="M${x - 40},340 Q${x},280 ${x + 40},340 Z" fill="#ffcf6b"/><ellipse cx="${x}" cy="342" rx="40" ry="8" fill="#fff6d6"/>${dark ? `<circle cx="${x}" cy="380" r="120" fill="url(#kGlow)"/>` : ''}`).join('')}

  <!-- tables -->
  ${[900, 1130].map((x, i) => `
    ${shadowEllipse(x, 798, 110, 10, 0.15)}
    <rect x="${x - 8}" y="650" width="16" height="140" fill="#6b5a4a"/><ellipse cx="${x}" cy="792" rx="50" ry="8" fill="#6b5a4a"/>
    <ellipse cx="${x}" cy="644" rx="100" ry="18" fill="#fff6ea"/><ellipse cx="${x}" cy="640" rx="100" ry="16" fill="#ffffff"/>
    ${cup(x - 30, 636, 1, i ? '#9fdcff' : '#ffb3cb')}<g transform="translate(${x + 30},634)"><ellipse rx="24" ry="6" fill="#fff" stroke="#eee" stroke-width="2"/><path d="M-16,-2 C-16,-16 16,-16 16,-2 Z" fill="#f4b26a"/></g>
    ${[-110, 110].map((d) => `<g transform="translate(${x + d},0)"><rect x="-30" y="560" width="60" height="130" rx="16" fill="${d < 0 ? '#ffb3cb' : '#9fdcff'}"/><rect x="-36" y="686" width="72" height="16" rx="8" fill="${d < 0 ? '#ff9cbc' : '#7fc8f0'}"/><rect x="-26" y="700" width="8" height="92" fill="#6b5a4a"/><rect x="18" y="700" width="8" height="92" fill="#6b5a4a"/></g>`).join('')}`).join('')}

  <!-- window to the street -->
  <rect x="1226" y="186" width="488" height="448" rx="22" fill="#fff"/>
  <g clip-path="url(#kWin)"><rect x="1240" y="200" width="460" height="420" fill="url(#kSky)"/>
    ${dark ? moon(1620, 260, 18) : cloud(1360, 280, 0.6)}
    <rect x="1240" y="470" width="460" height="150" fill="${dark ? '#3b3a5a' : '#c9c2d9'}"/>
    ${[1260, 1380, 1520].map((x, i) => `<rect x="${x}" y="${330 + i * 20}" width="110" height="${150 - i * 20}" fill="${dark ? '#2e2c48' : ['#f2b8a0', '#b8d0f2', '#f2dca0'][i]}"/>${[0, 1, 2].map((j) => `<rect x="${x + 14 + j * 32}" y="${350 + i * 20}" width="20" height="26" fill="${dark ? '#ffd97a' : '#fff'}" opacity=".85"/>`).join('')}`).join('')}
    <rect x="1240" y="560" width="460" height="60" fill="${dark ? '#45436a' : '#a9a3bd'}"/>
    <path d="M1240,590 L1700,590" stroke="#fff" stroke-width="5" stroke-dasharray="30 24"/>
  </g>
  <rect x="1466" y="200" width="8" height="420" fill="#fff"/>
  <text x="1470" y="190" text-anchor="middle" font-family="Marck Script" font-size="0" fill="#a8614a">.</text>
  <!-- sofa -->
  ${shadowEllipse(1470, 798, 260, 12, 0.16)}
  <rect x="1240" y="610" width="460" height="110" rx="40" fill="#ffb3cb"/><rect x="1220" y="660" width="500" height="120" rx="30" fill="#ff9cbc"/>
  <rect x="1260" y="640" width="200" height="60" rx="24" fill="#ffc6da"/><rect x="1480" y="640" width="200" height="60" rx="24" fill="#ffc6da"/>
  <rect x="1260" y="780" width="18" height="18" fill="#6b5a4a"/><rect x="1662" y="780" width="18" height="18" fill="#6b5a4a"/>
  <rect x="1300" y="600" width="64" height="64" rx="16" fill="#fff6d6" transform="rotate(-10 1332 632)"/>
  ${pottedPlant(1760, 790, 1.3, '#f7a48b')}
  ${isDark(phase) ? '<rect width="1800" height="1000" fill="#2b1840" opacity=".08"/>' : ''}`;
}

export const SCENE = {
  id: 'cafe',
  city: 'moscow',
  name: 'Кофейня «Пенка»',
  subtitle: 'Лучший раф на районе',
  width: W,
  floor: 905,
  spawn: 900,
  music: 'moscow',
  hotspots: [
    { id: 'counter', x: 320, y: 300, stand: 330, label: 'Стойка бариста', icon: '☕', actions: ['work', 'vending'] },
    { id: 'table', x: 1010, y: 500, stand: 1010, label: 'Столик', icon: '🥐', actions: ['coffeeDessert', 'chatGuests', 'study'] },
    { id: 'sofa', x: 1470, y: 520, stand: 1470, label: 'Диванчик', icon: '🛋️', actions: ['phoneScroll', 'selfie', 'callMom'] },
  ],
};
