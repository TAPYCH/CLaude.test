// Lana — layered SVG character renderer.
// Coordinate system: viewBox 0 0 200 450, feet at y≈440, head centre at (100, 92).
// Left limbs are drawn once and mirrored for the right side so clothing stays symmetric.
import { SKIN, HAIR_COLORS, LIP_COLORS, EYE } from './palette.js';
import { ITEMS } from '../data/items.js';
import { HAIRSTYLES } from './hair.js';

let counter = 0;

// --- Body geometry -----------------------------------------------------------
export const GEO = {
  torso:
    'M91,146 L91,154 C80,156 72,159 69,166 C66,176 69,190 73,204 C76,216 79,226 80,238 L120,238 C121,226 124,216 127,204 C131,190 134,176 131,166 C128,159 120,156 109,154 L109,146 Z',
  hips: 'M80,234 C76,246 74,256 75,268 L125,268 C126,256 124,246 120,234 Z',
  arm:
    'M75,161 C65,162 60,172 59,186 C58,202 57,218 58,232 C59,244 60,252 61,259 L69.5,259 C69.5,249 69.5,240 70,232 C71,218 73,204 75,192 L78,170 Z',
  leg:
    'M80,256 C78.5,280 80,300 82.5,322 C83.5,333 83.8,341 84,349 C83,364 84.4,382 86.6,400 C86.9,408 87.1,413 87.4,419 L95.2,419 C95.4,413 95.8,408 96.4,400 C98.6,382 99.8,364 99.2,349 C99.6,341 100.2,333 100.8,322 C102.2,300 101.6,280 100.6,256 Z',
  foot: 'M86.6,413 C85.6,421 84.6,429 85.4,435.5 Q91.2,440 96.8,435.5 C97.6,429 96.8,421 95.8,413 Z',
  neck: 'M92.5,126 L92,153 Q100,158 108,153 L107.5,126 Z',
  face:
    'M100,141 C88,141 76.5,133 69.5,119 C63.5,108 61,96 61,84 C61,58 78,40 100,40 C122,40 139,58 139,84 C139,96 136.5,108 130.5,119 C123.5,133 112,141 100,141 Z',
};

const SHOULDER_L = '72px 167px';
const SHOULDER_R = '128px 167px';
const HIP_L = '90px 258px';
const HIP_R = '110px 258px';
const MIRROR = 'matrix(-1 0 0 1 200 0)';

function gradDefs(p, hair, extra = '') {
  return `<defs>
    <linearGradient id="${p}skin" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${SKIN.shade}"/><stop offset=".22" stop-color="${SKIN.base}"/>
      <stop offset=".7" stop-color="${SKIN.light}"/><stop offset="1" stop-color="${SKIN.shade}"/>
    </linearGradient>
    <radialGradient id="${p}face" cx=".45" cy=".42" r=".65">
      <stop offset="0" stop-color="${SKIN.light}"/><stop offset=".7" stop-color="${SKIN.base}"/>
      <stop offset="1" stop-color="${SKIN.shade}"/>
    </radialGradient>
    <radialGradient id="${p}blush" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${SKIN.blush}" stop-opacity=".55"/><stop offset="1" stop-color="${SKIN.blush}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${p}iris" cx=".5" cy=".62" r=".6">
      <stop offset="0" stop-color="${EYE.irisLight}"/><stop offset=".55" stop-color="${EYE.iris}"/>
      <stop offset="1" stop-color="${EYE.irisDark}"/>
    </radialGradient>
    <linearGradient id="${p}hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${hair.base}"/><stop offset=".55" stop-color="${hair.base}"/>
      <stop offset="1" stop-color="${hair.light}"/>
    </linearGradient>
    <linearGradient id="${p}hairSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${hair.dark}"/><stop offset=".35" stop-color="${hair.base}"/>
      <stop offset=".75" stop-color="${hair.light}"/><stop offset="1" stop-color="${hair.base}"/>
    </linearGradient>
    <linearGradient id="${p}shine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="${p}eyeClip"><ellipse cx="0" cy="0" rx="11.2" ry="12.4"/></clipPath>
    ${extra}
  </defs>`;
}

// --- Face ----------------------------------------------------------------------
function eyeShape(p, mode) {
  // Drawn for the LEFT eye in local coords (outer corner = negative x); mirrored for the right.
  if (mode === 'closed' || mode === 'joy') {
    const d =
      mode === 'joy'
        ? 'M-11,3 Q0,-9 11,3' // happy ^ arc
        : 'M-11,-1 Q0,8 11,-1'; // sleeping arc
    return `<path d="${d}" fill="none" stroke="${EYE.liner}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M-11,${mode === 'joy' ? 3 : -1} L-16.5,${mode === 'joy' ? -1.5 : -4.5}" stroke="${EYE.liner}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M-6,${mode === 'joy' ? -3 : 5} l-1.5,${mode === 'joy' ? -3 : 3.2} M-1,${mode === 'joy' ? -4.6 : 6} l-.6,${mode === 'joy' ? -3.2 : 3.2}" stroke="${EYE.liner}" stroke-width="1.3" stroke-linecap="round"/>`;
  }
  const lidDrop = mode === 'tired' ? 6.5 : mode === 'sad' ? 2 : 0;
  return `<g class="eyeball">
      <ellipse cx="0" cy="0" rx="11.2" ry="12.4" fill="#fff"/>
      <g clip-path="url(#${p}eyeClip)">
        <ellipse cx="0" cy="-9" rx="13" ry="5" fill="#e9d6d6" opacity=".7"/>
        <g class="iris">
          <circle cx=".6" cy="1.8" r="8.9" fill="url(#${p}iris)"/>
          <circle cx=".6" cy="1.8" r="8.9" fill="none" stroke="${EYE.irisDark}" stroke-width="1.1" opacity=".75"/>
          <circle cx=".6" cy="1.8" r="4.3" fill="#1b0d07"/>
        </g>
        ${lidDrop ? `<rect x="-14" y="-15" width="28" height="${lidDrop + 4}" fill="${SKIN.base}"/>` : ''}
      </g>
      <g transform="translate(0,${lidDrop})">
        <path d="M12,-1 C10.5,-10.5 4.5,-13.4 -.6,-13.4 C-6.6,-13.4 -10.8,-10.2 -12.4,-4.4 Q-14.4,-5.6 -16.4,-6.4 Q-14.8,-3 -12.2,1.4 C-11.2,-6.6 -6.4,-10.9 -.6,-10.9 C5,-10.9 9.6,-7.4 12,-1 Z" fill="${EYE.liner}"/>
        <path d="M-12.6,-5.6 q-2.6,-.9 -4.4,-.2 M-10,-9.4 q-1.6,-2.4 -3.6,-3" stroke="${EYE.liner}" stroke-width="1.15" fill="none" stroke-linecap="round"/>
      </g>
      <path d="M-11,4.5 Q-5,12.3 1.5,12.2 Q8,11.6 11,5" fill="none" stroke="#8a5446" stroke-width=".9" opacity=".55"/>
    </g>`;
}

function eyeHighlights(mode) {
  if (mode === 'closed' || mode === 'joy') return '';
  const dy = mode === 'tired' ? 4 : 0;
  return `<circle cx="-2.6" cy="${-2.6 + dy}" r="3.1" fill="#fff"/><circle cx="3.6" cy="${5.2}" r="1.5" fill="#fff" opacity=".9"/>`;
}

function brows(expr, hair) {
  const col = hair.dark === '#c4ae8c' || hair.dark === '#c4628a' ? hair.dark : EYE.brow;
  // left brow in local coords around (83, 74)
  let d = 'M-13,4 C-8,-3 2,-4.6 11,-.4 C2,-1.6 -6,0 -12.2,6 Z';
  let rot = 0;
  if (expr === 'sad') rot = -12;
  if (expr === 'excited' || expr === 'happy') rot = 4;
  if (expr === 'angry') rot = 14;
  const lift = expr === 'excited' ? -3 : expr === 'happy' ? -1.5 : 0;
  return `<g transform="translate(83,${75 + lift}) rotate(${rot})"><path d="${d}" fill="${col}"/></g>
    <g transform="translate(117,${75 + lift}) scale(-1,1) rotate(${rot})"><path d="${d}" fill="${col}"/></g>`;
}

function mouth(expr, lips) {
  const L = LIP_COLORS[lips] || LIP_COLORS.nude;
  switch (expr) {
    case 'happy':
    case 'excited':
      return `<path d="M89,122.5 Q100,121 111,122.5 Q109,134.5 100,135 Q91,134.5 89,122.5 Z" fill="#7a2d33"/>
        <path d="M90.5,123.2 Q100,122.4 109.5,123.2 L109,126 Q100,127.2 91,126 Z" fill="#fff"/>
        <path d="M94,131.6 Q100,128.6 106,131.6 Q103,134.5 100,134.6 Q97,134.5 94,131.6 Z" fill="#e47c86"/>
        <path d="M88,122.6 Q94.5,119 100,120.6 Q105.5,119 112,122.6" fill="none" stroke="${L.top}" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M89.5,124 Q91,133.5 100,135.6 Q109,133.5 110.5,124" fill="none" stroke="${L.bottom}" stroke-width="2.2" stroke-linecap="round"/>`;
    case 'sad':
      return `<path d="M93,128 Q100,123.5 107,128 Q100,126.5 93,128 Z" fill="${L.top}" stroke="${L.top}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M94.5,128.4 Q100,131 105.5,128.4" fill="none" stroke="${L.bottom}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'surprised':
      return `<ellipse cx="100" cy="127" rx="5" ry="6" fill="#7a2d33" stroke="${L.top}" stroke-width="2.4"/>`;
    case 'kiss':
      return `<path d="M96.5,124 Q100,121.5 103.5,124 Q106,127 103.5,129.5 Q100,132 96.5,129.5 Q94,127 96.5,124 Z" fill="${L.top}"/>
        <ellipse cx="101.5" cy="128.5" rx="1.6" ry=".9" fill="#fff" opacity=".5"/>`;
    case 'tired':
      return `<path d="M94,126.5 Q100,124.5 106,126.5 Q100,129.5 94,126.5 Z" fill="${L.top}"/>
        <path d="M94.5,127 Q100,130.5 105.5,127" fill="none" stroke="${L.bottom}" stroke-width="2" stroke-linecap="round"/>`;
    default:
      // soft closed smile, full lips
      return `<path d="M90.5,124.2 Q94.8,120.4 98,121.4 Q100,122.4 102,121.4 Q105.2,120.4 109.5,124.2 Q100,126 90.5,124.2 Z" fill="${L.top}"/>
        <path d="M90.5,124.2 Q100,126 109.5,124.2 Q107,131.4 100,131.6 Q93,131.4 90.5,124.2 Z" fill="${L.bottom}"/>
        <path d="M90,124 Q100,126.6 110,124" fill="none" stroke="#9e4b4e" stroke-width=".9" stroke-linecap="round"/>
        <path d="M89,123.4 q-1.4,-.2 -2.2,-1.2 M111,123.4 q1.4,-.2 2.2,-1.2" stroke="#c98a80" stroke-width=".9" stroke-linecap="round" fill="none"/>
        <ellipse cx="102.2" cy="127.8" rx="3.4" ry="1.2" fill="#fff" opacity=".45"/>`;
  }
}

function eyeMode(expr) {
  if (expr === 'sleep') return 'closed';
  if (expr === 'excited') return 'joy';
  if (expr === 'tired') return 'tired';
  if (expr === 'sad') return 'sad';
  return 'open';
}

export function renderFace(p, o) {
  const hair = HAIR_COLORS[o.hairColor] || HAIR_COLORS.chestnut;
  const mode = eyeMode(o.expr);
  const lookX = o.look || 0;
  return `
    <ellipse cx="78" cy="113" rx="10" ry="6" fill="url(#${p}blush)"/>
    <ellipse cx="122" cy="113" rx="10" ry="6" fill="url(#${p}blush)"/>
    <g class="eyes">
      <g class="eye eyeL" transform="translate(83,96)">${eyeShape(p, mode)}<g transform="translate(${lookX},0)">${eyeHighlights(mode)}</g></g>
      <g class="eye eyeR" transform="translate(117,96)"><g transform="scale(-1,1)">${eyeShape(p, mode)}</g><g transform="translate(${lookX},0)">${eyeHighlights(mode)}</g></g>
    </g>
    ${brows(o.expr, hair)}
    <path d="M100.8,104 Q99.2,111 97.2,114.6" fill="none" stroke="${SKIN.shade}" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>
    <path d="M96.6,116.2 Q100,118.4 103.6,116.2" fill="none" stroke="${SKIN.deep}" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="101.6" cy="113" rx="1.5" ry="1" fill="#fff" opacity=".55"/>
    ${o.expr === 'sad' ? `<path d="M74,104 q-1.5,4 0,6 q1.5,-2 0,-6 Z" fill="#9fd8ff" opacity=".85"/>` : ''}
    ${mouth(o.expr, o.lips)}
  `;
}

// --- Layer assembly ----------------------------------------------------------------
function itemParts(outfit) {
  const parts = [];
  const add = (id) => {
    const it = id && ITEMS[id];
    if (it && it.draw) parts.push(it);
  };
  if (outfit.dress) add(outfit.dress);
  else {
    add(outfit.bottom);
    add(outfit.top);
  }
  add(outfit.shoes);
  for (const a of outfit.acc || []) add(a);
  return parts;
}

function collect(parts, layer, ctx) {
  let out = '';
  for (const it of parts) {
    const fn = it.draw[layer];
    if (fn) out += fn(ctx);
  }
  return out;
}

/**
 * Render Lana as an SVG string.
 * @param {object} o  { outfit, expr, hairColor, hairStyle, lips, look, pose }
 */
export function renderLana(o = {}) {
  const p = `l${++counter}_`;
  const outfit = o.outfit || {};
  const hair = HAIR_COLORS[outfit.hairColor || o.hairColor] || HAIR_COLORS.chestnut;
  const style = HAIRSTYLES[outfit.hairStyle] || HAIRSTYLES.long;
  const parts = itemParts(outfit);
  const ctx = { p, hair, skin: SKIN };
  const hasLongBottom = parts.some((it) => it.longBottom);
  const face = {
    expr: o.expr || 'neutral',
    lips: outfit.lips || 'nude',
    hairColor: outfit.hairColor,
    look: o.look,
  };

  const extraDefs = parts.map((it) => (it.defs ? it.defs(ctx) : '')).join('');
  // optional static pose (degrees) for sprites rendered to images: { legL, legR, armL, armR }
  const pose = o.pose || {};
  const rot = (deg, origin) => (deg ? ` transform="rotate(${deg} ${origin.replace(/px/g, '')})"` : ` style="transform-origin:${origin}"`);

  const leg = `<path d="${GEO.leg}" fill="url(#${p}skin)"/>
      <path d="M87,343 q4.5,2.4 9,0" stroke="${SKIN.shade}" stroke-width="1" fill="none" opacity=".8"/>
      <path d="${GEO.foot}" fill="${SKIN.base}"/>
      ${collect(parts, 'leg', ctx)}`;

  const arm = `<path d="${GEO.arm}" fill="url(#${p}skin)"/>
      <path d="M61,257 C59,262 59.5,268 62,272 C64,275 68,275.5 70,272 C71.6,268 71.4,262 69.8,257 Z" fill="${SKIN.base}"/>
      <path d="M62.6,265.4 q-1.6,3 .4,5.6" stroke="${SKIN.shade}" stroke-width=".9" fill="none"/>
      ${collect(parts, 'arm', ctx)}`;

  return `<svg class="lana-svg" viewBox="0 0 200 450" xmlns="http://www.w3.org/2000/svg" aria-label="Лана">
    ${gradDefs(p, hair, extraDefs)}
    <ellipse class="shadow" cx="100" cy="440" rx="${hasLongBottom ? 30 : 26}" ry="6" fill="#000" opacity=".16"/>
    <g class="body-root">
      <g class="hair-back">${style.back(ctx)}</g>
      ${collect(parts, 'back', ctx)}
      <g class="legL"${rot(pose.legL, HIP_L)}>${leg}</g>
      <g class="legR"${rot(pose.legR, HIP_R)}><g transform="${MIRROR}">${leg}</g></g>
      <g class="torso">
        <path d="${GEO.hips}" fill="url(#${p}skin)"/>
        <path d="${GEO.neck}" fill="url(#${p}skin)"/>
        <path d="${GEO.torso}" fill="url(#${p}skin)"/>
        <path d="M93,154 Q100,160 107,154" fill="none" stroke="${SKIN.shade}" stroke-width="1.1" opacity=".8"/>
        <path d="M84,158 q8,4 9,0 M116,158 q-8,4 -9,0" stroke="${SKIN.shade}" stroke-width=".9" fill="none" opacity=".7"/>
        ${collect(parts, 'hip', ctx)}
        ${collect(parts, 'torso', ctx)}
      </g>
      <g class="armL"${rot(pose.armL, SHOULDER_L)}>${arm}</g>
      <g class="armR"${rot(pose.armR, SHOULDER_R)}><g transform="${MIRROR}">${arm}</g></g>
      ${collect(parts, 'front', ctx)}
      <g class="head" style="transform-origin:100px 150px">
        <path d="M92.5,128 Q100,145 107.5,128 Z" fill="${SKIN.shade}" opacity=".9"/>
        <ellipse cx="62.5" cy="95" rx="6" ry="9" fill="${SKIN.base}"/>
        <ellipse cx="137.5" cy="95" rx="6" ry="9" fill="${SKIN.base}"/>
        <path d="${GEO.face}" fill="url(#${p}face)"/>
        ${collect(parts, 'ears', ctx)}
        <g class="face">${renderFace(p, face)}</g>
        ${collect(parts, 'face', ctx)}
        <g class="hair-front">${style.front(ctx)}</g>
        ${collect(parts, 'head', ctx)}
      </g>
    </g>
  </svg>`;
}

/** Head only (used for the sleeping overlay, avatars, icons). */
export function renderLanaHead(o = {}) {
  const p = `h${++counter}_`;
  const outfit = o.outfit || {};
  const hair = HAIR_COLORS[outfit.hairColor] || HAIR_COLORS.chestnut;
  const style = HAIRSTYLES[outfit.hairStyle] || HAIRSTYLES.long;
  const ctx = { p, hair, skin: SKIN };
  const parts = itemParts(outfit).filter((it) => it.draw.ears || it.draw.face || it.draw.head);
  const vb = o.viewBox || '44 22 112 140';
  return `<svg class="lana-head" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
    ${gradDefs(p, hair)}
    <g>
    <g class="hair-back">${style.back(ctx)}</g>
    <path d="${GEO.neck}" fill="url(#${p}skin)"/>
    <path d="M60,170 C64,156 80,152 92,150 Q100,156 108,150 C120,152 136,156 140,170 Z" fill="${o.shirt || '#1f1b24'}"/>
    <ellipse cx="62.5" cy="95" rx="6" ry="9" fill="${SKIN.base}"/>
    <ellipse cx="137.5" cy="95" rx="6" ry="9" fill="${SKIN.base}"/>
    <path d="${GEO.face}" fill="url(#${p}face)"/>
    ${parts.map((it) => (it.draw.ears ? it.draw.ears(ctx) : '')).join('')}
    <g class="face">${renderFace(p, { expr: o.expr || 'happy', lips: outfit.lips, hairColor: outfit.hairColor })}</g>
    ${parts.map((it) => (it.draw.face ? it.draw.face(ctx) : '')).join('')}
    <g class="hair-front">${style.front(ctx)}</g>
    ${parts.map((it) => (it.draw.head ? it.draw.head(ctx) : '')).join('')}
    </g>
  </svg>`;
}
