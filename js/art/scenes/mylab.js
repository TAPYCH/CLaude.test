// Lana's own dental lab in Sukhum — equipment appears as it is bought. World 1900 × 1000.
import { skyDefs, isDark, stars, moon, sun, cloud, palm, pottedPlant, shadowEllipse } from './common.js';

export const W = 1900;

const has = (S, id) => !!(S && S.lab && S.lab.upgrades.includes(id));

function placeholder(x, y, w, h, label) {
  return `<g opacity=".55"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="none" stroke="#9fc8bc" stroke-width="4" stroke-dasharray="14 10"/>
    <text x="${x + w / 2}" y="${y + h / 2 + 8}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#7fb3a6">${label}</text></g>`;
}

export function paint({ phase, S }) {
  const dark = isDark(phase);
  return `
  <defs>${skyDefs('mlSky', phase)}
    <linearGradient id="mlWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2fbf8"/><stop offset="1" stop-color="#e2f4ee"/></linearGradient>
    <linearGradient id="mlSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark ? '#2b3c7a' : '#4fc0ef'}"/><stop offset="1" stop-color="${dark ? '#1b2650' : '#2a8fd0'}"/></linearGradient>
    <radialGradient id="mlGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb35e" stop-opacity=".9"/><stop offset="1" stop-color="#ff7a2e" stop-opacity="0"/></radialGradient>
    <clipPath id="mlWin"><rect x="110" y="170" width="440" height="380" rx="16"/></clipPath>
  </defs>
  <rect width="${W}" height="790" fill="url(#mlWall)"/>
  <rect y="560" width="${W}" height="230" fill="#ffffff" opacity=".6"/>
  <rect y="552" width="${W}" height="10" fill="#c6e9df"/>
  <rect y="780" width="${W}" height="220" fill="#e6c9a8"/>
  ${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 140 - 280},780 L${i * 140 - 280 + (i * 140 - 950) * 0.4},1000" stroke="#d4b591" stroke-width="2"/>`).join('')}
  <rect y="770" width="${W}" height="14" fill="#9fd6c6"/>

  <!-- window with Sukhum sea view -->
  <rect x="96" y="156" width="468" height="408" rx="22" fill="#fff"/>
  <g clip-path="url(#mlWin)">
    <rect x="110" y="170" width="440" height="380" fill="url(#mlSky)"/>
    ${dark ? stars(440, 200, 20).replace(/cx="([\d.]+)"/g, (m, v) => `cx="${110 + +v}"`).replace(/cy="([\d.]+)"/g, (m, v) => `cy="${170 + +v}"`) + moon(480, 230, 20) : sun(470, 240, 26, '#fff3b0') + cloud(220, 240, 0.5)}
    <path d="M110,380 C200,340 300,370 380,350 C450,335 520,360 550,350 L550,400 L110,400 Z" fill="${dark ? '#2a3d5c' : '#7fae8a'}"/>
    <rect x="110" y="400" width="440" height="150" fill="url(#mlSea)"/>
    <path d="M140,440 q30,-6 60,0 M300,470 q40,-6 80,0 M200,510 q30,-6 60,0" stroke="#fff" stroke-width="3" opacity=".6" fill="none" class="ml-waves"/>
    <g transform="translate(0,40)">${palm(500, 540, 0.8)}</g>
  </g>
  <rect x="326" y="170" width="8" height="380" fill="#fff"/>
  <rect x="80" y="556" width="500" height="22" rx="8" fill="#f2fbf8"/>

  <!-- sign on the wall -->
  ${has(S, 'sign')
    ? `<g transform="translate(1210,120)"><rect x="-190" y="-50" width="380" height="100" rx="50" fill="#fff" stroke="#ff9cbc" stroke-width="6"/>
        <text x="0" y="14" text-anchor="middle" font-family="Marck Script" font-size="54" fill="#ff6f9c">Lana Dental</text>
        <text x="150" y="-14" font-size="34">🦷</text>${dark ? '<rect x="-190" y="-50" width="380" height="100" rx="50" fill="#ff9cbc" opacity=".15"/>' : ''}</g>`
    : placeholder(1030, 70, 360, 100, 'место для вывески')}

  <!-- waiting zone -->
  ${has(S, 'plants')
    ? `${shadowEllipse(330, 800, 230, 12, 0.15)}<rect x="130" y="640" width="400" height="90" rx="36" fill="#7fd3c4"/><rect x="110" y="680" width="440" height="100" rx="30" fill="#6cc3b4"/>
       <rect x="150" y="660" width="170" height="54" rx="22" fill="#a8e6db"/><rect x="340" y="660" width="170" height="54" rx="22" fill="#a8e6db"/>
       ${pottedPlant(80, 790, 1.4, '#f7a48b')}${pottedPlant(590, 790, 1.1, '#ffcf6b')}`
    : `${placeholder(120, 620, 440, 160, 'зона ожидания')}`}

  <!-- workbench (always) -->
  ${shadowEllipse(830, 800, 240, 12, 0.14)}
  <path d="M700,300 L700,410" stroke="#c4d3d0" stroke-width="5"/><path d="M650,410 L750,410 L734,440 L666,440 Z" fill="#fff" stroke="#d8e6e2" stroke-width="3"/><ellipse cx="700" cy="442" rx="34" ry="8" fill="#fffbe0"/>
  <rect x="620" y="610" width="430" height="26" rx="8" fill="#f4f8fb"/>
  <rect x="632" y="634" width="406" height="160" rx="10" fill="#e1ecf3"/>
  ${[0, 1, 2].map((i) => `<rect x="${650 + i * 130}" y="652" width="114" height="56" rx="8" fill="#eef5fa"/><rect x="${690 + i * 130}" y="676" width="34" height="8" rx="4" fill="#b9cbd9"/>`).join('')}
  <g transform="translate(700,610)"><rect x="-40" y="-14" width="80" height="14" rx="4" fill="#9fb4c8"/><path d="M-30,-14 L-30,-70 L30,-70" stroke="#9fb4c8" stroke-width="6" fill="none"/>
    <path d="M-30,-14 C-30,-40 30,-40 30,-14 Z" fill="#f59cb0"/><path d="M-30,-56 C-30,-30 30,-30 30,-56 Z" fill="#f59cb0"/></g>
  ${has(S, 'microscope')
    ? `<g transform="translate(900,610)"><rect x="-34" y="-10" width="68" height="10" rx="4" fill="#3b4a5a"/><path d="M-6,-10 L-6,-110 L30,-140" stroke="#3b4a5a" stroke-width="12" fill="none" stroke-linecap="round"/>
        <rect x="18" y="-160" width="22" height="40" rx="6" fill="#5a6b7a" transform="rotate(30 29 -140)"/><circle cx="-6" cy="-64" r="10" fill="#7fd3ff"/><rect x="-30" y="-50" width="50" height="8" rx="3" fill="#c4d3dc"/></g>`
    : placeholder(850, 470, 110, 130, '🔬')}
  <rect x="660" y="700" width="80" height="16" rx="8" fill="#7fd3c4"/><rect x="696" y="716" width="8" height="60" fill="#b9c8cf"/>

  <!-- furnace -->
  ${has(S, 'furnace')
    ? `${shadowEllipse(1170, 800, 90, 8, 0.15)}<rect x="1090" y="480" width="160" height="314" rx="16" fill="#f2f2f6" stroke="#d6dbe4" stroke-width="3"/>
       <rect x="1110" y="520" width="120" height="110" rx="12" fill="#3b3343"/><rect x="1124" y="534" width="92" height="82" rx="8" fill="#ff8a3d"/>
       <circle cx="1170" cy="575" r="90" fill="url(#mlGlow)" opacity=".7"/><rect x="1120" y="660" width="100" height="14" rx="7" fill="#c7c7d6"/>
       <text x="1170" y="730" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="20" fill="#7d6078">930°C</text>`
    : placeholder(1090, 480, 160, 314, 'печь')}

  <!-- CAD/CAM mill -->
  ${has(S, 'mill')
    ? `${shadowEllipse(1360, 800, 100, 8, 0.15)}<rect x="1280" y="430" width="170" height="364" rx="18" fill="#ffffff" stroke="#d6dbe4" stroke-width="3"/>
       <rect x="1298" y="460" width="134" height="150" rx="12" fill="#cfe9ff"/><rect x="1300" y="462" width="130" height="146" rx="10" fill="#e9f6ff" opacity=".7"/>
       <rect x="1350" y="480" width="10" height="70" rx="4" fill="#9fb4c8" class="ml-spindle"/><circle cx="1365" cy="575" r="20" fill="#fffef8" stroke="#d8cfbd" stroke-width="3"/>
       <rect x="1300" y="640" width="130" height="34" rx="8" fill="#3b4a5a"/><circle cx="1320" cy="657" r="6" fill="#3fcfae"/><rect x="1336" y="652" width="80" height="10" rx="5" fill="#7fd3ff"/>`
    : placeholder(1280, 430, 170, 364, 'фрезер')}

  <!-- reception with catalogue tablet and coffee -->
  <rect x="1480" y="600" width="230" height="196" rx="14" fill="#ffd6e4"/><rect x="1470" y="586" width="250" height="24" rx="10" fill="#fff"/>
  <rect x="1500" y="530" width="70" height="52" rx="8" fill="#3b4a5a"/><rect x="1506" y="536" width="58" height="40" rx="5" fill="#9fe0ff"/>
  ${has(S, 'coffee')
    ? `<g transform="translate(1650,586)"><rect x="-38" y="-80" width="76" height="80" rx="12" fill="#e8e8f0"/><rect x="-38" y="-80" width="76" height="20" rx="10" fill="#ff8fab"/>
       <path d="M-12,-10 L12,-10 L9,0 L-9,0 Z" fill="#fff"/><path d="M-6,-30 q4,-10 0,-20" stroke="#fff" stroke-width="3" fill="none" class="ml-steam"/></g>`
    : placeholder(1600, 500, 90, 86, '☕')}

  <!-- door -->
  <rect x="1760" y="290" width="140" height="500" rx="8" fill="#7fd3c4"/><rect x="1772" y="304" width="128" height="480" rx="6" fill="#a8e6db"/>
  <rect x="1792" y="340" width="88" height="160" rx="8" fill="#e9f8ff" opacity=".85"/><circle cx="1784" cy="560" r="8" fill="#fff"/>
  ${S && S.flags && S.flags.opened ? '<g transform="translate(1830,260)">' + ['#ff6f9c', '#ffc23d', '#3fcfae', '#9a7bff'].map((c, i) => `<circle cx="${(i - 1.5) * 26}" cy="${(i % 2) * 8}" r="16" fill="${c}"/><path d="M${(i - 1.5) * 26},${16 + (i % 2) * 8} q4,20 -2,40" stroke="#999" fill="none"/>`).join('') + '</g>' : ''}
  ${dark ? '<rect width="1900" height="1000" fill="#1b1640" opacity=".08"/>' : ''}`;
}

export const SCENE = {
  id: 'mylab',
  city: 'abkhazia',
  name: 'Lana Dental',
  subtitle: 'Моя лаборатория · Сухум',
  width: W,
  floor: 905,
  spawn: 1000,
  music: 'abkhazia',
  hotspots: [
    { id: 'bench', x: 830, y: 470, stand: 830, label: 'Рабочее место', icon: '🦷', actions: ['labOrders', 'study'] },
    { id: 'shop', x: 1535, y: 470, stand: 1560, label: 'Оборудование', icon: '🔧', actions: ['labShop'] },
    { id: 'zone', x: 330, y: 470, stand: 360, label: 'Окно и отдых', icon: '🌊', actions: ['labRest', 'callLover', 'selfie'] },
    { id: 'door', x: 1830, y: 400, stand: 1700, label: 'Вход', icon: '🎉', actions: ['grandOpening'] },
  ],
};
