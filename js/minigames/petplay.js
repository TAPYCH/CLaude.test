// Pet game: the pet catches falling treats.
import { createCatcher, drawEmoji } from './catcher.js';
import { PET_TYPES, renderPet } from '../art/pets.js';
import { S } from '../core/state.js';

const TREATS = {
  cat: ['🐟', '🦐', '🧶'],
  corgi: ['🦴', '🍖', '🎾'],
  hamster: ['🌻', '🥜', '🌽'],
  bunny: ['🥕', '🥬', '🍓'],
  parrot: ['🌻', '🍎', '🫐'],
};

export default {
  id: 'petplay',
  title: 'Вкусняшки для питомца',
  icon: '🐾',
  scoreLabel: 'вкусняшек',
  howto: 'Помоги питомцу поймать вкусняшки!\nВеди пальцем влево-вправо. Уворачивайся от пылесоса 🌀',
  create(api) {
    const pet = S.pets.find((p) => p.id === S.activePet) || S.pets[0];
    const type = pet ? pet.type : 'cat';
    const t = TREATS[type] || TREATS.cat;
    return createCatcher(api, {
      duration: 30,
      icon: PET_TYPES[type].emoji,
      thresholds: [10, 18, 26],
      catcherSvg: renderPet(type),
      catcherW: 120,
      catcherH: 112,
      background(ctx, W, H) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#ffe6f0');
        g.addColorStop(1, '#fff4e6');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffd6e4';
        for (let i = 0; i < 12; i++) {
          ctx.beginPath();
          ctx.arc((i * 97) % W, (i * 151) % (H * 0.8), 30 + (i % 3) * 10, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#e2b384';
        ctx.fillRect(0, H * 0.86, W, H * 0.14);
      },
      items: [
        { weight: 40, points: 1, r: 20, draw: (c, x, y, r) => drawEmoji(c, t[0], x, y, r) },
        { weight: 30, points: 1, r: 20, draw: (c, x, y, r) => drawEmoji(c, t[1], x, y, r) },
        { weight: 8, points: 3, r: 22, sfx: 'coin', draw: (c, x, y, r) => drawEmoji(c, t[2], x, y, r) },
        { weight: 12, points: 0, bad: true, stun: 0.8, r: 22, spin: true, draw: (c, x, y, r) => drawEmoji(c, '🌀', x, y, r) },
      ],
      hint: `${pet ? pet.name : 'Питомец'} хочет вкусняшек! Веди влево-вправо`,
    });
  },
};
