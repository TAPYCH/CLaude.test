// Moscow dorm room (общежитие). World 2000 × 1000.
import { skyDefs, isDark, stars, moon, cloud, moscowSkyline, pottedPlant, floorPlanks, shadowEllipse, stringLights } from './common.js';

export const W = 2000;

function teethRow(x, y, n, w = 9, flip = false) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const cx = x + i * w;
    s += `<rect x="${cx}" y="${flip ? y - 10 : y}" width="${w - 1.4}" height="11" rx="3.5" fill="#fffef8" stroke="#e7e0cf" stroke-width=".8"/>`;
  }
  return s;
}

export function paint({ phase, season }) {
  const dark = isDark(phase);
  const snow = season === 'winter';
  const leaf = season === 'autumn';
  return `
  <defs>
    ${skyDefs('dSky', phase)}
    <linearGradient id="dWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e4f0"/><stop offset="1" stop-color="#f3d7e7"/></linearGradient>
    <linearGradient id="dMirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f3ff"/><stop offset=".5" stop-color="#bcdcf2"/><stop offset="1" stop-color="#d9ecfa"/></linearGradient>
    <linearGradient id="dFridge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fdcca"/><stop offset=".6" stop-color="#b3eadc"/><stop offset="1" stop-color="#86d1bf"/></linearGradient>
    <linearGradient id="dBlanket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb6cf"/><stop offset="1" stop-color="#f58fb2"/></linearGradient>
    <radialGradient id="dLamp" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#fff2b8" stop-opacity=".75"/><stop offset="1" stop-color="#fff2b8" stop-opacity="0"/></radialGradient>
    <pattern id="dStripes" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="none"/><rect x="0" width="22" height="48" fill="#fff" opacity=".22"/><circle cx="35" cy="12" r="2.4" fill="#e9b9d2" opacity=".6"/><circle cx="35" cy="36" r="2.4" fill="#e9b9d2" opacity=".6"/></pattern>
    <clipPath id="dWin"><rect x="830" y="180" width="280" height="370" rx="8"/></clipPath>
  </defs>

  <!-- wall -->
  <rect width="${W}" height="790" fill="url(#dWall)"/>
  <rect width="${W}" height="790" fill="url(#dStripes)"/>
  <rect y="0" width="${W}" height="26" fill="#fbeff6"/><rect y="26" width="${W}" height="6" fill="#ecc6da"/>
  ${floorPlanks(W, 780, 1000, '#e2b384', '#cf9b68')}
  <rect y="770" width="${W}" height="22" fill="#fff6fb"/><rect y="790" width="${W}" height="5" fill="#d9a7c0" opacity=".6"/>

  <!-- rug -->
  <ellipse cx="1000" cy="905" rx="420" ry="62" fill="#fff4e8"/>
  <ellipse cx="1000" cy="905" rx="380" ry="50" fill="none" stroke="#ffb7cf" stroke-width="8" stroke-dasharray="2 18" stroke-linecap="round"/>
  <ellipse cx="1000" cy="905" rx="320" ry="38" fill="none" stroke="#ffd59e" stroke-width="5"/>

  <!-- ===== bed ===== -->
  ${stringLights(70, 520, 250, 26)}
  <g>
    ${[[110, 330, -5, '#ffd8a8'], [210, 342, 4, '#c7e7ff'], [310, 334, -3, '#ffc6dc'], [410, 340, 6, '#d6f5c6']].map(([x, y, r, c]) => `
      <g transform="translate(${x},${y}) rotate(${r})"><rect x="-38" y="0" width="76" height="88" rx="3" fill="#fff" stroke="#eadbe2"/><rect x="-31" y="7" width="62" height="58" fill="${c}"/>
      <circle cx="-14" cy="30" r="9" fill="#fff" opacity=".7"/><path d="M-31,65 L-10,40 L6,56 L18,44 L31,58 L31,65 Z" fill="#fff" opacity=".55"/>
      <rect x="-6" y="-8" width="12" height="14" rx="2" fill="#ffd36b" opacity=".85"/></g>`).join('')}
  </g>
  <g>
    <rect x="48" y="520" width="40" height="280" rx="14" fill="#f2c9a0"/><rect x="56" y="540" width="24" height="230" rx="10" fill="#f8dcbc"/>
    <rect x="70" y="690" width="460" height="40" rx="10" fill="#e8b78c"/>
    <rect x="86" y="728" width="18" height="66" rx="4" fill="#d29d6f"/><rect x="500" y="728" width="18" height="66" rx="4" fill="#d29d6f"/>
    <rect x="80" y="642" width="446" height="56" rx="20" fill="#fffaf5"/>
    <ellipse cx="150" cy="634" rx="74" ry="30" fill="#fff" stroke="#f1dfe8" stroke-width="3"/>
    <ellipse cx="200" cy="626" rx="58" ry="26" fill="#ffe0ec" stroke="#f7c4d8" stroke-width="3"/>
    <path d="M230,640 C260,612 520,612 532,640 L540,720 Q380,742 222,722 Z" fill="url(#dBlanket)"/>
    ${[[290, 670], [350, 690], [410, 662], [470, 694], [320, 712], [440, 718], [500, 666]].map(([x, y]) => `<path d="M${x},${y} c-4,-6 -12,-1 0,9 c12,-10 4,-15 0,-9 Z" fill="#fff" opacity=".75"/>`).join('')}
    <path d="M230,640 C260,620 380,618 532,640" fill="none" stroke="#fff" stroke-width="5" opacity=".5"/>
    <!-- plush bunny -->
    <g transform="translate(120,600)">
      <ellipse cx="0" cy="22" rx="26" ry="22" fill="#fff"/><circle cx="0" cy="-6" r="20" fill="#fff"/>
      <ellipse cx="-9" cy="-34" rx="6" ry="18" fill="#fff"/><ellipse cx="9" cy="-34" rx="6" ry="18" fill="#fff"/>
      <ellipse cx="-9" cy="-34" rx="3" ry="12" fill="#ffc9dc"/><ellipse cx="9" cy="-34" rx="3" ry="12" fill="#ffc9dc"/>
      <circle cx="-7" cy="-6" r="2.6" fill="#3b2a35"/><circle cx="7" cy="-6" r="2.6" fill="#3b2a35"/><path d="M-3,1 q3,3 6,0" stroke="#e57c9d" stroke-width="2" fill="none"/>
      <circle cx="-12" cy="2" r="4" fill="#ffc9dc" opacity=".8"/><circle cx="12" cy="2" r="4" fill="#ffc9dc" opacity=".8"/>
    </g>
  </g>

  <!-- ===== wardrobe with mirror ===== -->
  ${shadowEllipse(660, 796, 120, 10, 0.12)}
  <rect x="560" y="250" width="200" height="545" rx="10" fill="#fffaf6" stroke="#ecd9cf" stroke-width="3"/>
  <rect x="552" y="236" width="216" height="24" rx="8" fill="#f6e7de"/>
  <rect x="572" y="272" width="84" height="500" rx="8" fill="url(#dMirror)" stroke="#e9d3c2" stroke-width="3"/>
  <path d="M586,300 L620,282 M586,350 L646,318 M590,420 L640,394" stroke="#fff" stroke-width="7" opacity=".55" stroke-linecap="round"/>
  <rect x="664" y="272" width="84" height="500" rx="8" fill="#fffdfb" stroke="#ecd9cf" stroke-width="3"/>
  <rect x="649" y="480" width="6" height="56" rx="3" fill="#e6b88f"/><rect x="666" y="480" width="6" height="56" rx="3" fill="#e6b88f"/>
  <path d="M700,236 q-20,-40 0,-60 q30,-10 40,20 q-10,-6 -18,0 q10,20 -22,40 Z" fill="#ffd1e0"/>
  <rect x="680" y="196" width="70" height="42" rx="8" fill="#ffe7c4"/><rect x="690" y="186" width="52" height="16" rx="6" fill="#ffd59a"/>

  <!-- ===== window ===== -->
  <rect x="816" y="166" width="308" height="398" rx="14" fill="#fff"/>
  <g clip-path="url(#dWin)">
    <rect x="830" y="180" width="280" height="370" fill="url(#dSky)"/>
    ${dark ? stars(280, 200, 24).replace(/cx="([\d.]+)"/g, (m, v) => `cx="${830 + +v}"`).replace(/cy="([\d.]+)"/g, (m, v) => `cy="${180 + +v}"`) + moon(1060, 240, 20) : cloud(910, 250, 0.6) + cloud(1060, 300, 0.45, 0.8)}
    ${moscowSkyline(800, 560, 0.62, dark ? '#273160' : '#9fb3d8', dark ? '#ffd97a' : null)}
    ${snow ? '<g class="snowflakes">' + Array.from({ length: 22 }, (_, i) => `<circle cx="${840 + ((i * 53) % 270)}" cy="${190 + ((i * 97) % 350)}" r="${2 + (i % 3)}" fill="#fff" opacity=".9"/>`).join('') + '</g>' : ''}
    ${leaf ? [[870, 470, '#ff9a3c'], [960, 520, '#f2c14e'], [1080, 450, '#e76f51'], [1010, 400, '#ffb347']].map(([x, y, c]) => `<path d="M${x},${y} q10,-14 20,0 q-10,14 -20,0 Z" fill="${c}"/>`).join('') : ''}
  </g>
  <rect x="966" y="180" width="8" height="370" fill="#fff"/><rect x="830" y="360" width="280" height="8" fill="#fff"/>
  <path d="M800,150 C830,300 820,460 850,590 L800,600 Z" fill="#ffb5cd"/><path d="M1140,150 C1110,300 1120,460 1090,590 L1140,600 Z" fill="#ffb5cd"/>
  <path d="M812,160 C836,300 828,460 850,590" stroke="#ff9cbf" stroke-width="4" fill="none"/><path d="M1128,160 C1104,300 1112,460 1090,590" stroke="#ff9cbf" stroke-width="4" fill="none"/>
  <rect x="780" y="140" width="380" height="14" rx="7" fill="#d9a784"/>
  <rect x="800" y="556" width="340" height="24" rx="8" fill="#fff4ec"/>
  ${pottedPlant(860, 556, 0.7, '#f7a48b')}
  <g transform="translate(1060,556)"><path d="M-40,-30 Q0,10 40,-30 Z" fill="#f2e3d0"/>
    <circle cx="-16" cy="-34" r="14" fill="#ff9a2e"/><circle cx="10" cy="-36" r="14" fill="#ffa53f"/><circle cx="-2" cy="-50" r="14" fill="#ff9a2e"/>
    <path d="M-2,-64 q6,-8 14,-6 q-6,8 -14,6 Z" fill="#4caf50"/></g>
  <!-- radiator -->
  <rect x="860" y="626" width="220" height="120" rx="12" fill="#fffaf6" stroke="#ead8cd" stroke-width="3"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${874 + i * 29}" y="636" width="20" height="100" rx="10" fill="#f6ebe4"/>`).join('')}

  <!-- ===== desk ===== -->
  <rect x="1180" y="370" width="320" height="16" rx="6" fill="#e8b78c"/>
  ${[['#ff8fab', 26], ['#8fc8ff', 22], ['#ffd36b', 30], ['#b6e39a', 20], ['#c9a9ff', 24]].map(([c, w], i, arr) => {
    const x = 1200 + arr.slice(0, i).reduce((a, [, ww]) => a + ww + 3, 0);
    return `<rect x="${x}" y="${300 - (i % 2) * 10}" width="${w}" height="${70 + (i % 2) * 10}" rx="3" fill="${c}"/>`;
  }).join('')}
  <g transform="translate(1440,370)"><rect x="-18" y="-30" width="36" height="30" rx="6" fill="#f7a48b"/><path d="M-6,-30 C-10,-60 0,-70 2,-74 C8,-62 8,-46 4,-30 Z" fill="#5cb87a"/><circle cx="2" cy="-74" r="4" fill="#ff8fab"/></g>
  <g transform="translate(1350,230)"><circle r="40" fill="#fff" stroke="#f1c7da" stroke-width="6"/><circle r="3" fill="#6b4a5a"/><path d="M0,0 L0,-26 M0,0 L18,6" stroke="#6b4a5a" stroke-width="4" stroke-linecap="round"/></g>
  ${shadowEllipse(1340, 796, 190, 10, 0.12)}
  <rect x="1176" y="634" width="330" height="22" rx="8" fill="#eebf94"/>
  <rect x="1190" y="654" width="16" height="140" rx="4" fill="#dca97c"/>
  <rect x="1400" y="654" width="96" height="140" rx="8" fill="#f2c9a0"/>
  <rect x="1412" y="670" width="72" height="50" rx="6" fill="#f8dcbc"/><rect x="1412" y="730" width="72" height="50" rx="6" fill="#f8dcbc"/>
  <rect x="1440" y="690" width="16" height="6" rx="3" fill="#c98f62"/><rect x="1440" y="750" width="16" height="6" rx="3" fill="#c98f62"/>
  <!-- laptop -->
  <path d="M1250,634 L1360,634 L1372,628 L1238,628 Z" fill="#d6d6e2"/>
  <rect x="1250" y="540" width="110" height="88" rx="8" fill="#e9e9f2"/>
  <rect x="1257" y="547" width="96" height="74" rx="4" fill="${dark ? '#bfe6ff' : '#dff3ff'}"/>
  <path d="M1294,562 c-10,0 -14,8 -12,18 c2,10 4,24 9,24 c4,0 4,-10 7,-10 c3,0 3,10 7,10 c5,0 7,-14 9,-24 c2,-10 -2,-18 -12,-18 c-3,0 -5,2 -8,2 Z" fill="#fff" stroke="#9cc9e8" stroke-width="2"/>
  <!-- dental typodont -->
  <g transform="translate(1400,616)">
    <path d="M-34,0 C-34,-20 34,-20 34,0 Z" fill="#f59cb0"/>
    ${teethRow(-28, -16, 7, 8.4)}
    <path d="M-34,0 C-34,14 34,14 34,0 Z" fill="#f59cb0"/>
    ${teethRow(-27, 4, 7, 8.2)}
    <rect x="-36" y="12" width="72" height="8" rx="3" fill="#cfd6e6"/>
  </g>
  <!-- lamp -->
  <g transform="translate(1470,634)"><ellipse cx="0" cy="-4" rx="20" ry="6" fill="#ffb3c8"/><path d="M0,-6 L-12,-80 L10,-100" stroke="#ffb3c8" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M-6,-112 L34,-96 L22,-74 L-18,-90 Z" fill="#ff9cbc"/></g>
  ${dark ? '<ellipse cx="1470" cy="600" rx="200" ry="120" fill="url(#dLamp)"/>' : ''}
  <!-- chair -->
  <rect x="1270" y="560" width="110" height="130" rx="22" fill="#ffc6da"/><rect x="1282" y="572" width="86" height="104" rx="16" fill="#ffd8e6"/>
  <rect x="1262" y="688" width="128" height="22" rx="10" fill="#ffb3cb"/>
  <rect x="1320" y="708" width="12" height="60" fill="#c7c7d6"/><path d="M1280,792 L1326,766 L1372,792" stroke="#c7c7d6" stroke-width="8" fill="none" stroke-linecap="round"/>

  <!-- ===== fridge ===== -->
  ${shadowEllipse(1610, 796, 80, 8, 0.12)}
  <rect x="1540" y="460" width="142" height="334" rx="30" fill="url(#dFridge)"/>
  <rect x="1540" y="590" width="142" height="6" fill="#6fbfab"/>
  <rect x="1556" y="500" width="8" height="70" rx="4" fill="#e7fffa"/><rect x="1556" y="616" width="8" height="90" rx="4" fill="#e7fffa"/>
  <circle cx="1620" cy="520" r="12" fill="#ff9a2e"/><path d="M1620,508 q4,-6 10,-4 q-4,6 -10,4 Z" fill="#4caf50"/>
  <path d="M1650,540 c-5,-7 -14,-1 0,10 c14,-11 5,-17 0,-10 Z" fill="#ff6f9c"/>
  <g transform="translate(1612,650) rotate(-6)"><rect x="-22" y="-26" width="44" height="52" fill="#fff"/><rect x="-18" y="-22" width="36" height="34" fill="#9fd8ff"/><path d="M-18,12 L-4,-4 L6,6 L18,-6 L18,12 Z" fill="#5fb3e6"/></g>
  <rect x="1556" y="788" width="16" height="10" fill="#6fbfab"/><rect x="1650" y="788" width="16" height="10" fill="#6fbfab"/>

  <!-- ===== kitchenette ===== -->
  <rect x="1700" y="440" width="140" height="12" rx="4" fill="#e8b78c"/>
  ${['#ff8fab', '#ffd36b', '#9be3c9', '#c9a9ff'].map((c, i) => `<rect x="${1712 + i * 32}" y="404" width="22" height="36" rx="6" fill="${c}"/><rect x="${1714 + i * 32}" y="398" width="18" height="8" rx="3" fill="#fff"/>`).join('')}
  <rect x="1696" y="640" width="150" height="154" rx="10" fill="#fff4ec" stroke="#ecd9cf" stroke-width="3"/>
  <rect x="1690" y="626" width="162" height="20" rx="8" fill="#eebf94"/>
  <rect x="1712" y="660" width="56" height="120" rx="6" fill="#ffe9dc"/><rect x="1776" y="660" width="56" height="120" rx="6" fill="#ffe9dc"/>
  <rect x="1716" y="604" width="70" height="22" rx="6" fill="#4a4250"/><circle cx="1738" cy="615" r="7" fill="#2c2632"/><circle cx="1766" cy="615" r="7" fill="#2c2632"/>
  <g transform="translate(1810,626)"><path d="M-22,0 L-18,-40 Q0,-52 18,-40 L22,0 Z" fill="#ff9cbc"/><path d="M18,-34 q16,0 14,18" stroke="#ff9cbc" stroke-width="6" fill="none"/><rect x="-6" y="-58" width="12" height="10" rx="4" fill="#ff7aa2"/></g>

  <!-- ===== shower door ===== -->
  <rect x="1868" y="300" width="132" height="494" rx="6" fill="#f2c9a0"/>
  <rect x="1882" y="316" width="118" height="470" rx="4" fill="#f8dcbc"/>
  <circle cx="1898" cy="560" r="8" fill="#d9a97a"/>
  <rect x="1900" y="360" width="80" height="44" rx="10" fill="#7fd3ff"/>
  <text x="1940" y="389" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="20" fill="#fff">ДУШ</text>
  <path d="M1920,440 q0,-20 20,-20 q20,0 20,20" fill="none" stroke="#e5b98f" stroke-width="3"/>
  ${[1925, 1940, 1955].map((x) => `<path d="M${x},450 l-3,14" stroke="#9fdcff" stroke-width="3" stroke-linecap="round"/>`).join('')}

  ${dark ? '<rect width="2000" height="1000" fill="#1b1640" opacity=".12"/>' : ''}
  `;
}

export const SCENE = {
  id: 'dorm',
  city: 'moscow',
  name: 'Общежитие',
  subtitle: 'Москва · комната 412',
  width: W,
  floor: 905,
  spawn: 1000,
  music: 'moscow',
  hotspots: [
    { id: 'bed', x: 300, y: 560, stand: 420, label: 'Кровать', icon: '🛏️', actions: ['sleep', 'callLover', 'nap', 'phoneScroll'] },
    { id: 'wardrobe', x: 660, y: 330, stand: 660, label: 'Шкаф и зеркало', icon: '👗', actions: ['wardrobe', 'selfie', 'makeup'] },
    { id: 'window', x: 970, y: 300, stand: 970, label: 'Окно', icon: '🪟', actions: ['window', 'callMom', 'puzzle'] },
    { id: 'desk', x: 1240, y: 470, stand: 1320, label: 'Стол', icon: '📚', actions: ['study', 'typodont', 'memory', 'orders', 'onlineShop'] },
    { id: 'fridge', x: 1610, y: 420, stand: 1610, label: 'Холодильник', icon: '🧊', actions: ['snack', 'eatMeal'] },
    { id: 'stove', x: 1770, y: 540, stand: 1770, label: 'Плитка', icon: '🍳', actions: ['cook', 'tea'] },
    { id: 'shower', x: 1934, y: 470, stand: 1900, label: 'Душ', icon: '🚿', actions: ['shower', 'brushTeeth'] },
  ],
  petSpot: 520,
};
