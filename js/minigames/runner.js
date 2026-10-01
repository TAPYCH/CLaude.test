// «Опаздываю на пары!» — side-scrolling runner through Moscow streets.
import { svgImage, roundRect } from './framework.js';
import { renderLana } from '../art/character.js';
import { moscowSkyline } from '../art/scenes/common.js';
import { S } from '../core/state.js';

const GOAL = 1200; // metres to the college

function frames() {
  const o = { ...S.outfit };
  const mk = (pose) => svgImage(renderLana({ outfit: o, expr: 'excited', pose }));
  return {
    a: mk({ legL: 24, legR: -22, armL: -26, armR: 24 }),
    b: mk({ legL: -22, legR: 24, armL: 24, armR: -26 }),
    jump: mk({ legL: 30, legR: -10, armL: 120, armR: -120 }),
    hurt: svgImage(renderLana({ outfit: o, expr: 'surprised', pose: { armL: 60, armR: -60 } })),
  };
}

export default {
  id: 'runner',
  title: 'Опаздываю на пары!',
  icon: '🏃‍♀️',
  scoreLabel: 'очков',
  howto: 'До колледжа 1,2 км, а пара через 5 минут!\nТапни — прыжок, тапни ещё раз в воздухе — двойной прыжок.\nСобирай ☕, перепрыгивай лужи и самокаты!',
  create(api) {
    const { ctx } = api;
    const F = frames();
    const sky = svgImage(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -440 820 450">${moscowSkyline(0, 0, 1, '#c6cfe8')}</svg>`);
    let t = 0;
    let dist = 0;
    let speed = 260;
    let y = 0; // height above ground (px)
    let vy = 0;
    let jumps = 0;
    let hearts = 3;
    let inv = 0;
    let coins = 0;
    let obstacles = [];
    let cups = [];
    let nextObs = 1.2;
    let nextCup = 0.6;
    let pops = [];
    let done = false;

    const ground = () => api.H * 0.8;
    const lanaH = () => Math.min(api.H * 0.3, 260);
    const lanaX = () => api.W * 0.22;

    function jump() {
      if (jumps >= 2 || done) return;
      vy = jumps === 0 ? 820 : 720;
      jumps++;
      api.sfx('pop');
    }

    const OBS = [
      { k: 'puddle', w: 90, h: 14, draw: (x, gy, o) => { ctx.fillStyle = '#7fb8e6'; ctx.beginPath(); ctx.ellipse(x + o.w / 2, gy + 4, o.w / 2, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(x + o.w * 0.3, gy + 1, o.w * 0.25, 3); } },
      { k: 'scooter', w: 56, h: 70, draw: (x, gy) => { ctx.strokeStyle = '#3b4a5a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 10, gy - 8); ctx.lineTo(x + 46, gy - 8); ctx.lineTo(x + 40, gy - 70); ctx.lineTo(x + 26, gy - 70); ctx.stroke(); ctx.fillStyle = '#3fcfae'; ctx.fillRect(x + 4, gy - 14, 50, 8); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x + 10, gy - 6, 7, 0, 7); ctx.arc(x + 46, gy - 6, 7, 0, 7); ctx.fill(); } },
      { k: 'cone', w: 34, h: 50, draw: (x, gy) => { ctx.fillStyle = '#ff7a3c'; ctx.beginPath(); ctx.moveTo(x + 17, gy - 50); ctx.lineTo(x + 32, gy); ctx.lineTo(x + 2, gy); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(x + 9, gy - 28, 16, 7); ctx.fillStyle = '#ff7a3c'; ctx.fillRect(x - 2, gy - 4, 38, 6); } },
      { k: 'pigeons', w: 70, h: 30, draw: (x, gy, o) => { for (let i = 0; i < 3; i++) { const px = x + i * 22; const py = gy - 12 - (i % 2) * 4 + Math.sin(t * 12 + i) * 2; ctx.fillStyle = '#9aa4b8'; ctx.beginPath(); ctx.ellipse(px + 10, py, 12, 9, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(px + 20, py - 8, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#ffb02e'; ctx.fillRect(px + 25, py - 9, 5, 3); } } },
    ];

    function drawCity() {
      const W = api.W;
      const H = api.H;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#9fd8ff');
      g.addColorStop(1, '#ffe3ee');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      if (sky.complete) {
        const sw = H * 0.9;
        const off = -((dist * 0.6) % sw);
        for (let x = off; x < W; x += sw) ctx.drawImage(sky, x, ground() - sw * 0.55, sw, sw * 0.55);
      }
      // mid buildings
      const bw = 140;
      const off2 = -((dist * 2.2) % (bw * 4));
      const cols = ['#f6c9b0', '#c9d9f2', '#f2e3b8', '#e2d1ff'];
      for (let i = -1; i < W / bw + 2; i++) {
        const x = off2 + i * bw;
        const idx = Math.abs(Math.floor((dist * 2.2) / bw) + i) % 4;
        const h = 140 + (idx * 37) % 90;
        ctx.fillStyle = cols[idx];
        ctx.fillRect(x, ground() - h, bw - 10, h);
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        for (let wy = ground() - h + 16; wy < ground() - 30; wy += 30) for (let wx = x + 12; wx < x + bw - 30; wx += 30) ctx.fillRect(wx, wy, 16, 18);
      }
      // sidewalk
      ctx.fillStyle = '#d8d0dc';
      ctx.fillRect(0, ground(), W, H - ground());
      ctx.fillStyle = '#c4bccb';
      const tile = 60;
      const off3 = -((dist * 4) % tile);
      for (let x = off3; x < W; x += tile) ctx.fillRect(x, ground(), 3, H - ground());
      ctx.fillStyle = '#bfb6c6';
      ctx.fillRect(0, ground(), W, 6);
    }

    return {
      start() {
        api.hint('Тапни, чтобы прыгнуть!');
        setTimeout(() => api.hint(null), 2200);
      },
      update(dt) {
        if (done) return;
        t += dt;
        speed = Math.min(560, 260 + t * 9);
        const dx = speed * dt;
        dist += dx / 4; // pixels → "metres"
        // physics
        vy -= 2300 * dt;
        y += vy * dt;
        if (y <= 0) {
          y = 0;
          vy = 0;
          jumps = 0;
        }
        if (inv > 0) inv -= dt;
        // spawn
        nextObs -= dt;
        if (nextObs <= 0) {
          const def = OBS[Math.floor(Math.random() * OBS.length)];
          obstacles.push({ def, x: api.W + 40, w: def.w, h: def.h });
          nextObs = Math.max(0.75, 1.7 - t * 0.02) * (0.7 + Math.random() * 0.7);
        }
        nextCup -= dt;
        if (nextCup <= 0) {
          const hgt = [20, 110, 190][Math.floor(Math.random() * 3)];
          for (let i = 0; i < 3; i++) cups.push({ x: api.W + 40 + i * 46, h: hgt + (i === 1 ? 14 : 0) });
          nextCup = 1.4 + Math.random() * 1.2;
        }
        for (const o of obstacles) o.x -= dx;
        for (const c of cups) c.x -= dx;
        obstacles = obstacles.filter((o) => o.x > -120);
        cups = cups.filter((c) => c.x > -40 && !c.got);
        // collisions
        const lx = lanaX();
        const lw = lanaH() * 0.28;
        const gy = ground();
        for (const o of obstacles) {
          if (o.hit) continue;
          const overlapX = o.x < lx + lw / 2 && o.x + o.w > lx - lw / 2;
          if (overlapX && y < o.h - 4 && inv <= 0) {
            o.hit = true;
            hearts--;
            inv = 1.2;
            api.sfx('bad');
            api.vibrate(60);
            pops.push({ x: lx, y: gy - lanaH() - y, text: '💔', life: 1 });
          }
        }
        for (const c of cups) {
          if (Math.abs(c.x - lx) < lw && Math.abs(gy - c.h - (gy - y - lanaH() * 0.5)) < lanaH() * 0.5) {
            c.got = true;
            coins++;
            api.sfx('catch');
            pops.push({ x: c.x, y: gy - c.h - 20, text: '+1', life: 0.8 });
          }
        }
        for (const p of pops) {
          p.y -= 60 * dt;
          p.life -= dt;
        }
        pops = pops.filter((p) => p.life > 0);
        api.setStats([`☕ ${coins}`, `${'❤️'.repeat(Math.max(0, hearts))}${'🤍'.repeat(3 - Math.max(0, hearts))}`, `📍 ${Math.max(0, Math.round(GOAL - dist))} м`]);
        if (hearts <= 0 || dist >= GOAL) {
          done = true;
          const finished = dist >= GOAL;
          const score = coins + (finished ? 20 : 0) + Math.max(0, hearts) * 5;
          const stars = !finished ? (coins >= 10 ? 1 : 0) : hearts >= 3 && coins >= 22 ? 3 : hearts >= 2 || coins >= 15 ? 2 : 1;
          setTimeout(() => api.end({ score, coins, stars, title: finished ? 'Успела к паре! 🎉' : 'Опоздала…', text: `Кофе собрано: ${coins} · сердечек осталось: ${Math.max(0, hearts)}` }), 400);
        }
      },
      draw() {
        drawCity();
        const gy = ground();
        for (const o of obstacles) o.def.draw(o.x, gy, o);
        for (const c of cups) {
          const cy = gy - c.h;
          ctx.fillStyle = '#fff';
          roundRect(ctx, c.x - 11, cy - 14, 22, 26, 5);
          ctx.fill();
          ctx.fillStyle = '#ff8fab';
          ctx.fillRect(c.x - 11, cy - 4, 22, 8);
          ctx.fillStyle = '#6b3a22';
          roundRect(ctx, c.x - 13, cy - 19, 26, 7, 3);
          ctx.fill();
        }
        // progress bar to the college
        const bw = api.W * 0.6;
        const bx = (api.W - bw) / 2;
        const by = api.H * 0.93;
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        roundRect(ctx, bx, by, bw, 10, 5);
        ctx.fill();
        ctx.fillStyle = '#9a7bff';
        roundRect(ctx, bx, by, bw * Math.min(1, dist / GOAL), 10, 5);
        ctx.fill();
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎓', bx + bw + 16, by + 12);
        // Lana
        const h = lanaH();
        const w = h * (200 / 450);
        const img = inv > 0.8 ? F.hurt : y > 0 ? F.jump : Math.floor(t * 9) % 2 ? F.a : F.b;
        if (img.complete) {
          ctx.save();
          if (inv > 0) ctx.globalAlpha = 0.55 + Math.sin(t * 40) * 0.35;
          ctx.drawImage(img, lanaX() - w / 2, gy - h - y + h * 0.03, w, h);
          ctx.restore();
        }
        ctx.fillStyle = 'rgba(0,0,0,.12)';
        ctx.beginPath();
        ctx.ellipse(lanaX(), gy + 4, w * 0.3 * Math.max(0.4, 1 - y / 300), 5, 0, 0, 7);
        ctx.fill();
        ctx.font = '900 22px Nunito, sans-serif';
        for (const p of pops) {
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = '#fff';
          ctx.fillText(p.text, p.x, p.y);
        }
        ctx.globalAlpha = 1;
      },
      pointerdown() {
        jump();
      },
      key(k, down) {
        if (down && (k === ' ' || k === 'ArrowUp' || k === 'w')) jump();
      },
    };
  },
};
