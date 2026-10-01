// Medical college — dental technician lab. World 2000 × 1000.
import { skyDefs, isDark, moon, cloud, moscowSkyline, pottedPlant, shadowEllipse } from './common.js';

export const W = 2000;

const tooth = (x, y, s = 1, fill = '#fffef8') =>
  `<path transform="translate(${x},${y}) scale(${s})" d="M-14,-18 C-22,-18 -24,-8 -22,2 C-20,12 -18,26 -12,26 C-7,26 -7,14 0,14 C7,14 7,26 12,26 C18,26 20,12 22,2 C24,-8 22,-18 14,-18 C9,-18 5,-15 0,-15 C-5,-15 -9,-18 -14,-18 Z" fill="${fill}" stroke="#d8cfbd" stroke-width="2"/>`;

function windowView(x, y, w, h, phase, id) {
  const dark = isDark(phase);
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/></clipPath>
    <rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="10" fill="#fff"/>
    <g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#cSky)"/>
      ${dark ? moon(x + w - 50, y + 50, 16) : cloud(x + 80, y + 70, 0.5)}
      ${moscowSkyline(x - 40, y + h, 0.55, dark ? '#2a3366' : '#a7bbdc', dark ? '#ffd97a' : null)}</g>
    <rect x="${x + w / 2 - 4}" y="${y}" width="8" height="${h}" fill="#fff"/><rect x="${x}" y="${y + h * 0.42}" width="${w}" height="8" fill="#fff"/>
    <rect x="${x - 22}" y="${y + h + 8}" width="${w + 44}" height="18" rx="6" fill="#f2fbf8"/>`;
}

export function paint({ phase }) {
  return `
  <defs>${skyDefs('cSky', phase)}
    <linearGradient id="cWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f7f2"/><stop offset="1" stop-color="#d7f0e9"/></linearGradient>
    <linearGradient id="cFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe1ea"/><stop offset="1" stop-color="#b9d0dc"/></linearGradient>
    <pattern id="cTiles" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#f7fdfb"/><path d="M0,0 L60,0 M0,0 L0,60" stroke="#dcefe8" stroke-width="2"/></pattern>
  </defs>
  <rect width="${W}" height="790" fill="url(#cWall)"/>
  <rect y="520" width="${W}" height="270" fill="url(#cTiles)"/>
  <rect y="512" width="${W}" height="10" fill="#bfe6da"/>
  <rect y="780" width="${W}" height="220" fill="url(#cFloor)"/>
  ${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 200 - 200},780 L${i * 200 - 200 + (i * 200 - 1000) * 0.4},1000" stroke="#a9c2cf" stroke-width="2" opacity=".6"/>`).join('')}
  <path d="M0,840 L${W},840 M0,915 L${W},915" stroke="#a9c2cf" stroke-width="2" opacity=".5"/>
  <rect y="770" width="${W}" height="16" fill="#9fd6c6"/>
  <rect width="${W}" height="24" fill="#f4fbf9"/>
  ${[300, 1000, 1700].map((x) => `<rect x="${x - 120}" y="24" width="240" height="18" rx="9" fill="#fff"/><rect x="${x - 110}" y="40" width="220" height="10" rx="5" fill="#fffbe6" opacity=".9"/>`).join('')}

  <!-- whiteboard & lecture area -->
  <rect x="60" y="150" width="440" height="280" rx="12" fill="#fff" stroke="#c9ddd6" stroke-width="8"/>
  ${tooth(170, 270, 3.2)}
  <path d="M170,214 L170,322" stroke="#ff8fab" stroke-width="3" stroke-dasharray="6 6"/>
  <path d="M215,240 L300,210 M220,300 L300,320 M190,330 L300,370" stroke="#4a6b8a" stroke-width="2"/>
  <text x="306" y="215" font-family="Nunito" font-weight="900" font-size="20" fill="#4a6b8a">Эмаль</text>
  <text x="306" y="326" font-family="Nunito" font-weight="900" font-size="20" fill="#4a6b8a">Дентин</text>
  <text x="306" y="376" font-family="Nunito" font-weight="900" font-size="20" fill="#4a6b8a">Корень</text>
  <text x="280" y="190" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="24" fill="#ff6f9c">Строение зуба 🦷</text>
  <rect x="60" y="430" width="440" height="14" rx="5" fill="#c9ddd6"/>
  ${['#ff6f9c', '#4fb3ff', '#3fcfae'].map((c, i) => `<rect x="${120 + i * 30}" y="420" width="22" height="8" rx="3" fill="${c}"/>`).join('')}
  <!-- teacher desk -->
  ${shadowEllipse(330, 800, 170, 10, 0.12)}
  <rect x="170" y="620" width="320" height="22" rx="6" fill="#c7a17a"/>
  <rect x="186" y="642" width="288" height="150" rx="8" fill="#d8b893"/><rect x="200" y="660" width="120" height="60" rx="6" fill="#e6cdaf"/>
  <rect x="380" y="590" width="60" height="30" rx="4" fill="#ff8fab"/><rect x="386" y="580" width="60" height="12" rx="3" fill="#8fc8ff"/>
  <g transform="translate(250,620)"><circle r="16" cy="-16" fill="#ffd36b"/><path d="M-4,-30 q6,-10 12,-8" stroke="#4caf50" stroke-width="3" fill="none"/></g>

  <!-- lab bench -->
  ${shadowEllipse(760, 800, 230, 10, 0.12)}
  ${[640, 860].map((x) => `<path d="M${x},270 L${x},380" stroke="#c4d3d0" stroke-width="5"/><path d="M${x - 50},380 L${x + 50},380 L${x + 34},410 L${x - 34},410 Z" fill="#ffffff" stroke="#d8e6e2" stroke-width="3"/><ellipse cx="${x}" cy="412" rx="34" ry="8" fill="#fffbe0"/>`).join('')}
  <rect x="540" y="610" width="440" height="26" rx="8" fill="#f4f8fb"/>
  <rect x="552" y="634" width="416" height="160" rx="10" fill="#e1ecf3"/>
  ${[0, 1, 2].map((i) => `<rect x="${570 + i * 134}" y="652" width="118" height="56" rx="8" fill="#eef5fa"/><rect x="${612 + i * 134}" y="676" width="34" height="8" rx="4" fill="#b9cbd9"/>`).join('')}
  <!-- articulator with model -->
  <g transform="translate(640,610)"><rect x="-40" y="-14" width="80" height="14" rx="4" fill="#9fb4c8"/><path d="M-30,-14 L-30,-70 L30,-70" stroke="#9fb4c8" stroke-width="6" fill="none"/>
    <path d="M-30,-14 C-30,-40 30,-40 30,-14 Z" fill="#f59cb0"/><path d="M-30,-56 C-30,-30 30,-30 30,-56 Z" fill="#f59cb0"/>
    ${[-20, -10, 0, 10, 20].map((x) => `<rect x="${x - 4}" y="-34" width="8" height="9" rx="3" fill="#fff"/><rect x="${x - 4}" y="-46" width="8" height="9" rx="3" fill="#fff"/>`).join('')}</g>
  <!-- micromotor & crown -->
  <g transform="translate(780,610)"><rect x="-30" y="-24" width="60" height="24" rx="6" fill="#ffffff" stroke="#d8e6e2" stroke-width="2"/><circle cx="-12" cy="-12" r="5" fill="#3fcfae"/><circle cx="6" cy="-12" r="4" fill="#ff8fab"/>
    <path d="M30,-14 C60,-20 70,-40 80,-60" stroke="#9fb4c8" stroke-width="4" fill="none"/><rect x="74" y="-80" width="10" height="34" rx="5" fill="#d0dbe6" transform="rotate(20 79 -63)"/></g>
  ${tooth(900, 586, 0.9)}<ellipse cx="900" cy="610" rx="22" ry="5" fill="#d8cfbd" opacity=".5"/>
  <!-- stools -->
  ${[650, 870].map((x) => `<rect x="${x - 40}" y="700" width="80" height="16" rx="8" fill="#7fd3c4"/><rect x="${x - 4}" y="716" width="8" height="60" fill="#b9c8cf"/><path d="M${x - 34},792 L${x},770 L${x + 34},792" stroke="#b9c8cf" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}

  <!-- window -->
  ${windowView(1010, 170, 300, 300, phase, 'cWin')}
  ${pottedPlant(1060, 790, 1.2, '#ff9cbc')}

  <!-- shelf with models -->
  <rect x="1370" y="180" width="300" height="340" rx="10" fill="#fff" stroke="#d6ebe4" stroke-width="5"/>
  ${[280, 380, 480].map((y) => `<rect x="1370" y="${y}" width="300" height="10" fill="#d6ebe4"/>`).join('')}
  ${[1410, 1480, 1550, 1620].map((x, i) => `<g transform="translate(${x},270)"><path d="M-22,0 C-22,-20 22,-20 22,0 Z" fill="#f59cb0"/>${[-12, -4, 4, 12].map((dx) => `<rect x="${dx - 3.5}" y="-12" width="7" height="8" rx="3" fill="#fff"/>`).join('')}</g>`).join('')}
  ${[1400, 1450, 1500, 1550, 1600, 1640].map((x, i) => `<rect x="${x}" y="${330 + (i % 2) * 10}" width="30" height="${48 - (i % 2) * 10}" rx="4" fill="${['#ff8fab', '#8fc8ff', '#ffd36b', '#b6e39a', '#c9a9ff', '#ffb38a'][i]}"/>`).join('')}
  ${[1410, 1470, 1530, 1590, 1640].map((x, i) => `<g transform="translate(${x},${475})"><rect x="-4" y="-50" width="8" height="50" rx="3" fill="#c4d3dc"/><circle cy="-52" r="${4 + (i % 2) * 2}" fill="#9fb4c8"/></g>`).join('')}
  <rect x="1380" y="560" width="280" height="200" rx="14" fill="#f2fbf8" stroke="#d6ebe4" stroke-width="4"/>
  <text x="1520" y="610" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#3fa58e">Улыбка начинается</text>
  <text x="1520" y="640" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#3fa58e">с техника ✨</text>
  ${tooth(1470, 700, 1.3)}${tooth(1570, 700, 1.3, '#fff6fa')}

  <!-- vending machine -->
  ${shadowEllipse(1780, 798, 90, 8, 0.15)}
  <rect x="1700" y="380" width="160" height="414" rx="18" fill="#ff8fab"/>
  <rect x="1716" y="400" width="100" height="250" rx="8" fill="#ffe8f0"/>
  ${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${1724 + c * 32}" y="${412 + r * 58}" width="24" height="40" rx="6" fill="${['#8b5a3c', '#ffd36b', '#ffffff', '#7fd3c4'][(r + c) % 4]}"/>`).join('')).join('')}
  <rect x="1826" y="420" width="24" height="70" rx="6" fill="#fff"/><circle cx="1838" cy="512" r="8" fill="#fff"/>
  <rect x="1730" y="680" width="80" height="50" rx="8" fill="#e46a92"/>
  <text x="1780" y="775" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#fff">КОФЕ ☕</text>

  <!-- door -->
  <rect x="1890" y="300" width="110" height="490" rx="6" fill="#bfe6da"/><rect x="1902" y="316" width="98" height="470" rx="4" fill="#d9f2ea"/>
  <rect x="1920" y="350" width="70" height="120" rx="6" fill="#fff" opacity=".7"/><circle cx="1914" cy="560" r="8" fill="#9fc8bc"/>
  ${isDark(phase) ? '<rect width="2000" height="1000" fill="#1b1640" opacity=".1"/>' : ''}`;
}

const TEACHER = { top: 'shirt_white', bottom: 'skirt_satin', shoes: 'pumps_white', acc: ['glasses', 'pearl_drops'], hairStyle: 'bob', hairColor: 'platinum', lips: 'berry' };
const KATYA = { top: 'hoodie_msk', bottom: 'jeans', shoes: 'sneakers', acc: ['hoops'], hairStyle: 'ponytail', hairColor: 'honey', lips: 'peach' };

export const SCENE = {
  id: 'college',
  city: 'moscow',
  name: 'Медколледж',
  subtitle: 'Зуботехническая лаборатория',
  width: W,
  floor: 905,
  spawn: 930,
  music: 'moscow',
  hotspots: [
    { id: 'board', x: 280, y: 110, stand: 230, label: 'Лекция', icon: '🎓', actions: ['lecture'] },
    { id: 'teacher', x: 420, y: 430, stand: 250, label: 'Ирина Петровна', icon: '👩‍🏫', npc: true, actions: ['consult', 'exam'] },
    { id: 'bench', x: 760, y: 470, stand: 760, label: 'Лабораторный стол', icon: '🦷', actions: ['practice', 'memory'] },
    { id: 'shelf', x: 1520, y: 140, stand: 1520, label: 'Стенд с моделями', icon: '🃏', actions: ['memory', 'selfie'] },
    { id: 'vending', x: 1780, y: 340, stand: 1760, label: 'Кофейный автомат', icon: '☕', actions: ['vending'] },
    { id: 'katya', x: 1250, y: 430, stand: 1080, label: 'Катя', icon: '💬', npc: true, actions: ['friendChat'] },
  ],
  npcs: [
    { id: 'teacher', x: 420, outfit: TEACHER, hotspot: 'teacher', h: 0.98 },
    { id: 'katya', x: 1250, outfit: KATYA, hotspot: 'katya', h: 0.96 },
  ],
};
