// Wardrobe catalogue. Each item draws into body layers:
//   back  – behind body          hip   – pelvis/skirt area (inside torso group)
//   torso – over chest            arm   – left arm (auto-mirrored to right)
//   leg   – left leg (mirrored)   front – over arms (bags, scarves, necklaces)
//   ears / face / head            – head group
// Coordinates follow js/art/character.js (viewBox 0 0 200 450).

const TOP_FIT =
  'M88,151 C79,155 71,159 68.5,166.5 C65.5,176 68.5,190 72.5,204 C75.5,216 78,226 79,237 L121,237 C122,226 124.5,216 127.5,204 C131.5,190 134.5,176 131.5,166.5 C129,159 121,155 112,151 Q100,156 88,151 Z';
const TOP_LOOSE =
  'M87,150 C77,154 69,158 66,166 C62,178 66,196 69,212 C71,226 72,240 71,254 Q100,260 129,254 C128,240 129,226 131,212 C134,196 138,178 134,166 C131,158 123,154 113,150 Q100,156 87,150 Z';
const SLEEVE_SHORT = 'M76,159 C64.5,160 58,170 56.5,186 L57.2,195 Q66,198.5 74.5,194 L78.5,170 Z';
const SLEEVE_LONG =
  'M76,159 C64.5,160 58,170 56.5,186 C55.5,202 55.5,218 56.5,232 C57.5,244 58.5,250 59.5,257 Q65,260.5 71,257 C71,247 71,239 71.5,232 C72.5,218 74.5,204 76.5,192 L79,170 Z';
const SLEEVE_PUFF = 'M77,158 C62,156 53,166 54,182 Q56,192 62,190 Q68,194 75,188 L79,168 Z';
const SKIRT_MINI = 'M80,233 L120,233 C125,254 129,275 133,296 Q100,304 67,296 C71,275 75,254 80,233 Z';
const PANTS_HIP = 'M79,233 L121,233 C124,244 126,256 126,270 Q100,274 74,270 C74,256 76,244 79,233 Z';
const PANTS_LEG =
  'M78.5,252 C77.5,280 79.5,305 82.5,330 C83.5,352 84.5,376 85,398 L85.3,415 Q91,417 97.3,415 L97.6,398 C98.6,376 99.6,352 100.6,330 C102,305 102,280 101.5,252 Z';
const FLARE_LEG =
  'M78.5,252 C77.5,280 79.5,305 82.5,330 C82.5,355 80,385 77.5,418 Q90,421 102,418 C101,385 100.5,355 100.6,330 C102,305 102,280 101.5,252 Z';

const shade = (d, col, op = 0.18) => `<path d="${d}" fill="${col}" opacity="${op}"/>`;
const line = (d, col, w = 1, op = 1) =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;

function grad(id, a, b, dir = 'v') {
  const xy = dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
  return `<linearGradient id="${id}" ${xy}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
}

const shoe = (fill, extra = '') => ({
  leg: () =>
    `<path d="M85.2,423 Q91,427.4 97,423 C98.2,427 98.6,431 98,434.6 Q96.4,440.6 91.1,441.2 Q85.8,440.6 84.2,434.6 C83.6,431 84,427 85.2,423 Z" fill="${fill}"/>
     <path d="M85.2,423 Q91,427.4 97,423" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1"/>${extra}`,
});

export const ITEMS = {
  // ------------------------------------------------------------------ TOPS
  top_keyhole: {
    cat: 'top', name: 'Топ с вырезом-капелькой', price: 0, rarity: 'signature',
    desc: 'Тот самый чёрный топ со стойкой и жемчужной пуговкой.',
    draw: {
      torso: (c) => `
        <path d="${TOP_FIT}" fill="#211c25"/>
        ${shade('M68.5,166.5 C65.5,176 68.5,190 72.5,204 C75.5,216 78,226 79,237 L86,237 C82,214 78,190 80,160 Z', '#000', 0.35)}
        ${[84, 90, 96, 104, 110, 116].map((x) => line(`M${x},${165 + Math.abs(100 - x) / 6} L${x + (x - 100) / 14},235`, '#3a3340', 0.8, 0.8)).join('')}
        <path d="M89.5,145 L110.5,145 L111.5,154.5 Q100,158.5 88.5,154.5 Z" fill="#2a242f"/>
        ${line('M89.5,145.4 L110.5,145.4', '#4a4350', 1)}
        <path d="M100,160.5 C95.6,166.5 94,172.5 95.6,178.6 C96.8,183 103.2,183 104.4,178.6 C106,172.5 104.4,166.5 100,160.5 Z" fill="url(#${c.p}skin)"/>
        <path d="M100,160.5 C95.6,166.5 94,172.5 95.6,178.6 C96.8,183 103.2,183 104.4,178.6 C106,172.5 104.4,166.5 100,160.5 Z" fill="none" stroke="#141016" stroke-width="1"/>
        <circle cx="100" cy="158.4" r="2.6" fill="#fffaf2"/><circle cx="99.2" cy="157.6" r="1" fill="#fff"/>`,
      arm: () => `<path d="${SLEEVE_SHORT}" fill="#211c25"/>${line('M57.4,193.6 Q66,197 74.6,192.6', '#3a3340', 1.2)}`,
    },
  },
  tee_mandarin: {
    cat: 'top', name: 'Футболка «Мандаринка»', price: 900, rarity: 'common',
    desc: 'Белая футболка с принтом-мандаринкой. Привет из Абхазии!',
    draw: {
      torso: () => `
        <path d="${TOP_LOOSE}" fill="#fffdf8"/>
        ${shade('M66,166 C62,178 66,196 69,212 C71,226 72,240 71,254 L80,256 C76,222 74,190 78,160 Z', '#c9b9a8', 0.35)}
        <path d="M88,150 Q100,160 112,150" fill="none" stroke="#e8ddd0" stroke-width="2.4"/>
        <circle cx="100" cy="196" r="12" fill="#ff9a2e"/><circle cx="96" cy="192" r="3" fill="#ffc37a"/>
        <path d="M100,184 q4,-7 11,-6 q-4,6 -11,6 Z" fill="#4caf50"/><path d="M100,184 l-1,-4" stroke="#6d4c2f" stroke-width="1.4"/>`,
      arm: () => `<path d="${SLEEVE_SHORT}" fill="#fffdf8"/>${line('M57.4,193.6 Q66,197 74.6,192.6', '#e5dacd', 1.4)}`,
    },
  },
  sweater_pink: {
    cat: 'top', name: 'Свитер «Зефир»', price: 2200, rarity: 'common',
    desc: 'Уютный розовый свитер для московской осени.',
    draw: {
      torso: () => `
        <path d="${TOP_LOOSE}" fill="#f7a8c4"/>
        ${shade('M66,166 C62,178 66,196 69,212 C71,226 72,240 71,254 L80,256 C76,222 74,190 78,160 Z', '#c0577f', 0.3)}
        ${[80, 88, 96, 104, 112, 120].map((x) => line(`M${x},166 Q${x + 1},210 ${x},252`, '#e58aac', 1.6, 0.7)).join('')}
        <path d="M71,246 Q100,253 129,246 L129,256 Q100,262 71,256 Z" fill="#ef93b4"/>
        <path d="M87,149 Q100,161 113,149 L114,153 Q100,166 86,153 Z" fill="#ef93b4"/>`,
      arm: () => `<path d="${SLEEVE_LONG}" fill="#f7a8c4"/>${line('M60,180 Q61,215 60,245', '#e58aac', 1.4, 0.7)}<path d="M58.5,250 Q65,254 71.5,250 L71,258 Q65,261 59.5,258 Z" fill="#ef93b4"/>`,
    },
  },
  hoodie_msk: {
    cat: 'top', name: 'Худи «МСК»', price: 2800, rarity: 'common',
    desc: 'Лавандовое худи — пары в 9 утра переживаются легче.',
    draw: {
      back: () => `<path d="M76,150 Q100,132 124,150 L120,170 Q100,160 80,170 Z" fill="#a993d8"/>`,
      torso: () => `
        <path d="${TOP_LOOSE}" fill="#b9a6e6"/>
        ${shade('M66,166 C62,178 66,196 69,212 C71,226 72,240 71,254 L80,256 C76,222 74,190 78,160 Z', '#6c55a8', 0.3)}
        <path d="M84,150 Q100,170 116,150 Q116,160 100,168 Q84,160 84,150 Z" fill="#a993d8"/>
        ${line('M95,163 L94,186 M105,163 L106,186', '#fff', 1.3)}
        <circle cx="94" cy="187.5" r="1.6" fill="#fff"/><circle cx="106" cy="187.5" r="1.6" fill="#fff"/>
        <path d="M80,222 Q100,226 120,222 L118,240 Q100,243 82,240 Z" fill="#a993d8"/>
        <text x="100" y="208" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="13" fill="#fff">МСК</text>`,
      arm: () => `<path d="${SLEEVE_LONG}" fill="#b9a6e6"/><path d="M58.5,250 Q65,254 71.5,250 L71,258 Q65,261 59.5,258 Z" fill="#a993d8"/>`,
    },
  },
  shirt_white: {
    cat: 'top', name: 'Белая рубашка', price: 2500, rarity: 'common',
    desc: 'Классика для экзамена и для свидания.',
    draw: {
      torso: () => `
        <path d="${TOP_FIT}" fill="#fbfbff"/>
        ${shade('M68.5,166.5 C65.5,176 68.5,190 72.5,204 C75.5,216 78,226 79,237 L86,237 C82,214 78,190 80,160 Z', '#a9b0c9', 0.35)}
        <path d="M88,150 L100,170 L112,150 L108,146 L100,160 L92,146 Z" fill="#fff" stroke="#d9dcea" stroke-width="1"/>
        ${line('M100,170 L100,237', '#d9dcea', 1.2)}
        ${[180, 196, 212, 228].map((y) => `<circle cx="102.5" cy="${y}" r="1.3" fill="#c8cbe0"/>`).join('')}`,
      arm: () => `<path d="${SLEEVE_LONG}" fill="#fbfbff"/>${line('M60,190 Q62,220 60,246', '#d9dcea', 1.2)}<path d="M58.8,248 L71.5,248 L71,258 Q65,261 59.5,258 Z" fill="#f0f1fa" stroke="#d9dcea" stroke-width=".8"/>`,
    },
  },
  cami_satin: {
    cat: 'top', name: 'Атласный топ', price: 1900, rarity: 'rare',
    desc: 'Шампань-атлас на тонких бретелях.',
    defs: (c) => grad(`${c.p}satin`, '#f6e3c6', '#e2c79e', 'h'),
    draw: {
      torso: (c) => `
        <path d="M74,170 Q86,164 100,172 Q114,164 126,170 C130,184 127,196 126,206 C124,216 121,226 121,237 L79,237 C79,226 76,216 74,206 C73,196 70,184 74,170 Z" fill="url(#${c.p}satin)"/>
        ${line('M77,170 L82,155 M123,170 L118,155', '#e2c79e', 1.2)}
        ${line('M86,180 Q90,210 86,236 M112,182 Q108,210 113,236', '#fff', 1.4, 0.5)}`,
    },
  },
  breton: {
    cat: 'top', name: 'Тельняшка-лонгслив', price: 1700, rarity: 'common',
    desc: 'Морское настроение даже в метро.',
    draw: {
      torso: (c) => `
        <clipPath id="${c.p}bre"><path d="${TOP_FIT}"/></clipPath>
        <path d="${TOP_FIT}" fill="#fff"/>
        <g clip-path="url(#${c.p}bre)">${[160, 170, 180, 190, 200, 210, 220, 230].map((y) => `<rect x="60" y="${y}" width="80" height="4" fill="#23366b"/>`).join('')}</g>
        ${shade('M68.5,166.5 C65.5,176 68.5,190 72.5,204 C75.5,216 78,226 79,237 L86,237 C82,214 78,190 80,160 Z', '#23366b', 0.15)}
        <path d="M88,151 Q100,158 112,151" stroke="#23366b" stroke-width="2" fill="none"/>`,
      arm: (c) => `
        <clipPath id="${c.p}brea"><path d="${SLEEVE_LONG}"/></clipPath>
        <path d="${SLEEVE_LONG}" fill="#fff"/>
        <g clip-path="url(#${c.p}brea)">${[170, 180, 190, 200, 210, 220, 230, 240].map((y) => `<rect x="50" y="${y}" width="40" height="4" fill="#23366b"/>`).join('')}</g>`,
    },
  },
  scrubs_top: {
    cat: 'top', name: 'Медицинская форма', price: 1500, rarity: 'common', bonus: { lab: 0.25 },
    desc: 'Мятная форма зубного техника. +25% опыта на практике.',
    draw: {
      torso: () => `
        <path d="${TOP_LOOSE}" fill="#7fd3c4"/>
        ${shade('M66,166 C62,178 66,196 69,212 C71,226 72,240 71,254 L80,256 C76,222 74,190 78,160 Z', '#2f8c7d', 0.3)}
        <path d="M88,150 L100,174 L112,150 Z" fill="#f9d6c3"/>
        <path d="M88,150 L100,174 L112,150" fill="none" stroke="#5cb8a8" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="106" y="190" width="14" height="14" rx="2" fill="#6cc3b4"/>
        ${line('M110,186 L110,196', '#3a6fd8', 2)}${line('M114,187 L114,196', '#ff7aa2', 2)}
        <text x="85" y="200" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="9" fill="#fff">🦷</text>`,
      arm: () => `<path d="${SLEEVE_SHORT}" fill="#7fd3c4"/>`,
    },
  },
  cardigan: {
    cat: 'top', name: 'Кардиган с жемчугом', price: 3200, rarity: 'rare',
    desc: 'Кремовый кардиган с жемчужными пуговицами.',
    draw: {
      torso: () => `
        <path d="${TOP_FIT}" fill="#f4e7d3"/>
        ${shade('M68.5,166.5 C65.5,176 68.5,190 72.5,204 C75.5,216 78,226 79,237 L86,237 C82,214 78,190 80,160 Z', '#b29a77', 0.35)}
        <path d="M88,151 Q100,166 112,151" fill="#f9d6c3"/>
        <path d="M88,151 Q100,166 112,151" fill="none" stroke="#e8d6bc" stroke-width="3"/>
        ${line('M100,164 L100,237', '#e0cdb0', 1.6)}
        ${[172, 186, 200, 214, 228].map((y) => `<circle cx="100" cy="${y}" r="2.4" fill="#fffaf0" stroke="#e0cdb0" stroke-width=".6"/>`).join('')}
        ${[82, 90, 110, 118].map((x) => line(`M${x},170 L${x},234`, '#e8d9c2', 1.4, 0.8)).join('')}`,
      arm: () => `<path d="${SLEEVE_LONG}" fill="#f4e7d3"/>${line('M61,185 Q63,215 61,246', '#e8d9c2', 1.4)}`,
    },
  },

  // ------------------------------------------------------------------ BOTTOMS
  skirt_white: {
    cat: 'bottom', name: 'Белая мини-юбка', price: 0, rarity: 'signature',
    desc: 'Белоснежная юбка А-силуэта — как на любимом фото.',
    draw: {
      hip: () => `
        <path d="${SKIRT_MINI}" fill="#f8f5ef"/>
        ${shade('M80,233 C75,254 71,275 67,296 Q74,298 80,299 C80,276 82,254 85,233 Z', '#b9ae9c', 0.4)}
        ${shade('M120,233 C125,254 129,275 133,296 Q127,298 121,299 C121,276 118,254 115,233 Z', '#d7cfc1', 0.35)}
        ${line('M80.5,239 Q100,241 119.5,239', '#e2dacd', 1.1)}
        ${line('M95,245 Q94,272 92,300', '#e6dfd2', 1)}
        ${line('M108,245 Q109,272 111,300', '#e6dfd2', 1)}`,
    },
  },
  jeans: {
    cat: 'bottom', name: 'Джинсы прямые', price: 2600, rarity: 'common',
    desc: 'Голубые джинсы на каждый день.',
    longBottom: true,
    draw: {
      hip: () => `<path d="${PANTS_HIP}" fill="#6f9fd8"/>${line('M79.5,240 L120.5,240', '#4f7fbf', 1.4)}${line('M100,240 L100,262', '#4f7fbf', 1.2)}<circle cx="100" cy="236.6" r="1.6" fill="#d9b25a"/>`,
      leg: () => `<path d="${PANTS_LEG}" fill="#6f9fd8"/>${line('M84,300 Q87,350 88,405', '#8db6e6', 1.4, 0.8)}${line('M85.3,410 L97.3,410', '#4f7fbf', 1.2)}`,
    },
  },
  skirt_plaid: {
    cat: 'bottom', name: 'Юбка-плиссе в клетку', price: 2100, rarity: 'common',
    desc: 'Розовая клетка, как в дорамах.',
    draw: {
      hip: (c) => `
        <clipPath id="${c.p}plaid"><path d="M80,233 L120,233 C126,254 130,275 134,294 Q100,300 66,294 C70,275 74,254 80,233 Z"/></clipPath>
        <path d="M80,233 L120,233 C126,254 130,275 134,294 Q100,300 66,294 C70,275 74,254 80,233 Z" fill="#f6b7cb"/>
        <g clip-path="url(#${c.p}plaid)" opacity=".7">
          ${[70, 82, 94, 106, 118, 130].map((x) => `<rect x="${x}" y="230" width="4" height="70" fill="#d9668e"/>`).join('')}
          ${[246, 262, 278].map((y) => `<rect x="60" y="${y}" width="80" height="4" fill="#d9668e"/>`).join('')}
          ${[76, 88, 100, 112, 124].map((x) => line(`M${x},236 L${x + (x - 100) / 6},298`, '#c24f78', 1, 0.6)).join('')}
        </g>`,
    },
  },
  shorts_denim: {
    cat: 'bottom', name: 'Джинсовые шорты', price: 1400, rarity: 'common',
    desc: 'Для пляжа в Гагре и прогулок по набережной.',
    draw: {
      hip: () => `<path d="M79,233 L121,233 C124,246 126,258 127,272 Q100,276 73,272 C74,258 76,246 79,233 Z" fill="#7aa6dc"/>${line('M79.5,240 L120.5,240', '#5583c2', 1.4)}`,
      leg: () => `<path d="M78.4,252 C78,262 78.5,274 79,286 Q90,290 101,286 C101.5,274 101.8,262 101.5,252 Z" fill="#7aa6dc"/>${line('M79,284 Q90,288 101,284', '#eaf2ff', 1.6)}`,
    },
  },
  flare_black: {
    cat: 'bottom', name: 'Брюки-клёш', price: 2900, rarity: 'rare',
    desc: 'Чёрные брюки-клёш: стройнят и удлиняют.',
    longBottom: true,
    draw: {
      hip: () => `<path d="${PANTS_HIP}" fill="#26222b"/>${line('M79.5,239 L120.5,239', '#3d3744', 1.4)}`,
      leg: () => `<path d="${FLARE_LEG}" fill="#26222b"/>${line('M90,280 Q90,350 88,415', '#3d3744', 1.2)}`,
    },
  },
  scrubs_pants: {
    cat: 'bottom', name: 'Брюки медформы', price: 1100, rarity: 'common', bonus: { lab: 0.1 },
    desc: 'Мятные брюки в комплект к форме.',
    longBottom: true,
    draw: {
      hip: () => `<path d="${PANTS_HIP}" fill="#7fd3c4"/>`,
      leg: () => `<path d="${PANTS_LEG}" fill="#7fd3c4"/>${line('M84,300 Q87,350 88,405', '#a8e6db', 1.4)}`,
    },
  },
  skirt_satin: {
    cat: 'bottom', name: 'Атласная миди', price: 3100, rarity: 'rare',
    desc: 'Шалфейная юбка-миди, струится при ходьбе.',
    longBottom: true,
    defs: (c) => grad(`${c.p}sage`, '#c9dcc2', '#9fbf98', 'h'),
    draw: {
      hip: (c) => `<path d="M80,233 L120,233 C126,270 130,320 132,362 Q100,370 68,362 C70,320 74,270 80,233 Z" fill="url(#${c.p}sage)"/>
        ${line('M90,250 Q86,300 84,360 M108,250 Q113,300 116,360', '#e6f0e2', 1.6, 0.7)}`,
    },
  },

  // ------------------------------------------------------------------ DRESSES
  dress_mandarin: {
    cat: 'dress', name: 'Сарафан «Мандарины»', price: 3900, rarity: 'rare',
    desc: 'Белый сарафан с мандаринками. Лето в Сухуме!',
    draw: {
      torso: (c) => `
        <clipPath id="${c.p}dm"><path d="M75,168 Q100,176 125,168 C129,186 125,206 122,236 C130,260 136,282 140,306 Q100,316 60,306 C64,282 70,260 78,236 C75,206 71,186 75,168 Z"/></clipPath>
        <path d="M75,168 Q100,176 125,168 C129,186 125,206 122,236 C130,260 136,282 140,306 Q100,316 60,306 C64,282 70,260 78,236 C75,206 71,186 75,168 Z" fill="#fffaf2"/>
        <g clip-path="url(#${c.p}dm)">
          ${[[86, 190], [112, 200], [96, 222], [80, 258], [104, 262], [124, 280], [70, 292], [94, 296], [116, 306]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ff9a2e"/><path d="M${x},${y - 5} q3,-4 7,-3 q-3,4 -7,3 Z" fill="#4caf50"/>`).join('')}
        </g>
        ${line('M78,236 Q100,242 122,236', '#f0dcc4', 2.4)}
        ${line('M80,168 L84,152 M120,168 L116,152', '#fffaf2', 2.4)}`,
    },
  },
  dress_red: {
    cat: 'dress', name: 'Вечернее алое', price: 6900, rarity: 'epic',
    desc: 'Струящееся алое платье в пол — для особенного вечера.',
    longBottom: true,
    defs: (c) => grad(`${c.p}red`, '#e2364b', '#a6142b', 'h'),
    draw: {
      torso: (c) => `
        <path d="M74,168 Q100,180 126,168 C130,186 126,206 122,236 C126,290 132,350 140,424 Q100,434 60,424 C68,350 74,290 78,236 C74,206 70,186 74,168 Z" fill="url(#${c.p}red)"/>
        ${line('M86,250 Q82,330 74,420 M112,250 Q118,330 124,420', '#ff7182', 1.6, 0.6)}
        ${line('M77,168 L82,153 M123,168 L118,153', '#c41f35', 1.6)}`,
    },
  },
  dress_babydoll: {
    cat: 'dress', name: 'Платье с фонариками', price: 4200, rarity: 'rare',
    desc: 'Небесно-голубое платье с рукавами-фонариками.',
    draw: {
      torso: () => `
        <path d="M86,151 Q100,158 114,151 C124,156 130,162 131,170 C131,182 128,190 126,196 C134,230 140,262 142,290 Q100,302 58,290 C60,262 66,230 74,196 C72,190 69,182 69,170 C70,162 76,156 86,151 Z" fill="#a9d4f5"/>
        ${line('M74,196 Q100,202 126,196', '#fff', 2.4)}
        ${line('M86,210 Q80,250 72,288 M100,206 L100,296 M114,210 Q120,250 128,288', '#8cc0ea', 1.3)}
        <path d="M88,151 Q100,160 112,151" stroke="#fff" stroke-width="2" fill="none"/>`,
      arm: () => `<path d="${SLEEVE_PUFF}" fill="#a9d4f5"/>${line('M56,186 Q64,192 74,186', '#fff', 1.6)}`,
    },
  },
  dress_black: {
    cat: 'dress', name: 'Маленькое чёрное', price: 5200, rarity: 'epic',
    desc: 'Коко Шанель одобрила бы.',
    draw: {
      torso: () => `
        <path d="M76,166 Q100,176 124,166 C129,184 126,204 122,236 C126,256 130,276 133,294 Q100,302 67,294 C70,276 74,256 78,236 C74,204 71,184 76,166 Z" fill="#1d1a22"/>
        ${shade('M76,166 C71,184 74,204 78,236 C74,256 70,276 67,294 L80,297 C80,262 82,220 82,170 Z', '#000', 0.35)}
        ${line('M80,166 L86,152 M120,166 L114,152', '#1d1a22', 2)}
        ${line('M78,236 Q100,240 122,236', '#33303a', 1.2)}`,
    },
  },
  swimsuit: {
    cat: 'dress', name: 'Купальник «Коралл»', price: 2400, rarity: 'common', bonus: { beach: 0.3 },
    desc: 'Для Чёрного моря. +30% к радости на пляже.',
    draw: {
      torso: () => `
        <path d="M76,170 Q88,166 100,176 Q112,166 124,170 C128,186 124,206 121,226 C121,240 124,256 126,268 Q112,266 104,278 L96,278 Q88,266 74,268 C76,256 79,240 79,226 C76,206 72,186 76,170 Z" fill="#ff7f6e"/>
        ${line('M79,170 L84,154 M121,170 L116,154', '#ff7f6e', 2)}
        <path d="M80,212 Q100,220 120,212" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>
        ${line('M90,180 Q92,200 88,230', '#ffb3a7', 1.4, 0.7)}`,
    },
  },
  pajamas: {
    cat: 'dress', name: 'Пижама с сердечками', price: 1600, rarity: 'common', bonus: { sleep: 0.25 },
    desc: 'Спать в ней на 25% приятнее.',
    longBottom: true,
    draw: {
      hip: () => `<path d="${PANTS_HIP}" fill="#ffd3e1"/>`,
      leg: () => `<path d="${PANTS_LEG}" fill="#ffd3e1"/>${[290, 330, 370].map((y) => `<path d="M90,${y} c-2,-3 -6,0 0,5 c6,-5 2,-8 0,-5 Z" fill="#ff7aa2"/>`).join('')}`,
      torso: () => `
        <path d="${TOP_LOOSE}" fill="#ffd3e1"/>
        ${[[84, 180], [108, 172], [96, 204], [118, 214], [80, 232], [104, 240]].map(([x, y]) => `<path d="M${x},${y} c-2.5,-3.5 -7,0 0,6 c7,-6 2.5,-9.5 0,-6 Z" fill="#ff7aa2"/>`).join('')}
        <path d="M88,150 L100,166 L112,150" fill="none" stroke="#ff9cbc" stroke-width="2.4"/>`,
      arm: () => `<path d="${SLEEVE_LONG}" fill="#ffd3e1"/><path d="M60,210 c-2,-3 -6,0 0,5 c6,-5 2,-8 0,-5 Z" fill="#ff7aa2"/>`,
    },
  },
  dress_grad: {
    cat: 'dress', name: 'Платье выпускницы', price: 0, rarity: 'legendary', unlock: 'diploma',
    desc: 'Награда за диплом зубного техника. Нежное облако фатина.',
    longBottom: true,
    defs: (c) => grad(`${c.p}tulle`, '#ffe3ee', '#f7b6cf'),
    draw: {
      torso: (c) => `
        <path d="M76,166 Q100,176 124,166 C129,184 126,204 122,232 C138,290 150,360 156,428 Q100,442 44,428 C50,360 62,290 78,232 C74,204 71,184 76,166 Z" fill="url(#${c.p}tulle)"/>
        ${[60, 74, 88, 100, 112, 126, 140].map((x) => line(`M${100 + (x - 100) * 0.3},236 Q${x},330 ${x + (x - 100) * 0.4},428`, '#fff', 1.4, 0.55)).join('')}
        ${[[84, 300], [118, 330], [96, 370], [70, 400], [130, 396], [106, 300]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join('')}
        <path d="M78,232 Q100,240 122,232" stroke="#f08fb2" stroke-width="3" fill="none"/>
        <circle cx="122" cy="232" r="4" fill="#f08fb2"/>`,
    },
  },

  // ------------------------------------------------------------------ SHOES
  pumps_white: {
    cat: 'shoes', name: 'Белые лодочки', price: 0, rarity: 'signature', desc: 'Изящные белые туфли.',
    draw: shoe('#fbfbfb', `<path d="M86,431 Q91,434 96.6,431" stroke="#dcdcdc" stroke-width="1" fill="none"/>`),
  },
  sneakers: {
    cat: 'shoes', name: 'Белые кеды', price: 1800, rarity: 'common', desc: 'Удобно бегать на пары.', bonus: { run: 0.15 },
    draw: {
      leg: () => `<path d="M84.6,414 C83,424 82.5,431 83.4,437.4 Q91,442.4 98.8,437.4 C99.6,431 99.2,424 97.8,414 Z" fill="#fff" stroke="#d6d6e0" stroke-width=".8"/>
        <path d="M83.3,434 Q91,438.5 98.9,434 L98.8,437.4 Q91,442.4 83.4,437.4 Z" fill="#ff8fab"/>
        <path d="M87,419 l8,0 M86.6,423 l8.8,0 M86.4,427 l9.2,0" stroke="#c9c9d6" stroke-width="1"/>`,
    },
  },
  sandals: {
    cat: 'shoes', name: 'Сандалии', price: 1200, rarity: 'common', desc: 'Для набережной Сухума.',
    draw: {
      leg: () => `<path d="M85,436 Q91,440.6 97,436 L97.4,438.6 Q91,443 84.6,438.6 Z" fill="#a8703f"/>
        <path d="M86,424 L96.6,424 M85.6,431 L97,431" stroke="#a8703f" stroke-width="2.2" stroke-linecap="round"/>`,
    },
  },
  boots: {
    cat: 'shoes', name: 'Ботфорты', price: 4500, rarity: 'epic', desc: 'Чёрные высокие сапоги для московской зимы.',
    draw: {
      leg: () => `<path d="M83.4,340 C84.4,360 85.4,380 86,398 L85,437 Q91,442 97.6,437 L97.4,398 C98,380 98.6,360 99.6,340 Q91.5,336 83.4,340 Z" fill="#221e26"/>
        ${line('M88,350 Q89,390 88,430', '#4b4452', 1.6)}`,
    },
  },
  flats_pink: {
    cat: 'shoes', name: 'Розовые балетки', price: 1500, rarity: 'common', desc: 'С бантиками!',
    draw: shoe('#ffb3c8', `<path d="M88.5,424 l2.5,2 l2.5,-2 l-.2,4 l-2.3,-1.6 l-2.3,1.6 Z" fill="#ff7aa2"/>`),
  },
  slides: {
    cat: 'shoes', name: 'Шлёпки', price: 600, rarity: 'common', desc: 'Пляжная классика.',
    draw: {
      leg: () => `<path d="M85,437 Q91,441 97,437 L97.4,439.6 Q91,443.6 84.6,439.6 Z" fill="#55c2e8"/>
        <path d="M85.5,426 Q91,421 96.5,426 L96.8,431 Q91,428 85.2,431 Z" fill="#55c2e8"/>`,
    },
  },
  uggs: {
    cat: 'shoes', name: 'Угги', price: 3400, rarity: 'rare', desc: 'Тепло, мягко, по-домашнему.',
    draw: {
      leg: () => `<path d="M82.6,384 C83.4,400 83,420 82.6,437 Q91,443.2 99.8,437 C99.4,420 99,400 99.8,384 Q91,380 82.6,384 Z" fill="#d6b48c"/>
        <path d="M82.4,384 Q91,378 99.8,384 L99.8,390 Q91,385 82.6,390 Z" fill="#f4e6d2"/>`,
    },
  },

  // ------------------------------------------------------------------ ACCESSORIES
  studs: {
    cat: 'acc', slot: 'ears', name: 'Серьги-гвоздики', price: 0, rarity: 'signature', desc: 'Маленькие и сияющие.',
    draw: { head: () => `<circle cx="61.5" cy="103" r="2" fill="#fff8e1" stroke="#e8c97a" stroke-width=".7"/><circle cx="138.5" cy="103" r="2" fill="#fff8e1" stroke="#e8c97a" stroke-width=".7"/>` },
  },
  hoops: {
    cat: 'acc', slot: 'ears', name: 'Серьги-кольца', price: 1300, rarity: 'common', desc: 'Золотые кольца.',
    draw: { head: () => `<circle cx="61" cy="110" r="6" fill="none" stroke="#e8b84a" stroke-width="1.6"/><circle cx="139" cy="110" r="6" fill="none" stroke="#e8b84a" stroke-width="1.6"/>` },
  },
  pearl_drops: {
    cat: 'acc', slot: 'ears', name: 'Серьги с жемчугом', price: 2600, rarity: 'rare', desc: 'Жемчужные капли.',
    draw: { head: () => `<path d="M61.5,103 l0,6 M138.5,103 l0,6" stroke="#e8c97a" stroke-width="1"/><circle cx="61.5" cy="111.5" r="3" fill="#fffaf2" stroke="#e6dccb" stroke-width=".6"/><circle cx="138.5" cy="111.5" r="3" fill="#fffaf2" stroke="#e6dccb" stroke-width=".6"/>` },
  },
  bag_chain: {
    cat: 'acc', slot: 'hand', name: 'Сумочка на цепочке', price: 0, rarity: 'signature', desc: 'Чёрная стёганая сумочка.',
    draw: {
      front: (c) => `
        <path d="M80,160 Q104,200 134,246" fill="none" stroke="#d8b25a" stroke-width="1.6" stroke-dasharray="2.2 1.2"/>
        <rect x="124" y="242" width="28" height="20" rx="4" fill="#1c1a20"/>
        <clipPath id="${c.p}bagq"><rect x="124" y="242" width="28" height="20" rx="4"/></clipPath>
        <g clip-path="url(#${c.p}bagq)" stroke="#34303a" stroke-width=".9">${[-10, -2, 6, 14, 22, 30].map((d) => `<path d="M${124 + d},242 l20,20 M${144 + d},242 l-20,20"/>`).join('')}</g>
        <rect x="124" y="242" width="28" height="7" rx="3" fill="#25222a"/>
        <rect x="135" y="246.5" width="6" height="4" rx="1" fill="#e5c26c"/>`,
    },
  },
  bag_tote: {
    cat: 'acc', slot: 'hand', name: 'Шопер «Сухум»', price: 900, rarity: 'common', desc: 'Холщовая сумка с пальмой.',
    draw: {
      front: () => `<path d="M128,206 Q136,190 144,206" fill="none" stroke="#d9cbb1" stroke-width="2"/>
        <path d="M122,206 L150,206 L154,250 L118,250 Z" fill="#f2e8d5"/>
        <path d="M136,242 q-2,-12 1,-24 M137,218 q-8,-2 -12,4 M137,218 q8,-2 12,4 M137,218 q-4,-6 -10,-6 M137,218 q4,-6 10,-6" stroke="#4caf50" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    },
  },
  sunglasses: {
    cat: 'acc', slot: 'eyes', name: 'Солнцезащитные очки', price: 1600, rarity: 'common', desc: 'Кошачий глаз, как у звезды.',
    draw: {
      face: () => `<path d="M68,90 Q83,84 97,90 Q96,104 84,106 Q71,104 68,90 Z M103,90 Q117,84 132,90 Q129,104 116,106 Q104,104 103,90 Z" fill="#1d1a22" opacity=".92"/>
        <path d="M97,92 Q100,89 103,92" stroke="#1d1a22" stroke-width="2" fill="none"/>
        <path d="M73,92 l8,-3 M108,92 l8,-3" stroke="#fff" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>`,
    },
  },
  glasses: {
    cat: 'acc', slot: 'eyes', name: 'Очки-отличницы', price: 1100, rarity: 'common', desc: '+10% к опыту на парах.', bonus: { study: 0.1 },
    draw: { face: () => `<circle cx="83" cy="96" r="13" fill="#fff" fill-opacity=".12" stroke="#b07a52" stroke-width="2"/><circle cx="117" cy="96" r="13" fill="#fff" fill-opacity=".12" stroke="#b07a52" stroke-width="2"/><path d="M96,95 Q100,92 104,95" stroke="#b07a52" stroke-width="2" fill="none"/>` },
  },
  headband: {
    cat: 'acc', slot: 'head', name: 'Ободок с бантом', price: 800, rarity: 'common', desc: 'Розовый бантик.',
    draw: {
      head: () => `<path d="M58,82 Q62,38 100,34 Q138,38 142,82" fill="none" stroke="#ff8fab" stroke-width="5" stroke-linecap="round"/>
        <g transform="translate(122,42) rotate(25)"><path d="M0,0 C-8,-9 -16,-5 -14,2 C-12,8 -5,5 0,1 C5,5 12,8 14,2 C16,-5 8,-9 0,0 Z" fill="#ff8fab"/><circle r="3" fill="#ff6f96"/></g>`,
    },
  },
  beanie: {
    cat: 'acc', slot: 'head', name: 'Шапка с помпоном', price: 1400, rarity: 'common', desc: 'Для московской зимы.',
    draw: {
      head: () => `<path d="M54,80 C52,44 74,22 100,22 C126,22 148,44 146,80 Z" fill="#fff1e0"/>
        ${[66, 78, 90, 102, 114, 126, 136].map((x) => `<path d="M${x},${30 + Math.abs(100 - x) / 3} L${x},78" stroke="#ead6bd" stroke-width="2"/>`).join('')}
        <rect x="52" y="70" width="96" height="14" rx="7" fill="#ffcf9e"/>
        <circle cx="100" cy="18" r="11" fill="#ffcf9e"/><circle cx="96" cy="14" r="3.4" fill="#fff" opacity=".5"/>`,
    },
  },
  flower: {
    cat: 'acc', slot: 'head', name: 'Цветок мандарина', price: 700, rarity: 'common', desc: 'Белый цветок мандарина за ушком.',
    draw: {
      head: () => `<g transform="translate(64,64)">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="4" ry="8" transform="rotate(${a}) translate(0,-7)" fill="#fffdf6" stroke="#f1e6cf" stroke-width=".6"/>`).join('')}<circle r="3.4" fill="#ffc94a"/></g>
        <g transform="translate(74,56) scale(.7)">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="4" ry="8" transform="rotate(${a}) translate(0,-7)" fill="#fffdf6" stroke="#f1e6cf" stroke-width=".6"/>`).join('')}<circle r="3.4" fill="#ffc94a"/></g>`,
    },
  },
  tiara: {
    cat: 'acc', slot: 'head', name: 'Диадема', price: 0, rarity: 'legendary', unlock: 'allQuests', desc: 'За прохождение всех заданий. Принцесса!',
    draw: {
      head: () => `<path d="M72,46 L80,30 L88,42 L100,22 L112,42 L120,30 L128,46 Q100,38 72,46 Z" fill="#ffd86b" stroke="#e0a92c" stroke-width="1"/>
        <circle cx="100" cy="30" r="3" fill="#ff7aa2"/><circle cx="80" cy="36" r="2" fill="#7fd3ff"/><circle cx="120" cy="36" r="2" fill="#7fd3ff"/>`,
    },
  },
  pearls: {
    cat: 'acc', slot: 'neck', name: 'Жемчужное колье', price: 3600, rarity: 'rare', desc: 'Нитка жемчуга.',
    draw: {
      front: () => {
        let s = '';
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          const x = 88 + 24 * t;
          const y = 151 + Math.sin(Math.PI * t) * 9;
          s += `<circle cx="${x}" cy="${y}" r="2" fill="#fffaf2" stroke="#e6dccb" stroke-width=".5"/>`;
        }
        return s;
      },
    },
  },
  heart_necklace: {
    cat: 'acc', slot: 'neck', name: 'Кулон-сердечко', price: 0, rarity: 'legendary', unlock: 'loveLetter', desc: 'Подарок от любимого ❤',
    draw: {
      front: () => `<path d="M88,150 Q100,166 112,150" fill="none" stroke="#e8c97a" stroke-width=".9"/>
        <path d="M100,165 c-3,-4.5 -9,-1 0,6.5 c9,-7.5 3,-11 0,-6.5 Z" fill="#ff4f7b" stroke="#e8c97a" stroke-width=".7"/>`,
    },
  },
  scarf: {
    cat: 'acc', slot: 'neck', name: 'Вязаный шарф', price: 1200, rarity: 'common', desc: 'Тёплый красный шарф.',
    draw: {
      front: () => `<path d="M82,148 Q100,162 118,148 L120,158 Q100,174 80,158 Z" fill="#e2414f"/>
        <path d="M108,158 L114,200 L104,202 L100,162 Z" fill="#d23140"/>
        ${[192, 196, 200].map((y) => `<path d="M${104 + (y - 192) / 3},${y} l10,0" stroke="#f47f8a" stroke-width="1"/>`).join('')}`,
    },
  },
};

// Hair and makeup are bought in the "salon" and live in separate catalogues.
export const SALON = {
  hairStyle: {
    long: { price: 0 }, waves: { price: 1500 }, ponytail: { price: 800 }, bun: { price: 800 },
    braids: { price: 1200 }, bob: { price: 2000 }, halfup: { price: 1000 },
  },
  hairColor: { chestnut: { price: 0 }, chocolate: { price: 1800 }, honey: { price: 2200 }, black: { price: 1800 }, copper: { price: 2400 }, pink: { price: 3000 }, platinum: { price: 3500 } },
  lips: { nude: { price: 0 }, rose: { price: 500 }, berry: { price: 600 }, red: { price: 700 }, peach: { price: 500 } },
};

export const CATEGORIES = [
  { id: 'top', name: 'Верх', icon: '👚' },
  { id: 'bottom', name: 'Низ', icon: '👗' },
  { id: 'dress', name: 'Платья', icon: '💃' },
  { id: 'shoes', name: 'Обувь', icon: '👠' },
  { id: 'acc', name: 'Аксессуары', icon: '👜' },
  { id: 'hairStyle', name: 'Причёска', icon: '💇‍♀️' },
  { id: 'hairColor', name: 'Цвет волос', icon: '🎨' },
  { id: 'lips', name: 'Помада', icon: '💄' },
];

export const DEFAULT_OUTFIT = {
  top: 'top_keyhole',
  bottom: 'skirt_white',
  dress: null,
  shoes: 'pumps_white',
  acc: ['studs'],
  hairStyle: 'long',
  hairColor: 'chestnut',
  lips: 'nude',
};

export const RARITY = {
  signature: { name: 'Фирменное', color: '#ff7aa2' },
  common: { name: 'Обычное', color: '#8aa0b8' },
  rare: { name: 'Редкое', color: '#4fa3ff' },
  epic: { name: 'Эпическое', color: '#a76cff' },
  legendary: { name: 'Легендарное', color: '#ffb02e' },
};
