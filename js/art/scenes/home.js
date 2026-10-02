// Family home in Sukhum. World 2000 × 1000.
import { skyDefs, isDark, stars, moon, sun, cloud, mountains, palm, pottedPlant, shadowEllipse, steam } from './common.js';
import { NPC_OUTFITS } from '../../data/npcs.js';

export const W = 2000;

export function paint({ phase }) {
  const dark = isDark(phase);
  return `
  <defs>${skyDefs('hSky', phase)}
    <linearGradient id="hWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4e6"/><stop offset="1" stop-color="#fbe6cf"/></linearGradient>
    <linearGradient id="hSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dark ? '#2b3c7a' : '#4fc0ef'}"/><stop offset="1" stop-color="${dark ? '#1b2650' : '#2a8fd0'}"/></linearGradient>
    <pattern id="hTile" width="90" height="45" patternUnits="userSpaceOnUse"><rect width="90" height="45" fill="#d98c5f"/><rect x="2" y="2" width="86" height="41" rx="4" fill="#e39a6b"/></pattern>
    <pattern id="hRug" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#c94a4a"/><path d="M20,4 L36,20 L20,36 L4,20 Z" fill="#f2c14e"/><circle cx="20" cy="20" r="5" fill="#2f6b9a"/></pattern>
    <clipPath id="hArch"><path d="M720,790 L720,330 Q900,170 1080,330 L1080,790 Z"/></clipPath>
  </defs>
  <rect width="${W}" height="790" fill="url(#hWall)"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${i * 320 - 20}" y="0" width="40" height="790" fill="#f3dcc0" opacity=".5"/>`).join('')}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 280}" y="0" width="${W}" height="0" />`).join('')}
  <rect width="${W}" height="70" fill="#a8703f"/>${[100, 400, 700, 1000, 1300, 1600, 1900].map((x) => `<rect x="${x - 26}" y="0" width="52" height="96" rx="6" fill="#8a5a33"/>`).join('')}
  <rect y="780" width="${W}" height="220" fill="url(#hTile)"/>
  <rect y="770" width="${W}" height="16" fill="#c98b5a"/>
  <!-- rug -->
  <ellipse cx="1000" cy="905" rx="460" ry="64" fill="url(#hRug)"/><ellipse cx="1000" cy="905" rx="460" ry="64" fill="none" stroke="#f2c14e" stroke-width="8"/>

  <!-- bed -->
  <rect x="40" y="500" width="40" height="300" rx="12" fill="#a8703f"/>
  <rect x="60" y="690" width="420" height="40" rx="10" fill="#b77a4c"/>
  <rect x="76" y="728" width="18" height="66" rx="4" fill="#8a5a33"/><rect x="450" y="728" width="18" height="66" rx="4" fill="#8a5a33"/>
  <rect x="70" y="642" width="406" height="56" rx="20" fill="#fffaf2"/>
  <ellipse cx="150" cy="632" rx="70" ry="28" fill="#fff" stroke="#f1dfcf" stroke-width="3"/>
  <path d="M200,640 C230,612 470,612 482,640 L490,722 Q340,744 194,722 Z" fill="#3f8fc9"/>
  ${[0, 1, 2, 3, 4].map((i) => `<path d="M${214 + i * 56},650 l20,26 l-20,26 l-20,-26 Z" fill="#f2c14e" opacity=".9"/><circle cx="${214 + i * 56}" cy="676" r="5" fill="#fff"/>`).join('')}
  <!-- family photos -->
  ${[[120, 300, -4, '#ffd8a8'], [260, 280, 3, '#c7e7ff'], [380, 310, -2, '#ffc6dc']].map(([x, y, r, c]) => `<g transform="translate(${x},${y}) rotate(${r})"><rect x="-54" y="-44" width="108" height="88" rx="4" fill="#8a5a33"/><rect x="-46" y="-36" width="92" height="72" fill="${c}"/>
    <circle cx="-14" cy="-6" r="10" fill="#f9d6c3"/><path d="M-24,36 q10,-26 20,0" fill="#ff8fab"/><circle cx="14" cy="-2" r="12" fill="#f9d6c3"/><path d="M0,36 q14,-30 28,0" fill="#3f8fc9"/><path d="M-22,-10 q8,-14 16,0" fill="#4a2814"/><path d="M4,-8 q10,-16 20,0" fill="#2a2228"/></g>`).join('')}

  <!-- wardrobe -->
  ${shadowEllipse(570, 798, 100, 10, 0.12)}
  <rect x="490" y="290" width="170" height="505" rx="12" fill="#b77a4c"/><rect x="480" y="276" width="190" height="24" rx="8" fill="#a8703f"/>
  <rect x="504" y="310" width="68" height="470" rx="8" fill="#c98b5a"/><rect x="578" y="310" width="68" height="470" rx="8" fill="#c98b5a"/>
  <path d="M520,340 q18,30 36,0 M594,340 q18,30 36,0" stroke="#a8703f" stroke-width="4" fill="none"/>
  <circle cx="564" cy="540" r="6" fill="#f2c14e"/><circle cx="588" cy="540" r="6" fill="#f2c14e"/>

  <!-- arched balcony door with sea view -->
  <path d="M700,800 L700,326 Q900,140 1100,326 L1100,800 Z" fill="#fff"/>
  <g clip-path="url(#hArch)">
    <rect x="700" y="160" width="400" height="640" fill="url(#hSky)"/>
    ${dark ? stars(400, 260, 22).replace(/cx="([\d.]+)"/g, (m, v) => `cx="${700 + +v}"`).replace(/cy="([\d.]+)"/g, (m, v) => `cy="${170 + +v}"`) + moon(1010, 300, 22) : sun(980, 330, 34, '#fff3b0') + cloud(820, 300, 0.5)}
    <g transform="translate(700,0) scale(.3,1)">${mountains(1400, 560, dark ? ['#2b3a5a', '#3b4a70'] : ['#7fae8a', '#a9c6dc'])}</g>
    <rect x="700" y="540" width="400" height="260" fill="url(#hSea)"/>
    <path d="M720,600 q30,-6 60,0 M880,640 q40,-6 80,0 M780,700 q30,-6 60,0" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>
    ${dark ? '<path d="M1000,560 L1040,800 L960,800 Z" fill="#fff6d6" opacity=".25"/>' : ''}
    <g transform="translate(0,140)">${palm(1050, 640, 0.9)}</g>
    <rect x="700" y="660" width="400" height="18" fill="#fff"/>${Array.from({ length: 11 }, (_, i) => `<rect x="${706 + i * 38}" y="676" width="12" height="124" rx="6" fill="#fff"/>`).join('')}
  </g>
  <path d="M700,800 L700,326 Q900,140 1100,326 L1100,800" fill="none" stroke="#fff" stroke-width="22"/>
  <path d="M680,300 C700,200 760,160 800,180" stroke="#4caf72" stroke-width="10" fill="none" stroke-linecap="round"/>
  ${[[700, 240], [740, 196], [790, 186], [690, 300]].map(([x, y]) => `<path d="M${x},${y} q16,-18 30,0 q-16,18 -30,0 Z" fill="#5cbf6a"/>`).join('')}
  ${[[714, 260], [760, 214]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#7a3a8a"/><circle cx="${x + 10}" cy="${y + 4}" r="7" fill="#7a3a8a"/><circle cx="${x + 5}" cy="${y + 12}" r="7" fill="#7a3a8a"/>`).join('')}

  <!-- kitchen table with food -->
  ${shadowEllipse(1360, 800, 220, 12, 0.15)}
  <rect x="1150" y="610" width="420" height="22" rx="8" fill="#a8703f"/>
  <path d="M1140,606 L1580,606 L1590,650 L1130,650 Z" fill="#fffaf2"/>${[1160, 1220, 1280, 1340, 1400, 1460, 1520].map((x) => `<rect x="${x}" y="606" width="30" height="44" fill="#e94b5a" opacity=".22"/>`).join('')}
  <rect x="1170" y="650" width="18" height="146" fill="#8a5a33"/><rect x="1532" y="650" width="18" height="146" fill="#8a5a33"/>
  <!-- khachapuri -->
  <g transform="translate(1250,600)"><ellipse rx="56" ry="14" fill="#fff" stroke="#eee" stroke-width="2"/><path d="M-50,-2 Q0,-34 50,-2 Q0,-10 -50,-2 Z" fill="#e8a65a"/><ellipse cx="0" cy="-10" rx="26" ry="8" fill="#fff4c4"/><circle cx="0" cy="-12" r="6" fill="#ffb02e"/></g>
  ${steam(1250, 578, 0.5)}
  <!-- mamalyga & adjika -->
  <g transform="translate(1360,600)"><ellipse rx="30" ry="9" fill="#fff" stroke="#eee" stroke-width="2"/><ellipse cy="-8" rx="22" ry="12" fill="#ffe08a"/></g>
  <g transform="translate(1420,600)"><rect x="-14" y="-30" width="28" height="30" rx="6" fill="#d23b2b"/><rect x="-16" y="-36" width="32" height="8" rx="3" fill="#f2c14e"/></g>
  <!-- mandarin bowl & jug -->
  <g transform="translate(1500,600)"><path d="M-40,-10 Q0,22 40,-10 Z" fill="#f2e3d0"/>${[[-14, -16], [10, -18], [-2, -30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#ff9a2e"/>`).join('')}</g>
  <g transform="translate(1180,600)"><path d="M-14,0 L-18,-50 Q0,-60 18,-50 L14,0 Z" fill="#9fdcff" opacity=".85"/><path d="M-16,-30 L16,-30 L14,0 L-14,0 Z" fill="#ffb3cb"/></g>
  <!-- chairs -->
  ${[1210, 1510].map((x) => `<rect x="${x - 30}" y="560" width="60" height="140" rx="10" fill="#c98b5a"/><rect x="${x - 38}" y="694" width="76" height="16" rx="6" fill="#b77a4c"/><rect x="${x - 30}" y="708" width="8" height="88" fill="#8a5a33"/><rect x="${x + 22}" y="708" width="8" height="88" fill="#8a5a33"/>`).join('')}
  <!-- lamp -->
  <path d="M1360,0 L1360,240" stroke="#6b4a2a" stroke-width="3"/><path d="M1310,290 Q1360,220 1410,290 Z" fill="#f2c14e"/><ellipse cx="1360" cy="292" rx="50" ry="10" fill="#fff3b0"/>
  ${dark ? '<circle cx="1360" cy="340" r="200" fill="#fff3b0" opacity=".14"/>' : ''}

  <!-- stove -->
  <rect x="1640" y="560" width="200" height="236" rx="12" fill="#f2f2f6" stroke="#ddd" stroke-width="3"/>
  <rect x="1660" y="640" width="160" height="110" rx="8" fill="#3b3343"/><rect x="1672" y="652" width="136" height="60" rx="6" fill="#ffb02e" opacity=".35"/>
  ${[1690, 1740, 1790].map((x) => `<circle cx="${x}" cy="590" r="10" fill="#c7c7d6"/>`).join('')}
  <g transform="translate(1720,556)"><rect x="-50" y="-60" width="100" height="60" rx="10" fill="#ff8fab"/><rect x="-60" y="-66" width="120" height="12" rx="6" fill="#ff6f9c"/>${dark ? '' : '<path class="amb-steam" d="M-20,-80 q10,-20 0,-40 M10,-80 q10,-20 0,-40" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/>'}</g>
  ${[1660, 1700, 1740, 1780, 1820].map((x, i) => `<path d="M${x},380 L${x},${430 + (i % 2) * 20}" stroke="#a8703f" stroke-width="2"/><circle cx="${x}" cy="${440 + (i % 2) * 20}" r="10" fill="${['#e94b5a', '#f2c14e', '#e94b5a', '#4caf72', '#f2c14e'][i]}"/>`).join('')}
  <rect x="1640" y="370" width="200" height="12" rx="6" fill="#a8703f"/>

  <!-- bathroom door -->
  <rect x="1880" y="300" width="120" height="494" rx="8" fill="#a8703f"/><rect x="1892" y="314" width="108" height="472" rx="6" fill="#c98b5a"/>
  <circle cx="1904" cy="560" r="8" fill="#f2c14e"/>
  <rect x="1912" y="360" width="76" height="40" rx="10" fill="#fff"/><text x="1950" y="388" text-anchor="middle" font-size="24">🛁</text>
  ${pottedPlant(1600, 790, 1.1, '#e39a6b')}`;
}

const MOM = NPC_OUTFITS.mom;

export const SCENE = {
  id: 'home',
  city: 'abkhazia',
  name: 'Дом в Сухуме',
  subtitle: 'Абхазия · мама и море',
  width: W,
  floor: 905,
  spawn: 980,
  music: 'abkhazia',
  hotspots: [
    { id: 'bed', x: 300, y: 560, stand: 400, label: 'Кровать', icon: '🛏️', actions: ['sleep', 'callLover', 'nap', 'phoneScroll'] },
    { id: 'wardrobe', x: 575, y: 260, stand: 575, label: 'Шкаф', icon: '👗', actions: ['wardrobe', 'makeup'] },
    { id: 'balcony', x: 900, y: 260, stand: 900, label: 'Балкон', icon: '🌊', actions: ['balcony', 'selfie', 'puzzle'] },
    { id: 'table', x: 1360, y: 520, stand: 1330, label: 'Мамин стол', icon: '🥘', actions: ['mamaFood', 'khachapuri', 'helpCook', 'tea'] },
    { id: 'mom', x: 1720, y: 420, stand: 1550, label: 'Мама', icon: '🤗', npc: true, actions: ['momTalk'] },
    { id: 'bath', x: 1940, y: 460, stand: 1900, label: 'Ванная', icon: '🛁', actions: ['shower', 'brushTeeth'] },
  ],
  npcs: [{ id: 'mom', x: 1720, outfit: MOM, hotspot: 'mom', h: 0.97, flip: true }],
  petSpot: 520,
};
