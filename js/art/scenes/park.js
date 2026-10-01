// Moscow park. World 2200 × 1000. Outdoor: seasons change trees and ground.
import { skyDefs, isDark, stars, moon, cloud, sun, moscowSkyline, shadowEllipse } from './common.js';

export const W = 2200;

const FOLIAGE = {
  autumn: ['#ff9a3c', '#f2c14e', '#e76f51'],
  winter: ['#f4f8ff', '#e6eefa', '#dbe6f5'],
  spring: ['#ffc3dc', '#ffb0cf', '#9fdc8a'],
  summer: ['#5cbf6a', '#4ca85c', '#6fd07a'],
};

function tree(x, y, s, se, k = 0) {
  const c = FOLIAGE[se] || FOLIAGE.summer;
  return `<g transform="translate(${x},${y}) scale(${s})">
    ${shadowEllipse(0, 0, 90, 14, 0.15)}
    <path d="M-12,0 C-10,-60 -14,-120 -6,-170 L8,-170 C14,-120 10,-60 12,0 Z" fill="#8a5a3c"/>
    <path d="M-2,-120 C-30,-140 -50,-150 -60,-170 M2,-130 C30,-150 46,-160 56,-180" stroke="#8a5a3c" stroke-width="9" stroke-linecap="round" fill="none"/>
    <circle cx="-60" cy="-200" r="62" fill="${c[(k + 1) % 3]}"/><circle cx="60" cy="-210" r="66" fill="${c[(k + 2) % 3]}"/>
    <circle cx="0" cy="-250" r="80" fill="${c[k % 3]}"/><circle cx="-30" cy="-270" r="36" fill="#fff" opacity=".18"/>
    ${se === 'winter' ? '<path d="M-70,-250 q30,-20 60,-10 q30,-30 70,0" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>' : ''}
  </g>`;
}

function lamp(x, dark) {
  return `<g transform="translate(${x},800)"><rect x="-5" y="-320" width="10" height="320" fill="#3b4a5a"/><rect x="-14" y="-12" width="28" height="12" rx="3" fill="#3b4a5a"/>
    <path d="M-20,-320 L20,-320 L14,-350 L-14,-350 Z" fill="#3b4a5a"/><rect x="-12" y="-346" width="24" height="24" rx="4" fill="${dark ? '#ffe9a0' : '#e8f0f8'}"/>
    ${dark ? '<circle cx="0" cy="-334" r="70" fill="#ffe9a0" opacity=".25"/><circle cx="0" cy="-334" r="34" fill="#ffe9a0" opacity=".35"/>' : ''}</g>`;
}

export function paint({ phase, season }) {
  const dark = isDark(phase);
  const se = season || 'autumn';
  const grass = se === 'winter' ? '#f2f6fc' : se === 'autumn' ? '#b9d08a' : '#9fd88a';
  const grass2 = se === 'winter' ? '#e2eaf5' : se === 'autumn' ? '#a8c27a' : '#8cc87a';
  return `
  <defs>${skyDefs('pSky', phase)}
    <linearGradient id="pPond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${se === 'winter' ? '#d9ecff' : '#7fd0f2'}"/><stop offset="1" stop-color="${se === 'winter' ? '#bcd8f2' : '#4fb3e6'}"/></linearGradient></defs>
  <rect width="${W}" height="1000" fill="url(#pSky)"/>
  ${dark ? stars(W, 400, 70) + moon(1800, 140, 34) : sun(1800, 150, 46) + cloud(300, 160, 1.1) + cloud(900, 110, 0.8) + cloud(1500, 200, 1)}
  ${moscowSkyline(80, 600, 1, dark ? '#2c3566' : '#b9c6e3', dark ? '#ffd97a' : null)}
  ${moscowSkyline(1100, 600, 0.8, dark ? '#283060' : '#c4cfe8', dark ? '#ffd97a' : null)}
  <path d="M0,600 C300,560 600,600 900,580 C1200,560 1500,600 1800,575 C2000,560 2100,580 ${W},570 L${W},1000 L0,1000 Z" fill="${grass2}"/>
  <path d="M0,700 C400,660 800,700 1200,680 C1600,660 1900,690 ${W},680 L${W},1000 L0,1000 Z" fill="${grass}"/>
  ${tree(200, 720, 1.1, se, 0)}${tree(620, 690, 0.8, se, 1)}${tree(1700, 700, 1.0, se, 2)}${tree(2080, 730, 1.2, se, 1)}
  <!-- pond -->
  <ellipse cx="560" cy="860" rx="330" ry="70" fill="${grass2}"/>
  <ellipse cx="560" cy="856" rx="310" ry="60" fill="url(#pPond)"/>
  ${se !== 'winter' ? `<path d="M380,850 q30,-6 60,0 M620,870 q40,-6 80,0" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>
  ${[[470, 846, 1], [560, 864, -1], [660, 842, 1]].map(([x, y, d]) => `<g transform="translate(${x},${y}) scale(${d},1)"><ellipse rx="22" ry="12" fill="#fff"/><circle cx="16" cy="-12" r="9" fill="#fff"/><path d="M24,-12 l10,3 l-10,3 Z" fill="#ffb02e"/><circle cx="18" cy="-14" r="2" fill="#333"/><path d="M-20,-4 q-8,-6 -2,-10" fill="#fff"/></g>`).join('')}` : `<path d="M360,840 L760,840" stroke="#fff" stroke-width="4" opacity=".7"/><text x="560" y="880" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="22" fill="#9fc0e0">⛸️ каток</text>`}
  <!-- path -->
  <path d="M900,1000 C960,880 1100,800 1300,770 C1500,740 1800,760 ${W},740 L${W},800 C1800,820 1500,800 1340,830 C1160,860 1060,920 1040,1000 Z" fill="${se === 'winter' ? '#e8edf5' : '#efdcc0'}"/>
  ${lamp(980, dark)}${lamp(1560, dark)}
  <!-- bench -->
  ${shadowEllipse(1260, 800, 150, 10, 0.18)}
  <g transform="translate(1260,800)">
    <rect x="-140" y="-120" width="280" height="22" rx="8" fill="#c98b5a"/><rect x="-140" y="-92" width="280" height="22" rx="8" fill="#b77a4c"/>
    <rect x="-150" y="-62" width="300" height="22" rx="8" fill="#c98b5a"/>
    <rect x="-130" y="-120" width="12" height="120" fill="#3b4a5a"/><rect x="118" y="-120" width="12" height="120" fill="#3b4a5a"/>
    ${se === 'winter' ? '<path d="M-150,-62 q150,-14 300,0" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none"/>' : ''}
  </g>
  <!-- ice cream cart -->
  ${shadowEllipse(1880, 802, 130, 10, 0.18)}
  <g transform="translate(1880,800)">
    <rect x="-110" y="-160" width="220" height="130" rx="18" fill="#fff"/><rect x="-110" y="-160" width="220" height="30" rx="14" fill="#7fd3ff"/>
    ${[-70, -20, 30, 80].map((x, i) => `<rect x="${x - 18}" y="-120" width="36" height="60" rx="6" fill="${['#ffb3cb', '#fff1b3', '#c9f2d9', '#e2d1ff'][i]}"/>`).join('')}
    <path d="M-120,-260 Q0,-330 120,-260 Z" fill="#ff8fab"/>${[-90, -30, 30, 90].map((x) => `<path d="M${x - 30},-262 Q${x},-240 ${x + 30},-262" fill="#fff"/>`).join('')}
    <rect x="-4" y="-260" width="8" height="100" fill="#c7c7d6"/>
    <circle cx="-70" cy="-12" r="24" fill="#3b4a5a"/><circle cx="-70" cy="-12" r="10" fill="#c7c7d6"/><circle cx="70" cy="-12" r="24" fill="#3b4a5a"/><circle cx="70" cy="-12" r="10" fill="#c7c7d6"/>
    <g transform="translate(0,-186)"><path d="M-12,0 L0,30 L12,0 Z" fill="#e8b46a"/><circle cy="-6" r="13" fill="#ffb3cb"/><circle cx="-6" cy="-14" r="9" fill="#fff1b3"/></g>
    <text y="-136" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="18" fill="#fff">ПЛОМБИР</text>
  </g>
  ${se === 'winter' ? Array.from({ length: 20 }, (_, i) => `<circle cx="${(i * 137) % W}" cy="${720 + ((i * 53) % 260)}" r="${6 + (i % 4) * 3}" fill="#fff" opacity=".7"/>`).join('') : ''}
  ${se === 'autumn' ? Array.from({ length: 26 }, (_, i) => `<path d="M${(i * 97) % W},${760 + ((i * 41) % 220)} q8,-10 16,0 q-8,10 -16,0 Z" fill="${['#ff9a3c', '#f2c14e', '#e76f51'][i % 3]}"/>`).join('') : ''}`;
}

export const SCENE = {
  id: 'park',
  city: 'moscow',
  name: 'Парк',
  subtitle: 'Свежий воздух и утки',
  width: W,
  floor: 915,
  spawn: 1100,
  indoor: false,
  music: 'moscow',
  hotspots: [
    { id: 'pond', x: 560, y: 720, stand: 900, label: 'Пруд', icon: '🦆', actions: ['ducks', 'selfie'] },
    { id: 'bench', x: 1260, y: 560, stand: 1260, label: 'Лавочка', icon: '🪑', actions: ['bench', 'phoneScroll', 'callMom'] },
    { id: 'track', x: 1560, y: 380, stand: 1560, label: 'Беговая дорожка', icon: '🏃‍♀️', actions: ['run', 'walkPet'] },
    { id: 'icecream', x: 1880, y: 470, stand: 1880, label: 'Мороженое', icon: '🍦', actions: ['icecream'] },
  ],
};
