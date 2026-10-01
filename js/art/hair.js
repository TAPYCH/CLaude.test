// Hairstyles. Each style draws a `back` layer (behind body) and a `front` layer (over face).
// ctx: { p: gradient id prefix, hair: { base, dark, light, shine } }

const capSide =
  'M55,108 C51,66 66,32 100,25.5 C135,29 151,62 146.5,108 L140,106 C139.5,88 133.5,73 121,65.5 C107,59.5 94,55 86.5,40 C80,53 70.5,63 66.5,80 C64.5,90 63.5,100 63,108 Z';
const swoop = 'M86.5,40 C95,53 108,59 121,63.5 C132,67.5 138.5,80 140,98 C135,84 125,74.5 112,70 C100,66 91,56 86.5,40 Z';

const sideLockL = 'M63,76 C54,100 54.5,130 57.5,160 C59.5,186 57.5,207 53,227 C62,219 70.5,198 72,172 C74,142 71,112 67.5,90 Z';
const sideLockR =
  'M136.5,78 C146.5,101 146.5,136 142.5,166 C140.5,190 142.5,212 147.5,231 C138,221 129,199 128,173 C127,143 130,113 133.5,92 Z';

function shine(ctx, d, w = 3, o = 0.45) {
  return `<path d="${d}" fill="none" stroke="${ctx.hair.shine}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
}
function strand(ctx, d, o = 0.35) {
  return `<path d="${d}" fill="none" stroke="${ctx.hair.dark}" stroke-width="1.1" stroke-linecap="round" opacity="${o}"/>`;
}

export const HAIRSTYLES = {
  long: {
    name: 'Длинные прямые',
    back: (c) => `
      <path d="M100,29 C67,29 51.5,52 51.5,86 C51.5,121 55,161 50.5,201 C48.5,222 50.5,240 54,256 Q60,250 66,262 Q72,252 80,264 Q88,254 96,262 Q100,256 104,262 Q112,254 120,264 Q128,252 134,262 Q140,250 146,256 C149.5,240 151.5,222 149.5,201 C145,161 148.5,121 148.5,86 C148.5,52 133,29 100,29 Z" fill="url(#${c.p}hairSide)"/>
      <path d="M78,150 Q100,170 122,150 L122,240 Q100,250 78,240 Z" fill="${c.hair.dark}" opacity=".55"/>`,
    front: (c) => `
      <path d="${sideLockL}" fill="url(#${c.p}hairSide)"/>
      <path d="${sideLockR}" fill="url(#${c.p}hairSide)"/>
      <path d="${capSide}" fill="url(#${c.p}hair)"/>
      <path d="${swoop}" fill="url(#${c.p}hair)"/>
      ${shine(c, 'M66,64 Q78,40 102,33', 3.5)}
      ${shine(c, 'M98,50 Q112,62 130,70', 2.2, 0.35)}
      ${strand(c, 'M83,37 C77,49 69,60 62,80')}
      ${strand(c, 'M90,48 C100,60 116,66 132,78')}
      ${strand(c, 'M96,44 C110,52 126,58 140,74', 0.25)}
      ${strand(c, 'M62,110 Q58,150 60,195', 0.3)}
      ${strand(c, 'M139,112 Q144,150 141,200', 0.3)}
      ${shine(c, 'M64,120 Q61,150 63,180', 1.6, 0.35)}
      ${shine(c, 'M137,124 Q140,152 138,184', 1.6, 0.3)}`,
  },

  waves: {
    name: 'Локоны',
    back: (c) => `
      <path d="M100,28 C64,28 49,52 49,86 C47,110 54,126 48,146 C43,166 54,180 47,200 C42,220 52,236 50,252 C58,266 80,268 100,262 C120,268 142,266 150,252 C148,236 158,220 153,200 C146,180 157,166 152,146 C146,126 153,110 151,86 C151,52 136,28 100,28 Z" fill="url(#${c.p}hairSide)"/>
      <path d="M78,150 Q100,170 122,150 L124,244 Q100,254 76,244 Z" fill="${c.hair.dark}" opacity=".55"/>`,
    front: (c) => `
      <path d="M63,76 C52,96 60,112 54,132 C49,150 60,162 55,180 C51,196 60,208 52,226 C64,222 72,206 70,190 C68,172 76,162 72,146 C68,128 74,110 67,92 Z" fill="url(#${c.p}hairSide)"/>
      <path d="M137,78 C148,98 140,114 146,134 C151,152 140,164 145,182 C149,198 140,210 148,230 C136,224 128,208 130,192 C132,174 124,164 128,148 C132,130 126,112 133,94 Z" fill="url(#${c.p}hairSide)"/>
      <path d="${capSide}" fill="url(#${c.p}hair)"/>
      <path d="${swoop}" fill="url(#${c.p}hair)"/>
      ${shine(c, 'M66,64 Q78,40 102,33', 3.5)}
      ${shine(c, 'M58,140 q6,10 0,20 M141,140 q-6,10 0,20', 1.8, 0.35)}
      ${strand(c, 'M83,37 C77,49 69,60 62,80')}
      ${strand(c, 'M90,48 C100,60 116,66 132,78')}`,
  },

  ponytail: {
    name: 'Высокий хвост',
    back: (c) => `
      <path d="M104,34 C136,22 154,52 150,96 C147,132 157,168 146,206 C140,222 132,230 126,236 C132,206 130,176 132,146 C134,110 128,70 106,50 Z" fill="url(#${c.p}hairSide)"/>
      <path d="M100,32 C72,32 58,52 58,84 L58,108 L142,108 L142,84 C142,52 128,32 100,32 Z" fill="${c.hair.base}"/>`,
    front: (c) => `
      <path d="M57,100 C53,66 68,33 100,29 C132,33 147,66 143,100 C140,78 128,60 112,55 C100,52 88,54 80,58 C68,66 60,80 57,100 Z" fill="url(#${c.p}hair)"/>
      <path d="M64,82 C58,96 60,110 64,122 C66,108 66,96 68,86 Z M136,82 C142,96 140,110 136,122 C134,108 134,96 132,86 Z" fill="${c.hair.base}"/>
      <ellipse cx="110" cy="33" rx="9" ry="6" fill="#ff8fab"/>
      <path d="M103,31 q7,4 14,0" stroke="#e86d90" stroke-width="1.4" fill="none"/>
      ${shine(c, 'M70,58 Q84,38 108,36', 3.2)}
      ${strand(c, 'M80,58 Q92,44 108,40', 0.3)}
      ${strand(c, 'M120,58 Q112,46 108,40', 0.3)}`,
  },

  bun: {
    name: 'Пучок',
    back: (c) => `
      <path d="M100,32 C72,32 58,52 58,84 L58,108 L142,108 L142,84 C142,52 128,32 100,32 Z" fill="${c.hair.base}"/>`,
    front: (c) => `
      <circle cx="100" cy="22" r="19" fill="url(#${c.p}hairSide)"/>
      <path d="M86,16 Q100,4 114,18 M86,26 Q100,14 114,28 M90,34 Q100,26 110,34" fill="none" stroke="${c.hair.dark}" stroke-width="1.3" opacity=".45"/>
      ${shine(c, 'M88,10 Q98,5 106,8', 2.4, 0.5)}
      <path d="M57,100 C53,66 68,36 100,32 C132,36 147,66 143,100 C140,78 128,62 112,57 C100,54 88,56 80,60 C68,68 60,80 57,100 Z" fill="url(#${c.p}hair)"/>
      <path d="M86,38 q14,-6 28,0" stroke="#ffd6a5" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M64,80 C57,98 60,116 66,128 C66,112 66,98 69,88 Z M136,80 C143,98 140,116 134,128 C134,112 134,98 131,88 Z" fill="${c.hair.base}"/>
      ${shine(c, 'M70,62 Q84,44 108,42', 3)}`,
  },

  braids: {
    name: 'Две косы',
    back: (c) => `
      <path d="M100,30 C70,30 56,52 56,86 L56,128 L144,128 L144,86 C144,52 130,30 100,30 Z" fill="${c.hair.base}"/>`,
    front: (c) => {
      const braid = (x, dir) => {
        let s = '';
        for (let i = 0; i < 8; i++) {
          const y = 120 + i * 15;
          const off = (i % 2 ? 2.5 : -2.5) * dir;
          s += `<ellipse cx="${x + off}" cy="${y}" rx="${9 - i * 0.35}" ry="9" fill="url(#${c.p}hairSide)" stroke="${c.hair.dark}" stroke-width=".8"/>`;
        }
        s += `<circle cx="${x}" cy="241" r="4" fill="#ff8fab"/><path d="M${x - 5},245 q5,14 10,0 Z" fill="${c.hair.base}"/>`;
        return s;
      };
      return `${braid(66, 1)}${braid(134, -1)}
      <path d="M56,108 C52,68 68,32 100,28 C132,32 148,68 144,108 L138,110 C136,82 124,60 100,50 C76,60 64,82 62,110 Z" fill="url(#${c.p}hair)"/>
      <path d="M100,30 L100,50" stroke="${c.hair.dark}" stroke-width="1.6" opacity=".6"/>
      ${shine(c, 'M70,64 Q80,44 96,38', 3)}${shine(c, 'M130,64 Q120,44 104,38', 3)}`;
    },
  },

  bob: {
    name: 'Каре',
    back: (c) => `
      <path d="M100,29 C66,29 51,52 51,88 C51,112 52,130 56,146 Q78,152 100,150 Q122,152 144,146 C148,130 149,112 149,88 C149,52 134,29 100,29 Z" fill="url(#${c.p}hairSide)"/>`,
    front: (c) => `
      <path d="M62,80 C54,100 53,124 56,144 Q64,148 72,146 C70,126 70,106 68,90 Z" fill="url(#${c.p}hairSide)"/>
      <path d="M137,80 C146,100 147,124 144,144 Q136,148 128,146 C130,126 130,106 132,90 Z" fill="url(#${c.p}hairSide)"/>
      <path d="${capSide}" fill="url(#${c.p}hair)"/>
      <path d="${swoop}" fill="url(#${c.p}hair)"/>
      ${shine(c, 'M66,64 Q78,40 102,33', 3.5)}
      ${strand(c, 'M83,37 C77,49 69,60 62,80')}
      ${strand(c, 'M90,48 C100,60 116,66 132,78')}`,
  },

  halfup: {
    name: 'Мальвинка',
    back: (c) => HAIRSTYLES.long.back(c),
    front: (c) => `
      ${HAIRSTYLES.long.front(c)}
      <path d="M70,52 Q100,40 130,52" stroke="#fff" stroke-width="0" fill="none"/>
      <g transform="translate(100,30)">
        <path d="M0,0 C-10,-10 -22,-6 -18,4 C-14,10 -6,6 0,2 C6,6 14,10 18,4 C22,-6 10,-10 0,0 Z" fill="#fff" stroke="#f0c9d6" stroke-width="1"/>
        <circle cx="0" cy="1" r="3.6" fill="#ffd1e0"/>
      </g>`,
  },
};
