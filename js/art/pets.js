// Pet portraits — chubby, big-eyed, sitting front view. viewBox 0 0 120 110, paws at y≈104.

const eyes = (lx, rx, y, r = 7.5, col = '#2b1d26') => `
  <g class="pet-eyes">
    <ellipse cx="${lx}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="${col}"/><ellipse cx="${rx}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="${col}"/>
    <circle cx="${lx - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/><circle cx="${rx - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.38}" fill="#fff"/>
    <circle cx="${lx + r * 0.35}" cy="${y + r * 0.4}" r="${r * 0.16}" fill="#fff"/><circle cx="${rx + r * 0.35}" cy="${y + r * 0.4}" r="${r * 0.16}" fill="#fff"/>
  </g>`;
const blush = (lx, rx, y) => `<ellipse cx="${lx}" cy="${y}" rx="6" ry="3.6" fill="#ff8fab" opacity=".55"/><ellipse cx="${rx}" cy="${y}" rx="6" ry="3.6" fill="#ff8fab" opacity=".55"/>`;
const shadow = `<ellipse cx="60" cy="105" rx="34" ry="5" fill="#000" opacity=".14"/>`;

export const PET_TYPES = {
  cat: {
    acc: 'котика', name: 'Котик', price: 2500, food: 1, emoji: '🐱', sound: 'purr',
    desc: 'Рыжий мурлыка. Сильно поднимает настроение.',
    bonus: { fun: 1.3 },
    defaultName: 'Персик',
    draw: () => `${shadow}
      <g class="pet-tail"><path d="M84,92 C110,90 112,60 100,52 C96,50 94,54 97,57 C104,66 100,82 82,84 Z" fill="#ff9f4a"/><path d="M100,52 C96,50 94,54 97,57 C99,60 101,62 102,64 C104,60 104,55 100,52 Z" fill="#fff4e6"/></g>
      <path d="M32,104 C26,80 36,58 60,58 C84,58 94,80 88,104 Z" fill="#ffa552"/>
      <path d="M46,104 C44,86 50,72 60,72 C70,72 76,86 74,104 Z" fill="#fff4e6"/>
      <ellipse cx="46" cy="102" rx="9" ry="6" fill="#fff4e6"/><ellipse cx="74" cy="102" rx="9" ry="6" fill="#fff4e6"/>
      <g class="pet-head">
        <path d="M24,30 L30,4 L50,22 Z" fill="#ffa552"/><path d="M96,30 L90,4 L70,22 Z" fill="#ffa552"/>
        <path d="M30,24 L32,10 L44,22 Z" fill="#ffc3cf"/><path d="M90,24 L88,10 L76,22 Z" fill="#ffc3cf"/>
        <ellipse cx="60" cy="40" rx="38" ry="32" fill="#ffad5e"/>
        <path d="M52,10 q8,8 0,16 M60,8 l0,16 M68,10 q-8,8 0,16" stroke="#e8822e" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M22,40 l10,2 M22,48 l10,-1 M98,40 l-10,2 M98,48 l-10,-1" stroke="#e8822e" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="60" cy="54" rx="16" ry="11" fill="#fff4e6"/>
        ${eyes(45, 75, 40)}${blush(36, 84, 52)}
        <path d="M57,49 L63,49 L60,53 Z" fill="#ff7a9a"/>
        <path d="M60,53 q-4,5 -8,2 M60,53 q4,5 8,2" stroke="#8a4a3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M44,56 l-16,-2 M44,59 l-15,3 M76,56 l16,-2 M76,59 l15,3" stroke="#fff" stroke-width="1.2" opacity=".9"/>
      </g>`,
  },
  corgi: {
    acc: 'корги', name: 'Корги', price: 4000, food: 2, emoji: '🐶', sound: 'woof',
    desc: 'Королевская улыбка и короткие лапки. Любит прогулки.',
    bonus: { fitness: 1.3 },
    defaultName: 'Бублик',
    draw: () => `${shadow}
      <g class="pet-tail"><ellipse cx="92" cy="86" rx="12" ry="8" fill="#e98b3a"/></g>
      <path d="M30,104 C24,82 36,60 60,60 C84,60 96,82 90,104 Z" fill="#f09a4a"/>
      <path d="M44,104 C42,86 50,70 60,70 C70,70 78,86 76,104 Z" fill="#fff8ee"/>
      <rect x="38" y="94" width="14" height="12" rx="6" fill="#fff8ee"/><rect x="68" y="94" width="14" height="12" rx="6" fill="#fff8ee"/>
      <g class="pet-head">
        <path d="M26,34 L22,0 L48,20 Z" fill="#f09a4a"/><path d="M94,34 L98,0 L72,20 Z" fill="#f09a4a"/>
        <path d="M30,26 L28,8 L42,20 Z" fill="#ffd0c0"/><path d="M90,26 L92,8 L78,20 Z" fill="#ffd0c0"/>
        <ellipse cx="60" cy="42" rx="36" ry="30" fill="#f4a356"/>
        <path d="M60,14 C54,30 48,40 46,58 L74,58 C72,40 66,30 60,14 Z" fill="#fff8ee"/>
        <ellipse cx="60" cy="56" rx="20" ry="13" fill="#fff8ee"/>
        ${eyes(44, 76, 40, 7)}${blush(34, 86, 52)}
        <ellipse cx="60" cy="50" rx="6" ry="4.5" fill="#2b1d26"/><circle cx="58" cy="48.5" r="1.4" fill="#fff"/>
        <path d="M60,54 q-5,6 -10,2 M60,54 q5,6 10,2" stroke="#2b1d26" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path class="pet-tongue" d="M56,58 q4,10 8,0 Z" fill="#ff7a9a"/>
      </g>`,
  },
  hamster: {
    acc: 'хомячка', name: 'Хомячок', price: 900, food: 0.5, emoji: '🐹', sound: 'pop',
    desc: 'Круглый пушистый комочек. Ест совсем чуть-чуть.',
    bonus: {},
    defaultName: 'Пончик',
    draw: () => `${shadow}
      <g class="pet-head">
        <circle cx="34" cy="42" r="12" fill="#e9a66a"/><circle cx="86" cy="42" r="12" fill="#e9a66a"/>
        <circle cx="34" cy="42" r="6" fill="#ffc9d6"/><circle cx="86" cy="42" r="6" fill="#ffc9d6"/>
        <path d="M18,100 C10,70 30,40 60,40 C90,40 110,70 102,100 Q60,112 18,100 Z" fill="#f4b878"/>
        <path d="M34,100 C30,80 44,64 60,64 C76,64 90,80 86,100 Q60,108 34,100 Z" fill="#fff5ea"/>
        <ellipse cx="32" cy="74" rx="16" ry="14" fill="#fff5ea"/><ellipse cx="88" cy="74" rx="16" ry="14" fill="#fff5ea"/>
        ${eyes(46, 74, 62, 6)}${blush(36, 84, 76)}
        <ellipse cx="60" cy="72" rx="3.5" ry="2.6" fill="#ff8fab"/>
        <path d="M60,74 q-3,4 -6,2 M60,74 q3,4 6,2" stroke="#8a4a3a" stroke-width="1.4" fill="none"/>
        <ellipse cx="50" cy="96" rx="5" ry="4" fill="#ffc9d6"/><ellipse cx="70" cy="96" rx="5" ry="4" fill="#ffc9d6"/>
      </g>`,
  },
  bunny: {
    acc: 'кролика', name: 'Кролик', price: 1800, food: 1, emoji: '🐰', sound: 'pop',
    desc: 'Белоснежный пушистик. Делает дом уютнее.',
    bonus: { energy: 1.15 },
    defaultName: 'Зефирка',
    draw: () => `${shadow}
      <g class="pet-tail"><circle cx="90" cy="94" r="9" fill="#fff"/></g>
      <path d="M30,104 C24,80 36,58 60,58 C84,58 96,80 90,104 Z" fill="#fbf8ff"/>
      <ellipse cx="44" cy="102" rx="10" ry="6" fill="#fff"/><ellipse cx="76" cy="102" rx="10" ry="6" fill="#fff"/>
      <g class="pet-head">
        <g class="pet-ears"><ellipse cx="46" cy="10" rx="9" ry="26" fill="#fbf8ff" transform="rotate(-10 46 30)"/><ellipse cx="74" cy="10" rx="9" ry="26" fill="#fbf8ff" transform="rotate(12 74 30)"/>
        <ellipse cx="46" cy="12" rx="4.5" ry="18" fill="#ffc9d6" transform="rotate(-10 46 30)"/><ellipse cx="74" cy="12" rx="4.5" ry="18" fill="#ffc9d6" transform="rotate(12 74 30)"/></g>
        <ellipse cx="60" cy="46" rx="32" ry="27" fill="#fff"/>
        ${eyes(47, 73, 44, 6.5)}${blush(38, 82, 55)}
        <path d="M57,52 L63,52 L60,55.5 Z" fill="#ff8fab"/>
        <path d="M60,55.5 q-3,5 -7,2 M60,55.5 q3,5 7,2" stroke="#8a6a7a" stroke-width="1.5" fill="none"/>
        <rect x="57.5" y="58" width="5" height="4" rx="1" fill="#fff" stroke="#e8dde6" stroke-width=".8"/>
      </g>`,
  },
  parrot: {
    acc: 'попугайчика', name: 'Неразлучник', price: 1500, food: 0.5, emoji: '🦜', sound: 'catch',
    desc: 'Яркий попугайчик. Учит слова и болтает с Ланой.',
    bonus: { social: 1.3 },
    defaultName: 'Кеша',
    draw: () => `${shadow}
      <g class="pet-tail"><path d="M54,90 L46,108 L62,108 L66,92 Z" fill="#2fa86a"/><path d="M60,92 L58,108 L68,106 L68,92 Z" fill="#4fb8e8"/></g>
      <path d="M50,104 l-2,4 M54,104 l0,4 M66,104 l0,4 M70,104 l2,4" stroke="#e89a6a" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="60" cy="74" rx="26" ry="32" fill="#58c97a"/>
      <path d="M36,70 C30,90 44,104 54,100 C46,92 42,82 44,68 Z" fill="#3fae64"/><path d="M84,70 C90,90 76,104 66,100 C74,92 78,82 76,68 Z" fill="#3fae64"/>
      <ellipse cx="60" cy="84" rx="14" ry="16" fill="#b5ec9c"/>
      <g class="pet-head">
        <circle cx="60" cy="40" r="26" fill="#ff9a6a"/>
        <path d="M34,44 C36,62 84,62 86,44 C80,56 40,56 34,44 Z" fill="#58c97a"/>
        <path d="M44,22 C50,12 70,12 76,22 C68,18 52,18 44,22 Z" fill="#ff7a4a"/>
        ${eyes(48, 72, 38, 5.5)}
        <path d="M54,46 C54,40 66,40 66,46 C66,54 62,58 60,58 C58,58 54,54 54,46 Z" fill="#ffe08a"/>
        <path d="M56,50 Q60,54 64,50" stroke="#d9a840" stroke-width="1.2" fill="none"/>
        ${blush(40, 80, 48)}
      </g>`,
  },
};

export function renderPet(type, { cls = '' } = {}) {
  const t = PET_TYPES[type];
  if (!t) return '';
  return `<svg class="pet-svg ${cls}" viewBox="0 0 120 112" xmlns="http://www.w3.org/2000/svg">${t.draw()}</svg>`;
}
