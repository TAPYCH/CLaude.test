// Jobs, ranks and the own-lab equipment catalogue.

export const BARISTA_RANKS = [
  { name: 'Стажёр', shifts: 0, charm: 1, pay: 900 },
  { name: 'Бариста', shifts: 3, charm: 2, pay: 1300 },
  { name: 'Старший бариста', shifts: 8, charm: 4, pay: 1800 },
  { name: 'Управляющая сменой', shifts: 15, charm: 6, pay: 2600 },
];

export const LAB_RENT = 25000;

export const EQUIPMENT = [
  { id: 'sign', name: 'Вывеска «Lana Dental»', icon: '🪧', price: 3000, bonus: 0.1, desc: 'Клиенты находят тебя: +10% к оплате заказов' },
  { id: 'plants', name: 'Уютная зона ожидания', icon: '🪴', price: 2500, bonus: 0.05, desc: 'Диван и растения: +5% и +настроение на кофе-брейке' },
  { id: 'microscope', name: 'Стереомикроскоп', icon: '🔬', price: 5000, bonus: 0.15, desc: 'Тонкая моделировка: +15% к оплате, легче точность' },
  { id: 'coffee', name: 'Кофемашина', icon: '☕', price: 4000, bonus: 0.1, desc: 'Клиенты довольны: +10%, кофе-брейк бодрит сильнее' },
  { id: 'furnace', name: 'Печь для керамики', icon: '🔥', price: 9000, bonus: 0.25, desc: 'Свои керамические коронки: +25% к оплате' },
  { id: 'mill', name: 'Фрезер CAD/CAM', icon: '⚙️', price: 14000, bonus: 0.35, desc: 'Цифровая лаборатория: +35% к оплате и +4 с к моделировке' },
];

export const STIPEND = { base: 2500, high: 4000, min: 50, highMin: 80 };
export const RENT = 1800;
