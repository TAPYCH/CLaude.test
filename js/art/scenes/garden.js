// Grandma's mandarin garden near Sukhum. World 2000 × 1000.
import { skyDefs, isDark, stars, moon, sun, cloud, mountains, mandarinTree, shadowEllipse } from './common.js';

export const W = 2000;

function chicken(x, y, s = 1, flip = false) {
  return `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s})">
    <ellipse cx="0" cy="-20" rx="24" ry="18" fill="#fff"/><circle cx="18" cy="-38" r="11" fill="#fff"/>
    <path d="M14,-50 q4,-8 8,0 q4,-8 8,2" fill="#e94b5a"/><path d="M28,-38 l9,3 l-9,3 Z" fill="#ffb02e"/><circle cx="21" cy="-40" r="2" fill="#333"/>
    <path d="M-22,-26 q-14,-8 -6,-20 q6,8 10,12" fill="#f0f0f0"/><path d="M-4,-2 l0,10 M6,-2 l0,10" stroke="#ffb02e" stroke-width="3"/></g>`;
}

export function paint({ phase }) {
  const dark = isDark(phase);
  return `
  <defs>${skyDefs('gSky', phase)}</defs>
  <rect width="${W}" height="1000" fill="url(#gSky)"/>
  ${dark ? stars(W, 380, 70) + moon(300, 140, 30) : sun(320, 160, 48) + cloud(900, 150, 0.9) + cloud(1600, 110, 1.1)}
  ${mountains(W, 600, dark ? ['#2a3d5c', '#3a4c74'] : ['#6fa97a', '#9fc0dc'])}
  <path d="M0,620 C300,590 700,630 1000,600 C1300,575 1700,615 ${W},595 L${W},1000 L0,1000 Z" fill="${dark ? '#3a6a4a' : '#8ccf72'}"/>
  <path d="M0,760 C400,730 900,770 1300,745 C1600,730 1850,750 ${W},740 L${W},1000 L0,1000 Z" fill="${dark ? '#45795a' : '#a2dc84'}"/>
  ${[[150, 690, 0.55], [420, 670, 0.5], [1250, 660, 0.5], [1560, 680, 0.55], [1850, 670, 0.5]].map(([x, y, s]) => mandarinTree(x, y, s)).join('')}
  <!-- house porch -->
  <g transform="translate(1520,0)">
    <rect x="0" y="380" width="460" height="420" fill="#fff4e6"/><path d="M-30,390 L230,250 L490,390 Z" fill="#c4632a"/><path d="M-30,390 L230,250 L490,390" stroke="#a8502a" stroke-width="10" fill="none"/>
    <rect x="40" y="460" width="110" height="110" rx="8" fill="#9fdcff" stroke="#fff" stroke-width="10"/><path d="M95,460 L95,570 M40,515 L150,515" stroke="#fff" stroke-width="6"/>
    <rect x="300" y="470" width="110" height="330" rx="6" fill="#a8703f"/><circle cx="320" cy="640" r="7" fill="#f2c14e"/>
    <rect x="-20" y="600" width="500" height="18" fill="#c98b5a"/>${[0, 120, 240, 360, 470].map((x) => `<rect x="${x - 10}" y="600" width="14" height="200" fill="#c98b5a"/>`).join('')}
    <path d="M-20,618 C60,640 120,600 200,640 C280,600 360,640 480,618" stroke="#4caf72" stroke-width="9" fill="none"/>
    ${[40, 120, 200, 280, 360, 440].map((x, i) => `<circle cx="${x}" cy="${630 + (i % 2) * 8}" r="8" fill="#7a3a8a"/>`).join('')}
  </g>
  <!-- porch table -->
  ${shadowEllipse(1640, 804, 140, 10, 0.15)}
  <rect x="1520" y="660" width="240" height="16" rx="6" fill="#a8703f"/><rect x="1540" y="676" width="12" height="122" fill="#8a5a33"/><rect x="1730" y="676" width="12" height="122" fill="#8a5a33"/>
  <path d="M1514,656 L1766,656 L1772,690 L1508,690 Z" fill="#fffaf2"/>${[1520, 1570, 1620, 1670, 1720].map((x) => `<rect x="${x}" y="656" width="22" height="34" fill="#3f8fc9" opacity=".25"/>`).join('')}
  <g transform="translate(1600,654)"><path d="M-20,0 L-24,-46 Q0,-60 24,-46 L20,0 Z" fill="#e2b04a"/><rect x="-8" y="-66" width="16" height="16" rx="5" fill="#c98b3a"/><path d="M24,-30 q16,4 10,20" stroke="#c98b3a" stroke-width="5" fill="none"/></g>
  <g transform="translate(1690,654)"><ellipse rx="34" ry="8" fill="#fff"/>${[[-12, -10], [10, -12], [0, -24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#ff9a2e"/>`).join('')}</g>
  <!-- big mandarin trees (harvest) -->
  ${mandarinTree(300, 880, 1.05)}${mandarinTree(700, 860, 1.15)}${mandarinTree(1080, 890, 0.95)}
  <!-- crates -->
  ${[[520, 900], [580, 900], [550, 860]].map(([x, y]) => `<g transform="translate(${x},${y})"><rect x="-34" y="-40" width="68" height="40" rx="4" fill="#c98b5a"/><path d="M-34,-20 L34,-20" stroke="#a8703f" stroke-width="4"/>${[-18, 0, 18].map((d) => `<circle cx="${d}" cy="-44" r="10" fill="#ff9a2e"/>`).join('')}</g>`).join('')}
  <!-- swing -->
  <path d="M1250,620 L1250,600" stroke="none"/>
  <g transform="translate(1300,0)">
    <rect x="-90" y="440" width="14" height="380" fill="#8a5a33"/><rect x="76" y="440" width="14" height="380" fill="#8a5a33"/><rect x="-100" y="430" width="200" height="18" rx="6" fill="#a8703f"/>
    <g class="swing-seat"><path d="M-40,448 L-40,720 M40,448 L40,720" stroke="#6b4a2a" stroke-width="3"/><rect x="-52" y="716" width="104" height="14" rx="6" fill="#ff8fab"/></g>
  </g>
  ${chicken(880, 960, 0.9)}${chicken(960, 940, 0.8, true)}${chicken(1440, 970, 0.85)}
  ${dark ? '<rect width="2000" height="1000" fill="#0d1433" opacity=".08"/>' : ''}`;
}

const GRANDMA = { top: 'cardigan', bottom: 'skirt_satin', shoes: 'flats_pink', acc: ['glasses'], hairStyle: 'bun', hairColor: 'platinum', lips: 'nude' };

export const SCENE = {
  id: 'garden',
  city: 'abkhazia',
  name: 'Мандариновый сад',
  subtitle: 'У бабушки в Гуме',
  width: W,
  floor: 935,
  spawn: 900,
  indoor: false,
  music: 'abkhazia',
  hotspots: [
    { id: 'trees', x: 700, y: 520, stand: 700, label: 'Мандарины', icon: '🍊', actions: ['harvest', 'selfie'] },
    { id: 'chickens', x: 920, y: 800, stand: 980, label: 'Курочки', icon: '🐔', actions: ['feedChickens'] },
    { id: 'swing', x: 1300, y: 580, stand: 1300, label: 'Качели', icon: '🌳', actions: ['swing', 'walkPet'] },
    { id: 'porch', x: 1640, y: 560, stand: 1590, label: 'Чай на веранде', icon: '🫖', actions: ['grandmaTea', 'nap'] },
    { id: 'grandma', x: 1860, y: 420, stand: 1760, label: 'Бабуля', icon: '👵', npc: true, actions: ['grandmaTalk'] },
  ],
  npcs: [{ id: 'grandma', x: 1860, outfit: GRANDMA, hotspot: 'grandma', h: 0.9, flip: true }],
};
