// Room decor for the dorm: visible in the scene, each piece makes rest a little better.
export const DECOR = [
  { id: 'plant_monstera', name: 'Монстера в горшке', icon: '🪴', price: 1800, desc: 'Живой уголок у батареи. Сон и отдых дают больше настроения' },
  { id: 'poster_sea', name: 'Постер «Сухум, море»', icon: '🖼️', price: 1200, desc: 'Кусочек дома на стене общаги' },
  { id: 'lamp_moon', name: 'Лампа-луна', icon: '🌙', price: 2200, desc: 'Тёплый свет на шкафу — уютные вечера' },
  { id: 'rug_heart', name: 'Ковёр-сердце', icon: '💗', price: 2500, desc: 'Мягкий и очень розовый' },
  { id: 'bedding_silk', name: 'Шёлковое покрывало', icon: '✨', price: 3000, desc: 'Лавандовое, со звёздами. Сон бодрит сильнее' },
];

/** New Year decorations appear on their own from 20 December to 10 January. */
export function isNewYear(day) {
  const d = new Date(Date.UTC(2025, 8, 1) + day * 864e5);
  const m = d.getUTCMonth();
  const dd = d.getUTCDate();
  return (m === 11 && dd >= 20) || (m === 0 && dd <= 10);
}
