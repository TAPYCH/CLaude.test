// «Мандариновый дождь» — catch mandarins with a basket in grandma's garden.
import { createCatcher, drawMandarin, drawBee } from './catcher.js';
import { renderLanaHead } from '../art/character.js';
import { S } from '../core/state.js';

function basketSvg() {
  const head = renderLanaHead({ outfit: S.outfit, expr: 'happy', viewBox: '44 22 112 140' })
    .replace('<svg ', '<svg x="38" y="-6" width="84" height="104" ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 150">
    ${head}
    <path d="M10,80 L150,80 L132,146 L28,146 Z" fill="#c98b5a"/>
    <path d="M10,80 L150,80" stroke="#a8703f" stroke-width="10" stroke-linecap="round"/>
    ${[96, 112, 128].map((y) => `<path d="M${16 + (y - 80) * 0.25},${y} L${144 - (y - 80) * 0.25},${y}" stroke="#a8703f" stroke-width="3"/>`).join('')}
    ${[30, 50, 70, 90, 110, 130].map((x) => `<path d="M${x},82 L${x + (80 - x) * 0.1},144" stroke="#a8703f" stroke-width="3"/>`).join('')}
    <path d="M24,80 Q80,10 136,80" fill="none" stroke="#a8703f" stroke-width="6" opacity=".0"/>
  </svg>`;
}

function background(ctx, W, H, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#8fd3ff');
  g.addColorStop(0.6, '#d9f1ff');
  g.addColorStop(1, '#bfe8a4');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // mountains
  ctx.fillStyle = '#b6cde6';
  ctx.beginPath();
  ctx.moveTo(0, H * 0.55);
  for (let i = 0; i <= 8; i++) ctx.lineTo((W / 8) * i, H * (0.38 + ((i * 37) % 7) / 40));
  ctx.lineTo(W, H * 0.55);
  ctx.fill();
  ctx.fillStyle = '#8ccf72';
  ctx.fillRect(0, H * 0.82, W, H * 0.18);
  // tree canopy along the top
  for (let i = -1; i < 7; i++) {
    const x = (W / 6) * i + 30;
    ctx.fillStyle = i % 2 ? '#3f9152' : '#4ca862';
    ctx.beginPath();
    ctx.arc(x, 10, 90, 0, Math.PI * 2);
    ctx.fill();
    for (let k = 0; k < 3; k++) drawMandarin(ctx, x - 40 + k * 40, 60 + (k % 2) * 16 + Math.sin(t * 2 + i) * 2, 11);
  }
}

export default {
  id: 'mandarins',
  title: 'Мандариновый дождь',
  icon: '🍊',
  scoreLabel: 'мандаринов',
  howto: 'Лови мандарины корзиной — веди пальцем влево-вправо.\n✨ Золотой мандарин = +5\n🐝 Пчела оглушает, 🟤 гнилой отнимает очки.\n8 подряд — двойные очки!',
  create(api) {
    return createCatcher(api, {
      duration: 45,
      icon: '🍊',
      thresholds: [18, 32, 48],
      catcherSvg: basketSvg(),
      catcherW: 160,
      catcherH: 150,
      catcherScale: 1.05,
      background,
      items: [
        { kind: 'm', weight: 70, points: 1, r: 20, draw: (c, x, y, r) => drawMandarin(c, x, y, r) },
        { kind: 'g', weight: 5, points: 5, r: 22, sfx: 'coin', draw: (c, x, y, r) => drawMandarin(c, x, y, r, true) },
        { kind: 'b', weight: 12, points: 0, bad: true, stun: 1.0, r: 18, zigzag: true, spin: false, speed: 0.8, draw: (c, x, y, r, t) => drawBee(c, x, y, r, t) },
        { kind: 'r', weight: 10, points: -2, bad: true, r: 19, draw: (c, x, y, r) => drawMandarin(c, x, y, r, false, true) },
      ],
    });
  },
};
